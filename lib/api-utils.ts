import { randomUUID } from "crypto";
import { redactSecrets, validatePromptGuard } from "./security";

export type ParsedJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; response: Response };

/**
 * Validates `Content-Type: application/json`, enforces a strict byte ceiling,
 * and parses a JSON request body safely.
 *
 * @param req - Incoming HTTP Request.
 * @param maxBytes - Maximum allowed payload size in bytes.
 * @returns Parsed JSON value or a ready-to-return HTTP 400/413/415 Response.
 */
export async function parseJsonBodyWithLimit(
  req: Request,
  maxBytes: number
): Promise<ParsedJsonResult> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: Response.json(
        { error: "Content-Type must be application/json." },
        { status: 415 }
      ),
    };
  }

  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      ok: false,
      response: Response.json(
        { error: `Request payload exceeds ${maxBytes} byte limit.` },
        { status: 413 }
      ),
    };
  }

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON payload." }, { status: 400 }),
    };
  }

  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return {
      ok: false,
      response: Response.json(
        { error: `Request payload exceeds ${maxBytes} byte limit.` },
        { status: 413 }
      ),
    };
  }

  try {
    return { ok: true, data: JSON.parse(rawText) as unknown };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON payload." }, { status: 400 }),
    };
  }
}

/**
 * Evaluates one or more user-supplied text fields against prompt injection and XSS guardrails.
 *
 * @param texts - Array of text strings to check.
 * @returns An HTTP 422 Response if any text fails validation, otherwise `null`.
 */
export function guardUserTexts(texts: string[]): Response | null {
  for (const text of texts) {
    if (!text) continue;
    const guard = validatePromptGuard(text);
    if (!guard.safe) {
      return Response.json(
        {
          error: `Prompt validation failed: ${guard.reason || "Adversarial or unsupported input patterns detected."}`,
        },
        { status: 422 }
      );
    }
  }
  return null;
}

/**
 * Generates an `HttpOnly`, `SameSite=Lax` session cookie header value for visitor quota tracking.
 *
 * @param req - Incoming HTTP Request used to determine HTTPS context.
 * @returns Formatted `Set-Cookie` header value.
 */
export function createSessionCookieHeader(req: Request): string {
  const uid = `sp_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
  const isHttps =
    req.url.startsWith("https://") ||
    req.headers.get("x-forwarded-proto") === "https";
  const secureFlag =
    process.env.NODE_ENV === "production" && isHttps ? "; Secure" : "";
  return `saasproof_uid=${uid}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${secureFlag}`;
}

/**
 * Logs redacted diagnostics server-side and returns a sanitized client-safe message.
 *
 * @param contextLabel - Log tag identifying the route.
 * @param err - Caught unknown error.
 * @param fallbackMessage - Safe generic message exposed to clients.
 * @returns Safe client error string.
 */
export function sanitizeServerError(
  contextLabel: string,
  err: unknown,
  fallbackMessage: string
): string {
  const raw = err instanceof Error ? err.message : String(err);
  const redacted = redactSecrets(raw);
  console.error(`[${contextLabel}]`, redacted);
  return fallbackMessage;
}
