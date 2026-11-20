import type { SourceCitation } from "./types";

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface FetchedPage {
  url: string;
  title: string;
  text: string;
  method: "TinyAgent" | "TinyFetch" | "JinaFallback";
}

function getDomain(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

export function hitsToCitations(hits: SearchHit[], limit = 5): SourceCitation[] {
  const seen = new Set<string>();
  const citations: SourceCitation[] = [];
  for (const hit of hits) {
    if (!hit.url || seen.has(hit.url)) continue;
    seen.add(hit.url);
    citations.push({
      title: hit.title || hit.domain,
      url: hit.url,
      domain: hit.domain || getDomain(hit.url),
    });
    if (citations.length >= limit) break;
  }
  return citations;
}

async function duckDuckGoFallback(query: string): Promise<SearchHit[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      AbstractText?: string;
      AbstractURL?: string;
      Heading?: string;
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
    };
    const hits: SearchHit[] = [];
    if (data.AbstractURL && data.AbstractText) {
      hits.push({
        title: data.Heading || "Summary",
        url: data.AbstractURL,
        snippet: data.AbstractText,
        domain: getDomain(data.AbstractURL),
      });
    }
    for (const topic of data.RelatedTopics ?? []) {
      if (topic.FirstURL && topic.Text) {
        hits.push({
          title: topic.Text.split(" - ")[0]?.slice(0, 80) || "Reference",
          url: topic.FirstURL,
          snippet: topic.Text,
          domain: getDomain(topic.FirstURL),
        });
      }
      if (hits.length >= 6) break;
    }
    return hits;
  } catch {
    return [];
  }
}

export async function tinySearch(
  query: string,
  location = "US"
): Promise<{ hits: SearchHit[]; usedTinySearch: boolean }> {
  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (!apiKey) {
    return { hits: await duckDuckGoFallback(query), usedTinySearch: false };
  }

  try {
    const params = new URLSearchParams({ query });
    if (location && location !== "Global") {
      params.set("location", location);
    }

    const res = await fetch(`https://api.search.tinyfish.ai?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { hits: await duckDuckGoFallback(query), usedTinySearch: false };
    }

    const data = (await res.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        snippet?: string;
        site_name?: string;
      }>;
    };

    const hits: SearchHit[] = (data.results ?? [])
      .filter((r) => Boolean(r.url))
      .slice(0, 8)
      .map((r) => ({
        title: r.title?.trim() || r.site_name || "Search Result",
        url: r.url!.trim(),
        snippet: r.snippet?.trim() || "",
        domain: getDomain(r.url!),
      }));

    if (hits.length === 0) {
      return { hits: await duckDuckGoFallback(query), usedTinySearch: true };
    }

    return { hits, usedTinySearch: true };
  } catch {
    return { hits: await duckDuckGoFallback(query), usedTinySearch: false };
  }
}

async function jinaFetchSingle(url: string): Promise<FetchedPage | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).slice(0, 3500);
    if (!text.trim()) return null;
    return {
      url,
      title: getDomain(url),
      text,
      method: "JinaFallback",
    };
  } catch {
    return null;
  }
}

export async function tinyFetch(
  urls: string[],
  maxCharsPerPage = 3200
): Promise<{ pages: FetchedPage[]; usedTinyFetch: boolean }> {
  const cleanUrls = Array.from(new Set(urls.filter((u) => u.startsWith("http")))).slice(
    0,
    4
  );
  if (cleanUrls.length === 0) {
    return { pages: [], usedTinyFetch: false };
  }

  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (apiKey) {
    try {
      const res = await fetch("https://api.fetch.tinyfish.ai", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: cleanUrls,
          format: "markdown",
        }),
        signal: AbortSignal.timeout(9000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{
            url?: string;
            ok?: boolean;
            title?: string;
            text?: string;
            markdown?: string;
            content?: string;
          }>;
        };

        const pages: FetchedPage[] = (data.results ?? [])
          .filter((item) => item && (item.text || item.markdown || item.content))
          .map((item) => ({
            url: item.url || cleanUrls[0],
            title: item.title || getDomain(item.url || cleanUrls[0]),
            text: (item.text || item.markdown || item.content || "").slice(
              0,
              maxCharsPerPage
            ),
            method: "TinyFetch" as const,
          }));

        if (pages.length > 0) {
          return { pages, usedTinyFetch: true };
        }
      }
    } catch {
      // Fall through to Jina Reader fallback
    }
  }

  const fallbackResults = await Promise.all(cleanUrls.slice(0, 2).map(jinaFetchSingle));
  return {
    pages: fallbackResults.filter((p): p is FetchedPage => p !== null),
    usedTinyFetch: false,
  };
}

export async function tinyAgentWithFallback(
  url: string,
  goal: string
): Promise<{
  content: string;
  usedTinyAgent: boolean;
  fallbackReason?: string;
}> {
  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (!apiKey) {
    const fetched = await tinyFetch([url], 3500);
    return {
      content: fetched.pages[0]?.text || "",
      usedTinyAgent: false,
      fallbackReason: "TINYFISH_API_KEY missing; fell back to TinyFetch",
    };
  }

  try {
    const res = await fetch("https://agent.tinyfish.ai/v1/automation/run", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, goal }),
      signal: AbortSignal.timeout(12000),
    });

    if (res.status === 402 || res.status === 403 || res.status === 429) {
      const fetched = await tinyFetch([url], 3500);
      return {
        content: fetched.pages[0]?.text || "",
        usedTinyAgent: false,
        fallbackReason: `TinyAgent credits/rate limit (${res.status}); safely fell back to free TinyFetch`,
      };
    }

    if (!res.ok) {
      const fetched = await tinyFetch([url], 3500);
      return {
        content: fetched.pages[0]?.text || "",
        usedTinyAgent: false,
        fallbackReason: `TinyAgent unavailable (${res.status}); fell back to free TinyFetch`,
      };
    }

    const data = (await res.json()) as {
      result?: unknown;
      output?: unknown;
      data?: unknown;
      error?: string;
    };

    const payload = data.result ?? data.output ?? data.data;
    if (!payload) {
      const fetched = await tinyFetch([url], 3500);
      return {
        content: fetched.pages[0]?.text || "",
        usedTinyAgent: false,
        fallbackReason: "TinyAgent returned empty output; fell back to free TinyFetch",
      };
    }

    const serialized =
      typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

    return {
      content: serialized.slice(0, 4000),
      usedTinyAgent: true,
    };
  } catch (err) {
    const fetched = await tinyFetch([url], 3500);
    return {
      content: fetched.pages[0]?.text || "",
      usedTinyAgent: false,
      fallbackReason:
        err instanceof Error
          ? `TinyAgent timeout/error (${err.name}); fell back to free TinyFetch`
          : "TinyAgent error; fell back to free TinyFetch",
    };
  }
}

