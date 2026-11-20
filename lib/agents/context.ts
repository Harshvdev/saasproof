import type { FetchedPage, SearchHit } from "../tinyfish";

/**
 * Formats retrieved search engine hits and scraped web page content
 * into a structured context string bounded for LLM prompt windows.
 *
 * @param hits - SearchHit items retrieved from live web queries.
 * @param pages - FetchedPage items extracted from competitor or market URLs.
 * @returns Bounded, formatted markdown-compatible context string.
 */
export function formatSearchContext(hits: SearchHit[], pages: FetchedPage[]): string {
  const snippetBlock = hits
    .slice(0, 5)
    .map(
      (h, idx) =>
        `[${idx + 1}] ${h.title}\nURL: ${h.url}\nSnippet: ${h.snippet.slice(0, 260)}`
    )
    .join("\n\n");

  const pageBlock = pages
    .slice(0, 2)
    .map(
      (p, idx) =>
        `[Page ${idx + 1} via ${p.method}] ${p.title} (${p.url})\n${p.text.slice(0, 1400)}`
    )
    .join("\n\n---\n\n");

  const combined = `SEARCH RESULTS:\n${snippetBlock || "No search results."}\n\nFETCHED CONTENT:\n${pageBlock || "None."}`;
  return combined.slice(0, 5200);
}
