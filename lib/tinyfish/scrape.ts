import { combineSignal } from "../abort";
import { extractDisplayDomain, validatePublicHttpUrl } from "../url";

export interface FetchedPage {
  url: string;
  title: string;
  text: string;
  method: "TinyAgent" | "TinyFetch" | "JinaFallback";
}

async function jinaFetchSingle(
  url: string,
  maxCharsPerPage: number,
  signal?: AbortSignal
): Promise<FetchedPage | null> {
  const safeUrl = validatePublicHttpUrl(url);
  if (!safeUrl) return null;

  try {
    const res = await fetch(`https://r.jina.ai/${safeUrl}`, {
      headers: { Accept: "text/plain" },
      signal: combineSignal(6000, signal),
    });
    if (!res.ok) return null;
    const text = (await res.text()).slice(0, maxCharsPerPage);
    if (!text.trim()) return null;
    return {
      url: safeUrl,
      title: extractDisplayDomain(safeUrl),
      text,
      method: "JinaFallback",
    };
  } catch {
    return null;
  }
}

/**
 * Concurrently scrapes and extracts readable text from validated public competitor or research URLs.
 *
 * @param urls - Array of candidate web URLs to fetch.
 * @param maxCharsPerPage - Character truncation ceiling per page to conserve context.
 * @param signal - Optional parent AbortSignal.
 * @returns Object with parsed page contents and telemetry indicator.
 */
export async function tinyFetch(
  urls: string[],
  maxCharsPerPage = 3200,
  signal?: AbortSignal
): Promise<{ pages: FetchedPage[]; usedTinyFetch: boolean }> {
  const cleanUrls = Array.from(
    new Set(
      urls
        .map((u) => validatePublicHttpUrl(u))
        .filter((u): u is string => u !== null)
    )
  ).slice(0, 4);

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
        signal: combineSignal(9000, signal),
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

        const pages: FetchedPage[] = [];
        for (const [idx, item] of (data.results ?? []).entries()) {
          if (!item) continue;
          const rawText = item.text || item.markdown || item.content;
          if (!rawText) continue;
          const resolvedUrl =
            (item.url ? validatePublicHttpUrl(item.url) : null) ??
            cleanUrls[idx] ??
            cleanUrls[0];
          pages.push({
            url: resolvedUrl,
            title: item.title || extractDisplayDomain(resolvedUrl),
            text: rawText.slice(0, maxCharsPerPage),
            method: "TinyFetch",
          });
        }

        if (pages.length > 0) {
          return { pages, usedTinyFetch: true };
        }
      }
    } catch {
      // Fall through to Jina Reader fallback
    }
  }

  const fallbackResults = await Promise.all(
    cleanUrls.slice(0, 2).map((u) => jinaFetchSingle(u, maxCharsPerPage, signal))
  );
  return {
    pages: fallbackResults.filter((p): p is FetchedPage => p !== null),
    usedTinyFetch: false,
  };
}

/**
 * Executes a deep browser agent web inspection on a validated public competitor URL to extract
 * pricing tiers, positioning claims, and customer complaints, falling back safely to TinyFetch.
 *
 * @param url - Competitor landing page URL.
 * @param goal - Natural language instruction for what data to locate and extract.
 * @param signal - Optional parent AbortSignal.
 * @returns Deep agent findings or fallback fetch content with telemetry info.
 */
export async function tinyAgentWithFallback(
  url: string,
  goal: string,
  signal?: AbortSignal
): Promise<{
  content: string;
  usedTinyAgent: boolean;
  fallbackReason?: string;
}> {
  const safeUrl = validatePublicHttpUrl(url);
  if (!safeUrl) {
    return {
      content: "",
      usedTinyAgent: false,
      fallbackReason: "Blocked non-public or invalid URL before scraping",
    };
  }

  const fallbackToFetch = async (fallbackReason: string) => {
    const fetched = await tinyFetch([safeUrl], 3500, signal);
    return {
      content: fetched.pages[0]?.text || "",
      usedTinyAgent: false,
      fallbackReason,
    };
  };

  const apiKey = process.env.TINYFISH_API_KEY?.trim();
  if (!apiKey) {
    return fallbackToFetch("TINYFISH_API_KEY missing; fell back to TinyFetch");
  }

  try {
    const res = await fetch("https://agent.tinyfish.ai/v1/automation/run", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: safeUrl, goal }),
      signal: combineSignal(12000, signal),
    });

    if (res.status === 402 || res.status === 403 || res.status === 429) {
      return fallbackToFetch(
        `TinyAgent credits/rate limit (${res.status}); safely fell back to free TinyFetch`
      );
    }

    if (!res.ok) {
      return fallbackToFetch(
        `TinyAgent unavailable (${res.status}); fell back to free TinyFetch`
      );
    }

    const data = (await res.json()) as {
      result?: unknown;
      output?: unknown;
      data?: unknown;
      error?: string;
    };

    const payload = data.result ?? data.output ?? data.data;
    if (!payload) {
      return fallbackToFetch("TinyAgent returned empty output; fell back to free TinyFetch");
    }

    const serialized =
      typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

    return {
      content: serialized.slice(0, 4000),
      usedTinyAgent: true,
    };
  } catch (err) {
    return fallbackToFetch(
      err instanceof Error
        ? `TinyAgent timeout/error (${err.name}); fell back to free TinyFetch`
        : "TinyAgent error; fell back to free TinyFetch"
    );
  }
}
