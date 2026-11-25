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

  test("hashAnalysisInput normalizes whitespace, case, and avoids delimiter collisions", () => {
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
    const pipeA = {
      idea: "idea part a|india",
      region: "Global",
      businessModel: "B2B SaaS" as const,
      enableDeepScrape: true,
    };
    const pipeB = {
      idea: "idea part a",
      region: "india|Global",
      businessModel: "B2B SaaS" as const,
      enableDeepScrape: true,
    };

    const hashA = hashAnalysisInput(inputA);
    const hashB = hashAnalysisInput(inputB);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
    expect(hashAnalysisInput(pipeA)).not.toBe(hashAnalysisInput(pipeB));
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
    const answer =
      "Set up a landing page with a pre-order waitlist and run $100 in search ads.";

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

  test("evicts least-recently-used entries at capacity while preserving updated keys", () => {
    const baseReport = DEMO_PRESETS[0];
    for (let i = 0; i < 120; i++) {
      setCachedAnalysis(`k_${i}`, { ...baseReport, id: `id_${i}` });
    }
    expect(getCacheStats().analysis.size).toBe(120);

    // Promote k_0 via update and insert k_120 -> k_1 should be evicted, k_0 retained
    setCachedAnalysis("k_0", { ...baseReport, id: "id_0_updated" });
    setCachedAnalysis("k_120", { ...baseReport, id: "id_120" });

    expect(getCacheStats().analysis.size).toBe(120);
    expect(getCachedAnalysis("k_0")?.id).toBe("id_0_updated");
    expect(getCachedAnalysis("k_1")).toBeNull();
    expect(getCachedAnalysis("k_120")?.id).toBe("id_120");
  });
});
