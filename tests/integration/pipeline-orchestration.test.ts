import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { runStartupPipeline } from "../../lib/agents/pipeline";
import { resetLlmCaches } from "../../lib/llm";
import { DEMO_PRESETS } from "../../lib/presets";
import type { AgentSSEEvent } from "../../lib/types";

const originalFetch = globalThis.fetch;
const originalGemini = process.env.GEMINI_API_KEY;
const originalTinyfish = process.env.TINYFISH_API_KEY;

describe("Integration Suite: 3-Stage Multi-Agent Pipeline Orchestration", () => {
  beforeEach(() => {
    resetLlmCaches();
    process.env.GEMINI_API_KEY = "AIzaSyFakePipelineTestKey1234567890123";
    delete process.env.TINYFISH_API_KEY;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGemini;
    if (originalTinyfish === undefined) delete process.env.TINYFISH_API_KEY;
    else process.env.TINYFISH_API_KEY = originalTinyfish;
  });

  test("executes Stage 1 -> 4 parallel Stage 2 specialists -> Stage 3 planner and emits partial SSE events", async () => {
    const sample = DEMO_PRESETS[0];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("api.duckduckgo.com")) {
        return new Response(
          JSON.stringify({
            Heading: "Recommerce Study",
            AbstractURL: "https://example.com/study",
            AbstractText: "High trust gap in peer-to-peer used goods.",
            RelatedTopics: [],
          }),
          { status: 200 }
        );
      }
      if (url.includes("r.jina.ai")) {
        return new Response("Competitor pricing starts at $19 per inspection.", {
          status: 200,
        });
      }
      if (url.includes("generativelanguage.googleapis.com")) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          systemInstruction?: { parts?: Array<{ text?: string }> };
        };
        const sys = body.systemInstruction?.parts?.[0]?.text ?? "";
        let payload: unknown = sample.planner;
        if (sys.includes("Y Combinator partner")) payload = sample.framer;
        else if (sys.includes("venture market analyst")) payload = sample.market;
        else if (sys.includes("competitive intelligence analyst"))
          payload = sample.competitors;
        else if (sys.includes("customer discovery")) payload = sample.customers;
        else if (sys.includes("Devil's Advocate")) payload = sample.validator;

        return new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: JSON.stringify(payload) }] } },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response("Not Found", { status: 404 });
    }) as unknown as typeof fetch;

    const events: AgentSSEEvent[] = [];
    const report = await runStartupPipeline({
      input: sample.input,
      allowDeepScrape: false,
      emit: (ev) => events.push(ev),
    });

    expect(report.id).toMatch(/^sp_/);
    expect(report.framer.startupTitle).toBe(sample.framer.startupTitle);
    expect(report.telemetry.llmProviderUsed).toBe("Gemini");
    expect(report.telemetry.tinySearchCalls).toBe(4);
    expect(report.telemetry.tinyAgentUsed).toBe(false);
    expect(report.competitors.deepScrapeNote).toContain("quota reached");

    const partialSections = events
      .filter((e): e is Extract<AgentSSEEvent, { type: "partial" }> => e.type === "partial")
      .map((e) => e.section);
    expect(partialSections[0]).toBe("framer");
    expect(partialSections[partialSections.length - 1]).toBe("planner");
    expect(partialSections).toHaveLength(6);
  });

  test("honors AbortSignal cancellation immediately without executing downstream stages", async () => {
    const controller = new AbortController();
    controller.abort();

    let rejected = false;
    try {
      await runStartupPipeline({
        input: DEMO_PRESETS[0].input,
        allowDeepScrape: false,
        signal: controller.signal,
        emit: () => {},
      });
    } catch {
      rejected = true;
    }
    expect(rejected).toBe(true);
  });
});
