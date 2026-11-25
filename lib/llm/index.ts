import { z } from "zod";
import { callGemini, resetGeminiCache } from "./gemini";
import { callGroq, resetGroqCache } from "./groq";
import { formatLlmError, parseStructuredResponse } from "./json";

export { extractJsonText } from "./json";

/**
 * Generates and validates structured JSON from an LLM model with automatic fallback
 * between Gemini and Groq, enforcing Zod schema validation and self-healing retries.
 *
 * @param opts - Object containing systemPrompt, userPrompt, Zod schema, schemaHint, and optional AbortSignal.
 * @returns Object with parsed schema data and provider name indicator.
 */
export async function generateStructuredJSON<T>(opts: {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  schemaHint: string;
  signal?: AbortSignal;
}): Promise<{ data: T; provider: "Gemini" | "Groq" }> {
  const fullSystem = `${opts.systemPrompt}

CRITICAL OUTPUT RULE:
Return ONLY valid JSON matching this exact shape (no markdown, no commentary):
${opts.schemaHint}`;

  try {
    const raw = await callGemini(fullSystem, opts.userPrompt, true, opts.signal);
    return { data: parseStructuredResponse(raw, opts.schema), provider: "Gemini" };
  } catch (geminiErr) {
    if (opts.signal?.aborted) throw geminiErr;

    let lastGroqErr: unknown;
    let promptForAttempt = opts.userPrompt;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      try {
        const raw = await callGroq(fullSystem, promptForAttempt, true, opts.signal);
        return { data: parseStructuredResponse(raw, opts.schema), provider: "Groq" };
      } catch (err) {
        lastGroqErr = err;
        const detail = formatLlmError(err);
        promptForAttempt = `${opts.userPrompt}\n\nVALIDATION FIX NEEDED (${detail}): Return ONE flat JSON object containing EVERY top-level key shown in the schema, with concise 1-2 sentence strings so nothing gets omitted.`;
      }
    }
    throw new Error(
      `Both Gemini and Groq failed. Gemini: ${formatLlmError(geminiErr)} | Groq: ${formatLlmError(lastGroqErr)}`
    );
  }
}

/**
 * Generates natural language chat responses for Co-Pilot conversational inquiries,
 * falling back seamlessly between Gemini and Groq providers.
 *
 * @param opts - Object containing systemPrompt, userPrompt, and optional AbortSignal.
 * @returns Object with generated response text and active provider string.
 */
export async function generateChatReply(opts: {
  systemPrompt: string;
  userPrompt: string;
  signal?: AbortSignal;
}): Promise<{ text: string; provider: "Gemini" | "Groq" }> {
  try {
    const text = await callGemini(opts.systemPrompt, opts.userPrompt, false, opts.signal);
    return { text, provider: "Gemini" };
  } catch (geminiErr) {
    if (opts.signal?.aborted) throw geminiErr;
    try {
      const text = await callGroq(opts.systemPrompt, opts.userPrompt, false, opts.signal);
      return { text, provider: "Groq" };
    } catch (groqErr) {
      throw new Error(
        `Both Gemini and Groq failed. Gemini: ${formatLlmError(geminiErr)} | Groq: ${formatLlmError(groqErr)}`
      );
    }
  }
}

/**
 * Resets internal LLM key and model caches for isolated testing.
 */
export function resetLlmCaches(): void {
  resetGeminiCache();
  resetGroqCache();
}
