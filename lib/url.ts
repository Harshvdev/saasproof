/**
 * Shared URL validation and sanitization utilities safe for both server and client bundles.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
  "metadata",
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((segment) => Number(segment));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateOrLocalHost(rawHostname: string): boolean {
  const host = rawHostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }

  if (isPrivateIpv4(host)) return true;

  // Handle IPv6 loopback, unspecified, ULA (fc00::/7), link-local (fe80::/10), and IPv4-mapped (::ffff:)
  if (host === "::" || host === "::1" || host === "0:0:0:0:0:0:0:1") {
    return true;
  }
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }
  if (host.startsWith("::ffff:")) {
    const mapped = host.slice("::ffff:".length);
    if (isPrivateIpv4(mapped)) return true;
    // Also handle hex-encoded IPv4-mapped IPv6 like ::ffff:7f00:1 or ::ffff:a9fe:a9fe
    const hexGroups = mapped.split(":");
    if (hexGroups.length === 2 && hexGroups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) {
      const hi = parseInt(hexGroups[0], 16);
      const lo = parseInt(hexGroups[1], 16);
      const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      if (isPrivateIpv4(ipv4)) return true;
    }
  }

  return false;
}

/**
 * Validates that a URL string uses strictly `http:` or `https:` without embedded credentials.
 * Safe for rendering in `<a href>` links and Markdown exports to block `javascript:` / `data:` XSS.
 *
 * @param rawUrl - Candidate URL string.
 * @returns Normalized URL string or `null` if invalid/unsafe.
 */
export function sanitizeSafeUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Type predicate / Zod helper checking whether a URL is a valid `http:` or `https:` URL.
 *
 * @param rawUrl - Candidate URL string.
 * @returns True if safe to render as an external link.
 */
export function isSafeHttpUrl(rawUrl: string): boolean {
  return sanitizeSafeUrl(rawUrl) !== null;
}

/**
 * Validates that a URL is a safe public `http:`/`https:` endpoint suitable for server-side fetching.
 * Blocks loopback, link-local, metadata, and RFC1918 private network addresses to prevent SSRF.
 *
 * @param rawUrl - Candidate target URL.
 * @returns Normalized public URL string or `null` if blocked/invalid.
 */
export function validatePublicHttpUrl(rawUrl: string): string | null {
  const safe = sanitizeSafeUrl(rawUrl);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    if (isPrivateOrLocalHost(parsed.hostname)) {
      return null;
    }
    return safe;
  } catch {
    return null;
  }
}

/**
 * Extracts a clean display domain from a URL string.
 *
 * @param rawUrl - Candidate URL string.
 * @returns Hostname without leading `www.`, or fallback `"web"`.
 */
export function extractDisplayDomain(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "") || "web";
  } catch {
    return "web";
  }
}
