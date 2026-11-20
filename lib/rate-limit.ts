import { anonymizeVisitorKey } from "./security";
import type { UsageQuotaInfo } from "./types";

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour sliding window

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
}

/**
 * In-memory sliding-window bucket store keyed exclusively by salted SHA-256 hashes.
 */
const userBuckets = new Map<string, UserBucket>();
let globalDeepScrapes: number[] = [];

/**
 * Prunes timestamps outside the active 24-hour window.
 *
 * @param timestamps - Array of epoch millisecond values.
 * @param now - Current epoch timestamp.
 * @returns Filtered array of valid timestamps.
 */
function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

/**
 * Retrieves or initializes an anonymized rate-limit bucket.
 *
 * @param anonymizedKey - Salted SHA-256 visitor hash.
 * @param now - Current epoch timestamp.
 * @returns The active user bucket.
 */
function getBucket(anonymizedKey: string, now: number): UserBucket {
  const existing = userBuckets.get(anonymizedKey);
  if (!existing) {
    const fresh: UserBucket = { analyses: [], deepScrapes: [], copilot: [] };
    userBuckets.set(anonymizedKey, fresh);
    return fresh;
  }
  existing.analyses = prune(existing.analyses, now);
  existing.deepScrapes = prune(existing.deepScrapes, now);
  existing.copilot = prune(existing.copilot, now);
  return existing;
}

/**
 * Extracts and cryptographically hashes the visitor's network identifier
 * and cookie identifier so raw client IPs are never held in memory.
 *
 * @param req - The incoming HTTP Request object.
 * @returns 64-char SHA-256 anonymized user identifier.
 */
export function extractUserKey(req: Request): string {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/saasproof_uid=([a-zA-Z0-9_-]{8,64})/);
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const rawIp = forwarded || realIp || "127.0.0.1";
  const rawIdentifier = match ? `${rawIp}:${match[1]}` : rawIp;
  return anonymizeVisitorKey(rawIdentifier);
}

/**
 * Returns a read-only snapshot of the visitor's remaining quotas.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @returns Current quota snapshot.
 */
export function getQuotaSnapshot(userKey: string): UsageQuotaInfo {
  const now = Date.now();
  const bucket = getBucket(userKey, now);
  globalDeepScrapes = prune(globalDeepScrapes, now);

  const userDeepRemaining = Math.max(
    0,
    QUOTA_LIMITS.deepScrapesPerUser - bucket.deepScrapes.length
  );
  const globalDeepRemaining = Math.max(
    0,
    QUOTA_LIMITS.globalDeepScrapesPerDay - globalDeepScrapes.length
  );

  return {
    analysesRemaining: Math.max(0, QUOTA_LIMITS.analysesPerUser - bucket.analyses.length),
    analysesLimit: QUOTA_LIMITS.analysesPerUser,
    deepScrapesRemaining: Math.min(userDeepRemaining, globalDeepRemaining),
    deepScrapesLimit: QUOTA_LIMITS.deepScrapesPerUser,
    copilotMessagesRemaining: Math.max(
      0,
      QUOTA_LIMITS.copilotPerUser - bucket.copilot.length
    ),
    copilotMessagesLimit: QUOTA_LIMITS.copilotPerUser,
    resetWindowHours: 24,
  };
}

/**
 * Consumes one unit of live startup analysis quota if available.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @returns Object indicating whether consumption succeeded and updated quota status.
 */
export function consumeAnalysisQuota(userKey: string): {
  allowed: boolean;
  quota: UsageQuotaInfo;
} {
  const now = Date.now();
  const bucket = getBucket(userKey, now);

  if (bucket.analyses.length >= QUOTA_LIMITS.analysesPerUser) {
    return { allowed: false, quota: getQuotaSnapshot(userKey) };
  }

  bucket.analyses.push(now);
  return { allowed: true, quota: getQuotaSnapshot(userKey) };
}

/**
 * Consumes one deep scrape token if within both per-user and global daily bounds.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @returns Boolean indicating whether deep scrape is permitted.
 */
export function consumeDeepScrapeQuota(userKey: string): boolean {
  const now = Date.now();
  const bucket = getBucket(userKey, now);
  globalDeepScrapes = prune(globalDeepScrapes, now);

  if (
    bucket.deepScrapes.length >= QUOTA_LIMITS.deepScrapesPerUser ||
    globalDeepScrapes.length >= QUOTA_LIMITS.globalDeepScrapesPerDay
  ) {
    return false;
  }

  bucket.deepScrapes.push(now);
  globalDeepScrapes.push(now);
  return true;
}

/**
 * Consumes one interactive Co-Pilot follow-up message token if within quota.
 *
 * @param userKey - Anonymized SHA-256 user key.
 * @returns Object indicating whether consumption succeeded and updated quota status.
 */
export function consumeCopilotQuota(userKey: string): {
  allowed: boolean;
  quota: UsageQuotaInfo;
} {
  const now = Date.now();
  const bucket = getBucket(userKey, now);

  if (bucket.copilot.length >= QUOTA_LIMITS.copilotPerUser) {
    return { allowed: false, quota: getQuotaSnapshot(userKey) };
  }

  bucket.copilot.push(now);
  return { allowed: true, quota: getQuotaSnapshot(userKey) };
}

/**
 * Clears in-memory buckets for test isolation.
 */
export function resetRateLimits(): void {
  userBuckets.clear();
  globalDeepScrapes = [];
}
