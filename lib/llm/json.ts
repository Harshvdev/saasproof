import { z } from "zod";

/**
 * Sanitizes and extracts JSON substring from raw LLM responses, stripping markdown code fences.
 *
 * @param raw - The raw text output from an LLM model which may contain markdown code fences.
 * @returns Clean string ready for JSON parsing.
 */
export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

/**
 * Parses and validates raw JSON text against a Zod schema, automatically unwrapping
 * single-key wrapper objects occasionally emitted by LLMs.
 *
 * @param raw - Raw text returned by an LLM.
 * @param schema - Zod schema to validate against.
 * @returns Strictly typed and validated payload.
 */
export function parseStructuredResponse<T>(raw: string, schema: z.ZodType<T>): T {
  const jsonStr = extractJsonText(raw);
  const parsed: unknown = JSON.parse(jsonStr);
  const direct = schema.safeParse(parsed);
  if (direct.success) return direct.data;

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const entries: unknown[] = Object.values(parsed);
    if (entries.length === 1 && entries[0] && typeof entries[0] === "object") {
      const unwrapped = schema.safeParse(entries[0]);
      if (unwrapped.success) return unwrapped.data;
    }
  }

  throw direct.error;
}

/**
 * Formats Zod or standard Error objects into concise diagnostic summaries.
 *
 * @param error - Unknown thrown value.
 * @returns Human-readable diagnostic message.
 */
export function formatLlmError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * Extracts a concise status error summary from a failed HTTP API response.
 *
 * @param status - HTTP status code.
 * @param errText - Raw response text body.
 * @returns Formatted status message.
 */
export function parseApiError(status: number, errText: string): string {
  try {
    const parsed: unknown = JSON.parse(errText);
    if (
      parsed &&
      typeof parsed === "object" &&
      "error" in parsed &&
      parsed.error &&
      typeof parsed.error === "object" &&
      "message" in parsed.error &&
      typeof parsed.error.message === "string"
    ) {
      return `HTTP ${status}: ${parsed.error.message}`;
    }
  } catch {
    // Non-JSON error body
  }
  return `HTTP ${status}${errText ? `: ${errText.slice(0, 120)}` : ""}`;
}
