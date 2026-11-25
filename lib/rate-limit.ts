import { anonymizeVisitorKey } from "./security";
import type { UsageQuotaInfo } from "./types";

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour sliding window
const MAX_BUCKETS = 5000;
const IP_CEILING_MULTIPLIER = 2;

/**
 * Generous enough for comprehensive hackathon evaluations and founder use,
 * strict enough to prevent runaway API exhaustion.
 */
export const QUOTA_LIMITS = {
  analysesPerUser: 8,
  deepScrapesPerUser: 2,
  copilotPerUser: 25,
  globalDeepScrapesPerDay: 25,
} as const;

interface UserBucket {
  analyses: number[];
  deepScrapes: number[];
  copilot: number[];
  lastSeen: number;
}

/**
 * Bounded in-memory sliding-window bucket store keyed exclusively by salted SHA-256 hashes.
 */
const userBuckets = new Map<string, UserBucket>();
let globalDeepScrapes: number[] = [];

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

function pruneBucketEntries(bucket: UserBucket, now: number): UserBucket {
  bucket.analyses = prune(bucket.analyses, now);
  bucket.deepScrapes = prune(bucket.deepScrapes, now);
  bucket.copilot = prune(bucket.copilot, now);
  bucket.lastSeen = now;
  return bucket;
}

function evictOverflowBuckets(now: number): void {
  if (userBuckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of userBuckets) {
    const expired =
      prune(bucket.analyses, now).length === 0 &&
      prune(bucket.deepScrapes, now).length === 0 &&
      prune(bucket.copilot, now).length === 0;
    if (expired) {
      userBuckets.delete(key);
    }
  }
  while (userBuckets.size >= MAX_BUCKETS) {
    const oldestKey = userBuckets.keys().next().value;
    if (!oldestKey) break;
    userBuckets.delete(oldestKey);
  }
}

function readBucket(anonymizedKey: string, now: number): UserBucket | null {
  const existing = userBuckets.get(anonymizedKey);
  if (!existing) return null;
  return pruneBucketEntries(existing, now);
}

function getOrCreateBucket(anonymizedKey: string, now: number): UserBucket {
  const existing = userBuckets.get(anonymizedKey);
  if (existing) {
    // Refresh insertion order for LRU eviction
    userBuckets.delete(anonymizedKey);
    userBuckets.set(anonymizedKey, pruneBucketEntries(existing, now));
    return existing;
  }

  evictOverflowBuckets(now);
  const fresh: UserBucket = {
    analyses: [],
    deepScrapes: [],
    copilot: [],
    lastSeen: now,
  };
  userBuckets.set(anonymizedKey, fresh);
  return fresh;
}

/**
 * Resolves the client IP address from trusted proxy headers without storing it raw.
 *
 * @param req - Incoming HTTP Request.
 * @returns Normalized IP string.
 */
export function resolveClientIp(req: Request): string {
  const vercelForwarded = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return vercelForwarded || realIp || forwarded || "127.0.0.1";
}

/**
 * Extracts an anchored `saasproof_uid` cookie value if present and well-formed.
 *
 * @param req - Incoming HTTP Request.
 * @returns Cookie UID string or null.
 */
export function extractSessionCookieId(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)saasproof_uid=([a-zA-Z0-9_-]{8,64})(?:;|$)/);
  return match?.[1] ?? null;
}

/**
 * Extracts and cryptographically hashes the visitor's network identifier
 * and cookie identifier so raw client IPs are never held in memory.
 *
 * @param req - The incoming HTTP Request object.
 * @returns 64-char SHA-256 anonymized user identifier.
 */
export function extractUserKey(req: Request): string {
  const rawIp = resolveClientIp(req);
  const uid = extractSessionCookieId(req);
  const rawIdentifier = uid ? `${rawIp}:${uid}` : rawIp;
  return anonymizeVisitorKey(rawIdentifier);
}

/**
 * Extracts an IP-only anonymized key to prevent quota bypasses via cookie rotation.
 *
 * @param req - The incoming HTTP Request object.
 * @returns 64-char SHA-256 anonymized IP identifier.
 */
export function extractIpKey(req: Request): string {
  return anonymizeVisitorKey(`ip:${resolveClientIp(req)}`);
}

/**
 * Returns a read-only snapshot of the visitor's remaining quotas without creating
 * empty buckets for unauthenticated GET polling.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @returns Current quota snapshot.
 */
