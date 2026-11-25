import { beforeEach, describe, expect, test } from "bun:test";
import {
  AnalysisInputSchema,
  CopilotRequestSchema,
  FramerOutputSchema,
  MarketOutputSchema,
  CompetitorOutputSchema,
  CustomerOutputSchema,
  ValidatorOutputSchema,
  PlannerOutputSchema,
} from "../lib/types";
import { hitsToCitations } from "../lib/tinyfish";
import {
  consumeAnalysisQuota,
  consumeCopilotQuota,
  getQuotaSnapshot,
  QUOTA_LIMITS,
  resetRateLimits,
} from "../lib/rate-limit";
import { DEMO_PRESETS } from "../lib/presets";
import { reportToMarkdown } from "../lib/export";
import {
  clearAllCaches,
  getCachedAnalysis,
  getCachedCopilot,
  getCacheStats,
  hashAnalysisInput,
  hashCopilotQuestion,
  setCachedAnalysis,
  setCachedCopilot,
} from "../lib/cache";

beforeEach(() => {
  resetRateLimits();
  clearAllCaches();
});

describe("SaaSProof: Input & Schema Validation", () => {
  test("accepts a comprehensive valid startup idea input", () => {
    const validPayload = {
      idea: "An on-demand AI co-pilot that helps freelance designers run user testing interviews automatically.",
      region: "North America & Europe",
      businessModel: "B2B SaaS",
      enableDeepScrape: true,
    };
    const parsed = AnalysisInputSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.region).toBe("North America & Europe");
      expect(parsed.data.businessModel).toBe("B2B SaaS");
      expect(parsed.data.enableDeepScrape).toBe(true);
    }
  });

  test("rejects input with idea shorter than 10 characters", () => {
    const tooShort = { idea: "Too short" };
    const parsed = AnalysisInputSchema.safeParse(tooShort);
    expect(parsed.success).toBe(false);
  });

  test("accepts input with optional parameters omitted", () => {
    const minimal = {
      idea: "A subscription box for organic specialty coffee from single-origin micro farms.",
    };
    const parsed = AnalysisInputSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.region).toBe("India");
    }
  });

  test("validates copilot inquiry schema correctly", () => {
    const validCopilot = {
      question: "How should I price the initial pilot version for 10 enterprise accounts?",
      report: DEMO_PRESETS[0],
      history: [
        { role: "user" as const, content: "What is my biggest fatal risk?" },
        { role: "assistant" as const, content: "Platform liability and user disintermediation." },
      ],
    };
    const parsed = CopilotRequestSchema.safeParse(validCopilot);
    expect(parsed.success).toBe(true);
  });

  test("rejects empty copilot questions", () => {
    const emptyCopilot = {
      question: "",
      report: DEMO_PRESETS[0],
    };
    const parsed = CopilotRequestSchema.safeParse(emptyCopilot);
    expect(parsed.success).toBe(false);
  });
});

describe("SaaSProof: Grounding & Citations", () => {
  test("deduplicates identical URLs and formats domain correctly", () => {
    const searchHits = [
      {
        title: "Statista Recommerce Report",
        url: "https://www.statista.com/topics/recommerce-market",
        snippet: "Global recommerce transaction volume reached $178B in 2024.",
        domain: "statista.com",
      },
      {
        title: "Duplicate Hit Statista",
        url: "https://www.statista.com/topics/recommerce-market",
        snippet: "Duplicate snippet data",
        domain: "statista.com",
      },
      {
        title: "TechCrunch Article",
        url: "https://techcrunch.com/2024/01/10/used-goods-trust-gap",
        snippet: "Why peer-to-peer used marketplaces need third-party escrow.",
        domain: "techcrunch.com",
      },
    ];

    const citations = hitsToCitations(searchHits, 5);
    expect(citations.length).toBe(2);
    expect(citations[0].url).toBe("https://www.statista.com/topics/recommerce-market");
    expect(citations[1].url).toBe("https://techcrunch.com/2024/01/10/used-goods-trust-gap");
  });

  test("respects the custom limit parameter", () => {
    const manyHits = Array.from({ length: 10 }, (_, i) => ({
      title: `Source ${i + 1}`,
      url: `https://example${i + 1}.com/report`,
      snippet: `Snippet for source ${i + 1}`,
      domain: `example${i + 1}.com`,
    }));

    const citations = hitsToCitations(manyHits, 3);
    expect(citations.length).toBe(3);
  });
});

