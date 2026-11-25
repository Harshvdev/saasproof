import { createHash, randomBytes } from "crypto";
export { isSafeHttpUrl, sanitizeSafeUrl, validatePublicHttpUrl } from "./url";

/**
 * Per-process cryptographically random fallback salt used when RATE_LIMIT_SALT
 * is not explicitly configured in the environment.
 */
const DEFAULT_RUNTIME_SALT = randomBytes(32).toString("hex");

/**
 * Heuristic and regex signatures representing adversarial prompt injections,
 * system instruction overrides, jailbreak templates, and dangerous script payloads.
 */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  {
    pattern: /(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules|commands)/i,
    description: "System instruction override attempt",
  },
  {
    pattern: /\b(?:dan mode|jailbreak|developer mode|unrestricted mode)\b/i,
    description: "Jailbreak mode keyword detected",
  },
  {
    pattern: /(?:reveal|print|show|output|leak|repeat)\s+(?:your\s+)?(?:system\s+prompt|hidden\s+instructions|developer\s+prompt|system\s+instructions)/i,
    description: "System prompt exfiltration attempt",
  },
  {
    pattern: /<script\b[^>]*>[\s\S]*?<\/script>/i,
    description: "Executable script tag injection",
  },
  {
    pattern: /(?:javascript|vbscript)\s*:|data\s*:\s*text\/html/i,
    description: "Pseudo-protocol XSS vector",
  },
  {
    pattern: /<\w+\b[^>]*\bon[a-z]{2,}\s*=/i,
    description: "Inline DOM event handler injection",
  },
  {
    pattern: /\b(?:eval|exec|Function)\s*\(\s*["'`][\s\S]*?["'`]\s*\)/i,
    description: "Dynamic code execution statement",
  },
];

/**
 * Secret tokens and API key patterns that must never be leaked outbound to clients.
 */
const SECRET_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Google Cloud / Gemini AI Studio Keys
  {
    pattern: /AIza[\w-]{30,42}/g,
    replacement: "[REDACTED_GEMINI_KEY]",
  },
  // Google AI Studio Authorization Keys
  {
    pattern: /\bAQ\.[\w-]{20,}/g,
    replacement: "[REDACTED_GOOGLE_KEY]",
  },
  // Groq API Keys
  {
    pattern: /gsk_[\w-]{40,}/g,
    replacement: "[REDACTED_GROQ_KEY]",
  },
  // OpenAI / standard sk- style Keys
  {
    pattern: /sk-[\w-]{30,}/g,
    replacement: "[REDACTED_API_KEY]",
  },
  // Authorization Bearer Header Tokens
  {
    pattern: /Bearer\s+[A-Za-z0-9._~+/-]{20,}/g,
    replacement: "Bearer [REDACTED_AUTH_TOKEN]",
  },
];

const ENV_SECRET_KEYS = [
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "TINYFISH_API_KEY",
  "RATE_LIMIT_SALT",
] as const;

export interface PromptGuardResult {
  safe: boolean;
  reason?: string;
  matchedPattern?: string;
}

/**
 * Validates text payloads against adversarial jailbreaks, prompt injection, and script attacks.
 *
 * @param text - The raw user input string to evaluate.
 * @returns A verification result indicating whether the input is safe or which guardrail triggered.
 */
export function validatePromptGuard(text: string): PromptGuardResult {
  const normalized = text.normalize("NFKC").trim();

  for (const { pattern, description } of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        reason: description,
        matchedPattern: pattern.source,
      };
    }
  }

  return { safe: true };
}

/**
 * Redacts known sensitive keys, active environment secrets, and authentication tokens
 * from outbound strings.
 *
 * @param content - Text that may contain accidentally mirrored or echoed API keys.
 * @returns Sanitized string safe for client-facing streaming or responses.
 */
export function redactSecrets(content: string): string {
  if (!content) return content;
  let sanitized = content;
  for (const { pattern, replacement } of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  for (const envName of ENV_SECRET_KEYS) {
    const val = process.env[envName]?.trim();
    if (val && val.length >= 8 && sanitized.includes(val)) {
      sanitized = sanitized.split(val).join("[REDACTED_ENV_SECRET]");
    }
  }
  return sanitized;
}

/**
 * Computes a deterministic SHA-256 digest of any string (e.g., for keying in-memory API key caches
 * without retaining raw secrets in Map keys).
 *
 * @param value - Input string to hash.
 * @returns 64-character hexadecimal SHA-256 digest.
 */
export function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Cryptographically anonymizes visitor identifiers (IP addresses and user cookies)
 * using salted SHA-256 hashing to guarantee GDPR-compliant rate limiting.
 *
 * @param rawIdentifier - The raw incoming IP, forwarded header, or session cookie.
 * @param salt - Optional custom salt string; defaults to configured env salt or per-process CSPRNG salt.
 * @returns 64-character hexadecimal SHA-256 hash.
 */
export function anonymizeVisitorKey(
  rawIdentifier: string,
  salt = process.env.RATE_LIMIT_SALT?.trim() || DEFAULT_RUNTIME_SALT
): string {
  return createHash("sha256")
    .update(`${salt}:${rawIdentifier.trim().toLowerCase()}`)
    .digest("hex");
}
