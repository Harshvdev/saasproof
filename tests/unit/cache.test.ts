import { beforeEach, describe, expect, test } from "bun:test";
import {
  clearAllCaches,
  getCachedAnalysis,
  getCachedCopilot,
  getCacheStats,
  hashAnalysisInput,
  hashCopilotQuestion,
  setCachedAnalysis,
  setCachedCopilot,
} from "../../lib/cache";
import { DEMO_PRESETS } from "../../lib/presets";

describe("Unit Suite: LRU Memory Cache & Deterministic Hashing", () => {
  beforeEach(() => {
    clearAllCaches();
  });

  test("hashAnalysisInput normalizes whitespace, case, and parameters", () => {
    const inputA = {
      idea: "  Autonomous Drone Delivery For Remote Pharmacies  ",
      region: "Global",
      businessModel: "Hardware / Climate" as const,
      enableDeepScrape: false,
    };
    const inputB = {
      idea: "autonomous drone delivery for remote pharmacies",
      region: "global",
      businessModel: "Hardware / Climate" as const,
      enableDeepScrape: false,
    };

    const hashA = hashAnalysisInput(inputA);
    const hashB = hashAnalysisInput(inputB);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
  });

  test("stores and retrieves analysis reports with zero latency", () => {
    const preset = DEMO_PRESETS[0];
    const key = hashAnalysisInput(preset.input);

    expect(getCachedAnalysis(key)).toBeNull();

    setCachedAnalysis(key, preset);
    const retrieved = getCachedAnalysis(key);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(preset.id);
    expect(retrieved?.framer.startupTitle).toBe(preset.framer.startupTitle);
  });

  test("caches copilot answers and tracks hits/misses accurately", () => {
    const reportId = "rep_cache_test_99";
    const question = "How do I validate demand without building software?";
    const answer = "Set up a landing page with a pre-order waitlist and run $100 in search ads.";

    const hashKey = hashCopilotQuestion(reportId, question);
    expect(hashKey).toMatch(/^[a-f0-9]{64}$/);

    expect(getCachedCopilot(reportId, question)).toBeNull();

    setCachedCopilot(reportId, question, answer);
    const cached = getCachedCopilot(reportId, question);

    expect(cached).toBe(answer);

    const stats = getCacheStats();
    expect(stats.copilot.hits).toBe(1);
    expect(stats.copilot.misses).toBe(1);
    expect(stats.copilot.size).toBe(1);
  });
});
