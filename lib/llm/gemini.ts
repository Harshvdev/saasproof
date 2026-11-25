import { combineSignal } from "../abort";
import { hashIdentifier } from "../security";
import { parseApiError } from "./json";

const GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"] as const;
const MAX_INVALID_CACHE = 32;

const invalidGeminiCache = new Map<string, { message: string; until: number }>();

function recordInvalidKey(keyHash: string, message: string): void {
  const now = Date.now();
  for (const [k, v] of invalidGeminiCache) {
    if (now >= v.until) invalidGeminiCache.delete(k);
  }
  if (invalidGeminiCache.size >= MAX_INVALID_CACHE) {
    const oldest = invalidGeminiCache.keys().next().value;
    if (oldest) invalidGeminiCache.delete(oldest);
  }
  invalidGeminiCache.set(keyHash, {
    message,
    until: now + 2 * 60 * 1000,
  });
}

/**
 * Executes a completion request against Gemini models with automatic fallback across tiers.
 *
 * @param systemPrompt - System instructions.
 * @param userPrompt - User prompt payload.
 * @param jsonMode - Whether to request `application/json` response MIME type.
 * @param signal - Optional parent AbortSignal.
 * @returns Generated text response.
 */
export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Primary LLM credentials not configured");
  }

  const keyHash = hashIdentifier(apiKey);
  const cachedInvalid = invalidGeminiCache.get(keyHash);
  if (cachedInvalid && Date.now() < cachedInvalid.until) {
    throw new Error(cachedInvalid.message);
  }

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.35,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  let lastError = "Gemini request failed";

  for (const model of GEMINI_MODELS) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: combineSignal(14000, signal),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      lastError = `Gemini ${model} ${parseApiError(res.status, errText)}`;
      if (res.status === 404 || res.status === 429 || res.status === 503) {
        continue;
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        break;
      }
      throw new Error(lastError);
    }

    const data: unknown = await res.json();
    if (data && typeof data === "object" && "candidates" in data && Array.isArray(data.candidates)) {
      const first = data.candidates[0] as { content?: { parts?: Array<{ text?: unknown }> } } | undefined;
      const text = first?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.length > 0) {
        return text;
      }
    }
  }

  if (lastError.includes("API key not valid") || lastError.includes("HTTP 401")) {
    recordInvalidKey(keyHash, lastError);
  }

  throw new Error(lastError);
}

/**
 * Clears Gemini invalid-key cache (used in unit tests).
 */
export function resetGeminiCache(): void {
  invalidGeminiCache.clear();
}
