import { beforeEach, describe, expect, test } from "bun:test";
import {
  consumeAnalysisQuota,
  consumeCopilotQuota,
  consumeDeepScrapeQuota,
  getQuotaSnapshot,
  getRateLimitBucketCount,
  QUOTA_LIMITS,
  resetRateLimits,
} from "../../lib/rate-limit";

describe("Security Suite: Rate Limiting & Resource Protection", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  test("enforces exact analysis quota limit per anonymized user", () => {
    const userKey = "user_anon_hash_test_analysis";

    for (let i = 0; i < QUOTA_LIMITS.analysesPerUser; i++) {
      const res = consumeAnalysisQuota(userKey);
      expect(res.allowed).toBe(true);
      expect(res.quota.analysesRemaining).toBe(
        QUOTA_LIMITS.analysesPerUser - (i + 1)
      );
    }

    const blocked = consumeAnalysisQuota(userKey);
    expect(blocked.allowed).toBe(false);
    expect(blocked.quota.analysesRemaining).toBe(0);
  });

  test("enforces copilot chat quota limit per anonymized user", () => {
    const userKey = "user_anon_hash_test_copilot";

    for (let i = 0; i < QUOTA_LIMITS.copilotPerUser; i++) {
      const res = consumeCopilotQuota(userKey);
      expect(res.allowed).toBe(true);
    }

    const blocked = consumeCopilotQuota(userKey);
    expect(blocked.allowed).toBe(false);
  });

  test("enforces deep scrape bounds per user and globally across distinct users", () => {
    const userKey = "user_anon_hash_test_scrape";

    for (let i = 0; i < QUOTA_LIMITS.deepScrapesPerUser; i++) {
      expect(consumeDeepScrapeQuota(userKey)).toBe(true);
    }
    expect(consumeDeepScrapeQuota(userKey)).toBe(false);

    // Exhaust remaining global daily scrapes across distinct users
    resetRateLimits();
    for (let i = 0; i < QUOTA_LIMITS.globalDeepScrapesPerDay; i++) {
      const distinctUser = `user_${Math.floor(i / QUOTA_LIMITS.deepScrapesPerUser)}`;
      expect(consumeDeepScrapeQuota(distinctUser)).toBe(true);
    }

    // Any new user must now be blocked by the global daily cap
    expect(consumeDeepScrapeQuota("brand_new_user_after_global_cap")).toBe(false);
  });

  test("getQuotaSnapshot reflects fresh quota without allocating memory buckets", () => {
    expect(getRateLimitBucketCount()).toBe(0);
    const snapshot = getQuotaSnapshot("fresh_user_hash_check");

    expect(snapshot.analysesRemaining).toBe(QUOTA_LIMITS.analysesPerUser);
    expect(snapshot.copilotMessagesRemaining).toBe(QUOTA_LIMITS.copilotPerUser);
    expect(snapshot.deepScrapesRemaining).toBe(QUOTA_LIMITS.deepScrapesPerUser);
    expect(snapshot.resetWindowHours).toBe(24);
    expect(getRateLimitBucketCount()).toBe(0);
  });

  test("enforces shared IP-level ceiling across cookie rotations", () => {
    const sharedIpKey = "ip_hash_shared_subnet";

    for (let i = 0; i < QUOTA_LIMITS.analysesPerUser * 2; i++) {
      const rotatedCookieKey = `user_cookie_${Math.floor(i / QUOTA_LIMITS.analysesPerUser)}_${i}`;
      const res = consumeAnalysisQuota(rotatedCookieKey, sharedIpKey);
      expect(res.allowed).toBe(true);
    }

    const blockedRotation = consumeAnalysisQuota("brand_new_rotated_cookie", sharedIpKey);
    expect(blockedRotation.allowed).toBe(false);
    expect(blockedRotation.quota.analysesRemaining).toBe(0);
  });
});
