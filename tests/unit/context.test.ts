import { describe, expect, test } from "bun:test";
import { formatSearchContext } from "../../lib/agents/context";

describe("Unit Suite: Search & Context Aggregation", () => {
  test("formats fallback text cleanly when hits and pages are empty", () => {
    const res = formatSearchContext([], []);
    expect(res).toContain("No search results.");
    expect(res).toContain("None.");
  });

  test("formats search snippets with index, title, and bounded snippet length", () => {
    const hits = [
      {
        title: "YC Startup School Guide",
        url: "https://startupschool.org/guide",
        snippet: "How to talk to users and validate your value proposition without bias.",
        domain: "startupschool.org",
      },
    ];
    const res = formatSearchContext(hits, []);
    expect(res).toContain("[1] YC Startup School Guide");
    expect(res).toContain("URL: https://startupschool.org/guide");
    expect(res).toContain("Snippet: How to talk to users");
  });

  test("formats fetched competitor pages and truncates long text bounds", () => {
    const pages = [
      {
        url: "https://rivalsaas.com/pricing",
        title: "Rival SaaS Pricing",
        text: "Starter plan: $29/mo. Professional plan: $99/mo with priority support.",
        method: "TinyFetch" as const,
      },
    ];
    const res = formatSearchContext([], pages);
    expect(res).toContain("[Page 1 via TinyFetch] Rival SaaS Pricing");
    expect(res).toContain("Starter plan: $29/mo.");
  });
});
