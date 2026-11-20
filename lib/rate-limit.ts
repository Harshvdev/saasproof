import type { UsageQuotaInfo } from "./types";

const WINDOW_MS = 24 * 60 * 60 * 1000;

// Generous enough for testing & live hackathon judging, strict enough to protect
// the $8 TinyFish wallet and free-tier Gemini/Groq RPM quotas.
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

const userBuckets = new Map<string, UserBucket>();
let globalDeepScrapes: number[] = [];

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

function getBucket(userId: string, now: number): UserBucket {
  const existing = userBuckets.get(userId);
  if (!existing) {
    const fresh: UserBucket = { analyses: [], deepScrapes: [], copilot: [] };
    userBuckets.set(userId, fresh);
    return fresh;
  }
  existing.analyses = prune(existing.analyses, now);
  existing.deepScrapes = prune(existing.deepScrapes, now);
  existing.copilot = prune(existing.copilot, now);
  return existing;
}

export function extractUserKey(req: Request): string {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/saasproof_uid=([a-zA-Z0-9_-]{8,64})/);
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const ipPart = forwarded || realIp || "local";
  return match ? `${ipPart}:${match[1]}` : ipPart;
}

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

