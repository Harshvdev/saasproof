import { createHash } from "crypto";

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
    pattern: /(?:javascript|vbscript|data):[\s\S]*?(?:alert|eval|prompt|confirm)/i,
    description: "Pseudo-protocol XSS vector",
  },
  {
    pattern: /<\w+\b[^>]*\bon(?:error|load|click|mouseover)\s*=/i,
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
 * Redacts known sensitive keys and authentication tokens from outbound strings.
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
  return sanitized;
}

/**
 * Cryptographically anonymizes visitor identifiers (IP addresses and user cookies)
 * using salted SHA-256 hashing to guarantee GDPR-compliant rate limiting.
 *
 * @param rawIdentifier - The raw incoming IP, forwarded header, or session cookie.
 * @param salt - Optional custom salt string; defaults to application internal salt.
 * @returns 64-character hexadecimal SHA-256 hash.
 */
export function anonymizeVisitorKey(
  rawIdentifier: string,
  salt = process.env.RATE_LIMIT_SALT || "saasproof_sec_salt_v1"
): string {
  return createHash("sha256")
    .update(`${salt}:${rawIdentifier.trim().toLowerCase()}`)
    .digest("hex");
}
