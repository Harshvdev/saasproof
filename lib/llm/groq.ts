import { combineSignal } from "../abort";
import { hashIdentifier } from "../security";
import { parseApiError } from "./json";

const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-20b",
] as const;

const EXCLUDED_MODEL_SUBSTRINGS = [
  "whisper",
  "guard",
  "tts",
  "safeguard",
  "compound",
  "orpheus",
  "playai",
  "allam",
  "embed",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const groqCooldownUntil = new Map<string, number>();
let groqPoolCache: { keyHash: string; models: string[]; until: number } | null = null;
let groqDiscoveryInFlight: Promise<string[]> | null = null;
let groqCursor = 0;

function pruneCooldowns(now: number): void {
  for (const [model, until] of groqCooldownUntil) {
    if (now >= until) groqCooldownUntil.delete(model);
  }
}

function parseRetryDelayMs(errText: string, retryAfterHeader: string | null): number {
  const secMatch = errText.match(/try again in\s*([\d.]+)s/i);
  if (secMatch?.[1]) {
    return Math.min(Math.max(Math.ceil(parseFloat(secMatch[1]) * 1000) + 350, 800), 12000);
  }
  const msMatch = errText.match(/try again in\s*([\d.]+)ms/i);
  if (msMatch?.[1]) {
    return Math.min(Math.max(Math.ceil(parseFloat(msMatch[1])) + 350, 800), 12000);
  }
  if (retryAfterHeader) {
    const sec = Number(retryAfterHeader);
    if (Number.isFinite(sec) && sec > 0) {
      return Math.min(Math.max(Math.ceil(sec * 1000) + 350, 800), 12000);
    }
  }
  return 3500;
}

async function discoverGroqModels(apiKey: string, signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: combineSignal(10000, signal),
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!data || typeof data !== "object" || !("data" in data) || !Array.isArray(data.data)) {
      return [];
    }
    return data.data
      .map((m) => (m && typeof m === "object" && "id" in m && typeof m.id === "string" ? m.id : ""))
      .filter((id) => id.length > 0 && !EXCLUDED_MODEL_SUBSTRINGS.some((sub) => id.includes(sub)));
  } catch {
    return [];
  }
}

async function getGroqModelPool(apiKey: string, signal?: AbortSignal): Promise<string[]> {
  const keyHash = hashIdentifier(apiKey);
  if (groqPoolCache && groqPoolCache.keyHash === keyHash && Date.now() < groqPoolCache.until) {
    return groqPoolCache.models;
  }

  if (!groqDiscoveryInFlight) {
    groqDiscoveryInFlight = discoverGroqModels(apiKey, signal)
      .then((discovered) => {
        const merged = Array.from(new Set([...GROQ_MODELS, ...discovered]));
        groqPoolCache = {
          keyHash,
          models: merged,
          until: Date.now() + 5 * 60 * 1000,
        };
        return merged;
      })
      .finally(() => {
        groqDiscoveryInFlight = null;
      });
  }

  return groqDiscoveryInFlight;
}

async function postGroqCompletion(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  signal?: AbortSignal
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; errText: string; retryAfterHeader: string | null }
> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 2600,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: combineSignal(18000, signal),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      errText,
      retryAfterHeader: res.headers.get("retry-after"),
    };
  }

  const data: unknown = await res.json();
  const text =
    data &&
    typeof data === "object" &&
    "choices" in data &&
    Array.isArray(data.choices) &&
    typeof (data.choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content ===
      "string"
      ? ((data.choices[0] as { message: { content: string } }).message.content)
      : null;

  if (!text) {
    return {
      ok: false,
      status: 500,
      errText: "Groq returned empty response",
      retryAfterHeader: null,
    };
  }
  return { ok: true, text };
}

/**
 * Executes a completion request against Groq models with dynamic discovery and cooldown rotation.
 *
 * @param systemPrompt - System instructions.
 * @param userPrompt - User prompt payload.
 * @param jsonMode - Whether to request JSON object output.
 * @param signal - Optional parent AbortSignal.
 * @returns Generated text response.
 */
export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Fallback LLM credentials not configured");
  }

  const pool = await getGroqModelPool(apiKey, signal);
  const deadModels = new Set<string>();
  let lastError = "Groq request failed";

  for (let round = 0; round < 4; round++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const now = Date.now();
    pruneCooldowns(now);
    const candidates = pool.filter(
      (m) => !deadModels.has(m) && (groqCooldownUntil.get(m) ?? 0) <= now
    );

    if (candidates.length === 0) {
      const aliveCooldowns = pool
        .filter((m) => !deadModels.has(m))
        .map((m) => (groqCooldownUntil.get(m) ?? 0) - Date.now())
        .filter((ms) => ms > 0);
      if (aliveCooldowns.length === 0) break;
      await sleep(Math.min(Math.min(...aliveCooldowns), 10000));
      continue;
    }

    const start = groqCursor++ % candidates.length;
    const ordered = [...candidates.slice(start), ...candidates.slice(0, start)];

    for (const model of ordered) {
      if ((groqCooldownUntil.get(model) ?? 0) > Date.now()) continue;

      let result = await postGroqCompletion(apiKey, model, systemPrompt, userPrompt, jsonMode, signal);
      if (!result.ok && jsonMode && result.status === 400) {
        result = await postGroqCompletion(apiKey, model, systemPrompt, userPrompt, false, signal);
      }
      if (result.ok) return result.text;

      lastError = `Groq ${parseApiError(result.status, result.errText)}`;
      if (result.status === 429) {
        groqCooldownUntil.set(model, Date.now() + parseRetryDelayMs(result.errText, result.retryAfterHeader));
        continue;
      }
      if (result.status === 404 || result.status === 400) {
        deadModels.add(model);
        continue;
      }
      throw new Error(lastError);
    }
  }

  throw new Error(lastError);
}

/**
 * Clears Groq model pool and cooldown caches (used in unit tests).
 */
export function resetGroqCache(): void {
  groqCooldownUntil.clear();
  groqPoolCache = null;
  groqDiscoveryInFlight = null;
  groqCursor = 0;
}