describe("SaaSProof: Rate Limiting & Resource Protection", () => {
  test("enforces analysis quota per user identifier", () => {
    const uniqueKey = `test_user_analysis_${Date.now()}`;

    // Should allow up to analysesPerUser calls
    for (let i = 0; i < QUOTA_LIMITS.analysesPerUser; i++) {
      const res = consumeAnalysisQuota(uniqueKey);
      expect(res.allowed).toBe(true);
      expect(res.quota.analysesRemaining).toBe(QUOTA_LIMITS.analysesPerUser - (i + 1));
    }

    // Exceeding quota should be blocked
    const overflow = consumeAnalysisQuota(uniqueKey);
    expect(overflow.allowed).toBe(false);
    expect(overflow.quota.analysesRemaining).toBe(0);
  });

  test("enforces copilot chat quota independently", () => {
    const uniqueKey = `test_user_copilot_${Date.now()}`;

    for (let i = 0; i < QUOTA_LIMITS.copilotPerUser; i++) {
      const res = consumeCopilotQuota(uniqueKey);
      expect(res.allowed).toBe(true);
    }

    const overflow = consumeCopilotQuota(uniqueKey);
    expect(overflow.allowed).toBe(false);
  });

  test("getQuotaSnapshot returns full status without consuming", () => {
    const freshKey = `fresh_user_${Date.now()}`;
    const quota = getQuotaSnapshot(freshKey);
    expect(quota.analysesRemaining).toBe(QUOTA_LIMITS.analysesPerUser);
    expect(quota.copilotMessagesRemaining).toBe(QUOTA_LIMITS.copilotPerUser);
    expect(quota.analysesLimit).toBe(QUOTA_LIMITS.analysesPerUser);
  });
});

describe("SaaSProof: Output Schema Integrity & Report Export", () => {
  test("all bundled demo presets conform to strict output schemas", () => {
    expect(DEMO_PRESETS.length).toBeGreaterThan(0);

    for (const preset of DEMO_PRESETS) {
      expect(FramerOutputSchema.safeParse(preset.framer).success).toBe(true);
      expect(MarketOutputSchema.safeParse(preset.market).success).toBe(true);
      expect(CompetitorOutputSchema.safeParse(preset.competitors).success).toBe(true);
      expect(CustomerOutputSchema.safeParse(preset.customers).success).toBe(true);
      expect(ValidatorOutputSchema.safeParse(preset.validator).success).toBe(true);
      expect(PlannerOutputSchema.safeParse(preset.planner).success).toBe(true);
    }
  });

  test("reportToMarkdown generates a structured, full-length document", () => {
    const sample = DEMO_PRESETS[0];
    const md = reportToMarkdown(sample);

    expect(md).toContain(`# ${sample.framer.startupTitle}`);
    expect(md).toContain(`## 1. Executive Verdict & Scorecard`);
    expect(md).toContain(`## 2. Market Sizing & Dynamics`);
    expect(md).toContain(`## 3. Competitor Landscape`);
    expect(md).toContain(`## 4. Customer Profiles & Discovery`);
    expect(md).toContain(`## 5. 90-Day Execution Plan`);
    expect(md).toContain(`Viability Score:`);
  });
});

describe("SaaSProof: Performance & In-Memory Memoization", () => {
  test("generates deterministic SHA-256 keys for identical inputs regardless of case or whitespace", () => {
    const inputA = {
      idea: "  Decentralized Compute Network for AI Training  ",
      region: "Global",
      businessModel: "AI Tool / API" as const,
      enableDeepScrape: true,
    };
    const inputB = {
      idea: "decentralized compute network for ai training",
      region: "global",
      businessModel: "AI Tool / API" as const,
      enableDeepScrape: true,
    };

    const hashA = hashAnalysisInput(inputA);
    const hashB = hashAnalysisInput(inputB);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
  });

  test("caches and retrieves analysis reports seamlessly", () => {
    clearAllCaches();
    const sample = DEMO_PRESETS[0];
    const key = hashAnalysisInput(sample.input);

    expect(getCachedAnalysis(key)).toBeNull();

    setCachedAnalysis(key, sample);
    const cached = getCachedAnalysis(key);
    expect(cached).not.toBeNull();
    expect(cached?.framer.startupTitle).toBe(sample.framer.startupTitle);
  });

  test("caches copilot answers and tracks performance stats", () => {
    clearAllCaches();
    const reportId = "rep_test_123";
    const question = "How do I acquire the first 100 users?";
    const answer = "Launch on Product Hunt and cold DM LinkedIn creators.";

    const qHash = hashCopilotQuestion(reportId, question);
    expect(qHash).toMatch(/^[a-f0-9]{64}$/);

    expect(getCachedCopilot(reportId, question)).toBeNull();

    setCachedCopilot(reportId, question, answer);
    const cached = getCachedCopilot(reportId, question);
    expect(cached).toBe(answer);

    const stats = getCacheStats();
    expect(stats.copilot.hits).toBe(1);
    expect(stats.copilot.size).toBe(1);
  });
});
