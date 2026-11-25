import { combineSignal } from "../abort";
import type { SourceCitation } from "../types";
import { extractDisplayDomain, validatePublicHttpUrl } from "../url";

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

/**
 * Transforms raw search hit records into deduplicated, URL-validated citation objects.
 *
 * @param hits - Array of search results.
 * @param limit - Maximum number of citations to return (defaults to 5).
 * @returns Array of deduplicated SourceCitation objects with validated http(s) URLs.
 */
export function hitsToCitations(hits: SearchHit[], limit = 5): SourceCitation[] {
  const seen = new Set<string>();
  const citations: SourceCitation[] = [];
  for (const hit of hits) {
    const safeUrl = validatePublicHttpUrl(hit.url);
    if (!safeUrl || seen.has(safeUrl)) continue;
    seen.add(safeUrl);
    citations.push({
      title: hit.title || hit.domain || extractDisplayDomain(safeUrl),
      url: safeUrl,
      domain: hit.domain || extractDisplayDomain(safeUrl),
    });
    if (citations.length >= limit) break;
  }
  return citations;
}

async function duckDuckGoFallback(
  query: string,
  signal?: AbortSignal
): Promise<SearchHit[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: combineSignal(7000, signal) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      AbstractText?: string;
      AbstractURL?: string;
      Heading?: string;
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
    };
    const hits: SearchHit[] = [];

    const abstractUrl = data.AbstractURL ? validatePublicHttpUrl(data.AbstractURL) : null;
    if (abstractUrl && data.AbstractText) {
      hits.push({
        title: data.Heading || "Summary",
        url: abstractUrl,
        snippet: data.AbstractText,
        domain: extractDisplayDomain(abstractUrl),
      });
    }

    for (const topic of data.RelatedTopics ?? []) {
      const topicUrl = topic.FirstURL ? validatePublicHttpUrl(topic.FirstURL) : null;
      if (topicUrl && topic.Text) {
        hits.push({
          title: topic.Text.split(" - ")[0]?.slice(0, 80) || "Reference",
          url: topicUrl,
          snippet: topic.Text,
          domain: extractDisplayDomain(topicUrl),
        });
      }
      if (hits.length >= 6) break;
    }
    return hits;
  } catch {
    return [];
  }
}

/**
 * Searches the live web using TinyFish Search API with automatic DuckDuckGo fallback.
 * Enforces SSRF URL validation on all returned search hit URLs.
 *
 * @param query - Web search query string.
 * @param location - Target country/region code (defaults to "US").
 * @param signal - Optional parent AbortSignal.
 * @returns Object with retrieved search hits and provider telemetry flag.
 */
export async function tinySearch(
  query: string,
  location = "US",
  signal?: AbortSignal
): Promise<{ hits: SearchHit[]; usedTinySearch: boolean }> {
  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (!apiKey) {
    return { hits: await duckDuckGoFallback(query, signal), usedTinySearch: false };
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
      signal: combineSignal(8000, signal),
    });

    if (!res.ok) {
      return { hits: await duckDuckGoFallback(query, signal), usedTinySearch: false };
    }

    const data = (await res.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        snippet?: string;
        site_name?: string;
      }>;
    };

    const hits: SearchHit[] = [];
    for (const item of data.results ?? []) {
      if (hits.length >= 8) break;
      const safeUrl = item.url ? validatePublicHttpUrl(item.url) : null;
      if (!safeUrl) continue;
      hits.push({
        title: item.title?.trim() || item.site_name || "Search Result",
        url: safeUrl,
        snippet: item.snippet?.trim() || "",
        domain: extractDisplayDomain(safeUrl),
      });
    }

    if (hits.length === 0) {
      return { hits: await duckDuckGoFallback(query, signal), usedTinySearch: true };
    }

    return { hits, usedTinySearch: true };
  } catch {
    return { hits: await duckDuckGoFallback(query, signal), usedTinySearch: false };
  }
}
