import { beforeEach, describe, expect, test } from "bun:test";
import {
  consumeAnalysisQuota,
  consumeCopilotQuota,
  consumeDeepScrapeQuota,
  getQuotaSnapshot,
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

  test("enforces deep scrape bounds per user and globally", () => {
    const userKey = "user_anon_hash_test_scrape";

    for (let i = 0; i < QUOTA_LIMITS.deepScrapesPerUser; i++) {
      const allowed = consumeDeepScrapeQuota(userKey);
      expect(allowed).toBe(true);
    }

    const exceedUser = consumeDeepScrapeQuota(userKey);
    expect(exceedUser).toBe(false);
  });

  test("getQuotaSnapshot reflects fresh quota without consuming tokens", () => {
    const freshUser = "fresh_user_hash_check";
    const snapshot = getQuotaSnapshot(freshUser);

    expect(snapshot.analysesRemaining).toBe(QUOTA_LIMITS.analysesPerUser);
    expect(snapshot.copilotMessagesRemaining).toBe(QUOTA_LIMITS.copilotPerUser);
    expect(snapshot.deepScrapesRemaining).toBe(QUOTA_LIMITS.deepScrapesPerUser);
    expect(snapshot.resetWindowHours).toBe(24);
  });
});
