import { afterEach, describe, expect, test } from "bun:test";
import {
  tinyAgentWithFallback,
  tinyFetch,
  tinySearch,
} from "../../lib/tinyfish";

const originalFetch = globalThis.fetch;
const originalTinyfishKey = process.env.TINYFISH_API_KEY;

describe("Unit Suite: TinyFish Web Grounding, SSRF Guards & Fallbacks", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalTinyfishKey === undefined) delete process.env.TINYFISH_API_KEY;
    else process.env.TINYFISH_API_KEY = originalTinyfishKey;
  });

  test("tinySearch uses DuckDuckGo fallback when TINYFISH_API_KEY is unset and filters private URLs", async () => {
    delete process.env.TINYFISH_API_KEY;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          Heading: "SaaS Benchmarks",
          AbstractURL: "https://example.org/benchmarks",
          AbstractText: "Median B2B SaaS net dollar retention is 108%.",
          RelatedTopics: [
            { FirstURL: "http://127.0.0.1/internal", Text: "Blocked localhost" },
            { FirstURL: "https://reports.example.com/q4", Text: "Public report - Q4" },
          ],
        }),
        { status: 200 }
      )) as unknown as typeof fetch;

    const res = await tinySearch("B2B SaaS benchmarks", "India");
    expect(res.usedTinySearch).toBe(false);
    expect(res.hits).toHaveLength(2);
    expect(res.hits.some((h) => h.url.includes("127.0.0.1"))).toBe(false);
  });

  test("tinySearch queries TinyFish Search when API key is configured", async () => {
    process.env.TINYFISH_API_KEY = "tf_test_key_123456";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("api.search.tinyfish.ai");
      return new Response(
        JSON.stringify({
          results: [
            {
              title: "Rival Pricing",
              url: "https://competitor.example.com/pricing",
              snippet: "Starts at $49/mo",
            },
            {
              title: "SSRF Attempt",
              url: "http://169.254.169.254/latest/meta-data",
              snippet: "Metadata",
            },
          ],
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const res = await tinySearch("competitor pricing", "Global");
    expect(res.usedTinySearch).toBe(true);
    expect(res.hits).toHaveLength(1);
    expect(res.hits[0]?.domain).toBe("competitor.example.com");
  });

  test("tinyFetch rejects non-public URLs and respects maxCharsPerPage in Jina fallback", async () => {
    delete process.env.TINYFISH_API_KEY;
    let fetchCalls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      fetchCalls += 1;
      expect(String(input)).toBe("https://r.jina.ai/https://public.example.com/page");
      return new Response("A".repeat(2500), { status: 200 });
    }) as unknown as typeof fetch;

    const res = await tinyFetch(
      [
        "http://localhost:8080/secret",
        "http://10.0.0.1/admin",
        "https://public.example.com/page",
      ],
      600
    );

    expect(fetchCalls).toBe(1);
    expect(res.usedTinyFetch).toBe(false);
    expect(res.pages).toHaveLength(1);
    expect(res.pages[0]?.text.length).toBe(600);
    expect(res.pages[0]?.method).toBe("JinaFallback");
  });

  test("tinyAgentWithFallback blocks SSRF URLs and falls back cleanly on HTTP 402", async () => {
    const blocked = await tinyAgentWithFallback("http://127.0.0.1:8000", "Extract pricing");
    expect(blocked.usedTinyAgent).toBe(false);
    expect(blocked.fallbackReason).toContain("Blocked");

    process.env.TINYFISH_API_KEY = "tf_test_key_123456";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("agent.tinyfish.ai")) {
        return new Response("Payment Required", { status: 402 });
      }
      if (url.includes("api.fetch.tinyfish.ai")) {
        return new Response(
          JSON.stringify({
            results: [
              {
                url: "https://rival.example.com/pricing",
                title: "Rival Pricing",
                markdown: "Pro Tier: $79/mo",
              },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response("", { status: 404 });
    }) as unknown as typeof fetch;

    const res = await tinyAgentWithFallback(
      "https://rival.example.com/pricing",
      "Extract pricing tiers"
    );
    expect(res.usedTinyAgent).toBe(false);
    expect(res.fallbackReason).toContain("402");
    expect(res.content).toContain("Pro Tier: $79/mo");
  });
});