export function getQuotaSnapshot(userKey: string, ipKey?: string): UsageQuotaInfo {
  const now = Date.now();
  const bucket = readBucket(userKey, now);
  const ipBucket = ipKey && ipKey !== userKey ? readBucket(ipKey, now) : undefined;
  globalDeepScrapes = prune(globalDeepScrapes, now);

  const analysesCount = bucket?.analyses.length ?? 0;
  const deepCount = bucket?.deepScrapes.length ?? 0;
  const copilotCount = bucket?.copilot.length ?? 0;

  const ipAnalysesRem = ipBucket
    ? Math.max(0, QUOTA_LIMITS.analysesPerUser * IP_CEILING_MULTIPLIER - ipBucket.analyses.length)
    : Infinity;
  const ipDeepRem = ipBucket
    ? Math.max(0, QUOTA_LIMITS.deepScrapesPerUser * IP_CEILING_MULTIPLIER - ipBucket.deepScrapes.length)
    : Infinity;
  const ipCopilotRem = ipBucket
    ? Math.max(0, QUOTA_LIMITS.copilotPerUser * IP_CEILING_MULTIPLIER - ipBucket.copilot.length)
    : Infinity;

  const userDeepRemaining = Math.max(0, QUOTA_LIMITS.deepScrapesPerUser - deepCount);
  const globalDeepRemaining = Math.max(
    0,
    QUOTA_LIMITS.globalDeepScrapesPerDay - globalDeepScrapes.length
  );

  return {
    analysesRemaining: Math.min(
      Math.max(0, QUOTA_LIMITS.analysesPerUser - analysesCount),
      ipAnalysesRem
    ),
    analysesLimit: QUOTA_LIMITS.analysesPerUser,
    deepScrapesRemaining: Math.min(userDeepRemaining, globalDeepRemaining, ipDeepRem),
    deepScrapesLimit: QUOTA_LIMITS.deepScrapesPerUser,
    copilotMessagesRemaining: Math.min(
      Math.max(0, QUOTA_LIMITS.copilotPerUser - copilotCount),
      ipCopilotRem
    ),
    copilotMessagesLimit: QUOTA_LIMITS.copilotPerUser,
    resetWindowHours: 24,
  };
}

function consumeWindowToken(
  field: "analyses" | "copilot",
  limit: number,
  userKey: string,
  ipKey?: string
): boolean {
  const now = Date.now();
  const bucket = getOrCreateBucket(userKey, now);
  const distinctIp = ipKey && ipKey !== userKey ? getOrCreateBucket(ipKey, now) : null;

  if (
    bucket[field].length >= limit ||
    (distinctIp && distinctIp[field].length >= limit * IP_CEILING_MULTIPLIER)
  ) {
    return false;
  }

  bucket[field].push(now);
  distinctIp?.[field].push(now);
  return true;
}

/**
 * Consumes one unit of live startup analysis quota if available.
 * Enforces an IP-level ceiling when `ipKey` is supplied to mitigate cookie rotation.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @param ipKey - Optional anonymized SHA-256 IP key.
 * @returns Object indicating whether consumption succeeded and updated quota status.
 */
export function consumeAnalysisQuota(
  userKey: string,
  ipKey?: string
): {
  allowed: boolean;
  quota: UsageQuotaInfo;
} {
  const allowed = consumeWindowToken("analyses", QUOTA_LIMITS.analysesPerUser, userKey, ipKey);
  return { allowed, quota: getQuotaSnapshot(userKey, ipKey) };
}

/**
 * Consumes one deep scrape token if within per-user, per-IP, and global daily bounds.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @param ipKey - Optional anonymized SHA-256 IP key.
 * @returns Boolean indicating whether deep scrape is permitted.
 */
export function consumeDeepScrapeQuota(userKey: string, ipKey?: string): boolean {
  const now = Date.now();
  const bucket = getOrCreateBucket(userKey, now);
  const distinctIp = ipKey && ipKey !== userKey ? getOrCreateBucket(ipKey, now) : null;
  globalDeepScrapes = prune(globalDeepScrapes, now);

  if (
    bucket.deepScrapes.length >= QUOTA_LIMITS.deepScrapesPerUser ||
    (distinctIp &&
      distinctIp.deepScrapes.length >= QUOTA_LIMITS.deepScrapesPerUser * IP_CEILING_MULTIPLIER) ||
    globalDeepScrapes.length >= QUOTA_LIMITS.globalDeepScrapesPerDay
  ) {
    return false;
  }

  bucket.deepScrapes.push(now);
  distinctIp?.deepScrapes.push(now);
  globalDeepScrapes.push(now);
  return true;
}

/**
 * Consumes one interactive Co-Pilot follow-up message token if within quota.
 * Enforces an IP-level ceiling when `ipKey` is supplied to mitigate cookie rotation.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @param ipKey - Optional anonymized SHA-256 IP key.
 * @returns Object indicating whether consumption succeeded and updated quota status.
 */
export function consumeCopilotQuota(
  userKey: string,
  ipKey?: string
): {
  allowed: boolean;
  quota: UsageQuotaInfo;
} {
  const allowed = consumeWindowToken("copilot", QUOTA_LIMITS.copilotPerUser, userKey, ipKey);
  return { allowed, quota: getQuotaSnapshot(userKey, ipKey) };
}

/**
 * Returns the active bucket count for testing bounded memory behavior.
 */
export function getRateLimitBucketCount(): number {
  return userBuckets.size;
}

/**
 * Clears in-memory buckets for test isolation.
 */
export function resetRateLimits(): void {
  userBuckets.clear();
  globalDeepScrapes = [];
}
