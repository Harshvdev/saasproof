import {
  createSessionCookieHeader,
  guardUserTexts,
  parseJsonBodyWithLimit,
  sanitizeServerError,
} from "@/lib/api-utils";
import { runStartupPipeline } from "@/lib/agents/pipeline";
import {
  getCachedAnalysis,
  getCacheStats,
  hashAnalysisInput,
  setCachedAnalysis,
} from "@/lib/cache";
import {
  consumeAnalysisQuota,
  consumeDeepScrapeQuota,
  extractIpKey,
  extractSessionCookieId,
  extractUserKey,
  getQuotaSnapshot,
} from "@/lib/rate-limit";
import { redactSecrets } from "@/lib/security";
import { AnalysisInputSchema, type AgentSSEEvent } from "@/lib/types";

export const maxDuration = 300;

const MAX_ANALYZE_BODY_BYTES = 16_384;

/**
 * GET /api/analyze
 * Returns visitor quota status and issues an HttpOnly session cookie if absent.
 *
 * @param req - Incoming HTTP request.
 * @returns JSON response containing current quota and cache statistics.
 */
export async function GET(req: Request) {
  const userKey = extractUserKey(req);
  const ipKey = extractIpKey(req);
  const headers = new Headers();
  if (!extractSessionCookieId(req)) {
    headers.set("Set-Cookie", createSessionCookieHeader(req));
  }
  headers.set("Cache-Control", "no-store");

  return Response.json(
    {
      quota: getQuotaSnapshot(userKey, ipKey),
      cache: getCacheStats(),
    },
    { headers }
  );
}

/**
 * POST /api/analyze
 * Validates, filters, and streams multi-agent startup validation dossier over SSE.
 *
 * @param req - Incoming HTTP request with JSON payload conforming to AnalysisInputSchema.
 * @returns Server-Sent Events stream or structured HTTP error (400, 413, 415, 422, 429).
 */
export async function POST(req: Request) {
  const userKey = extractUserKey(req);
  const ipKey = extractIpKey(req);

  const parsedJson = await parseJsonBodyWithLimit(req, MAX_ANALYZE_BODY_BYTES);
  if (!parsedJson.ok) return parsedJson.response;

  const parsed = AnalysisInputSchema.safeParse(parsedJson.data);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message || "Invalid input parameters.",
      },
      { status: 400 }
    );
  }

  // Security Guardrail: Reject adversarial prompt injections & script payloads with HTTP 422
  const guardResponse = guardUserTexts([parsed.data.idea, parsed.data.region]);
  if (guardResponse) return guardResponse;

  const quotaCheck = consumeAnalysisQuota(userKey, ipKey);
  if (!quotaCheck.allowed) {
    return Response.json(
      {
        error: `Daily limit reached (${quotaCheck.quota.analysesLimit} live analyses per ${quotaCheck.quota.resetWindowHours}h). You can still explore saved reports or instant demo presets!`,
        quota: quotaCheck.quota,
      },
      { status: 429 }
    );
  }

  const cacheKey = hashAnalysisInput(parsed.data);
  const cachedReport = getCachedAnalysis(cacheKey);

  // Only consume deep-scrape quota when executing a non-cached live pipeline
  const allowDeepScrape =
    !cachedReport && parsed.data.enableDeepScrape
      ? consumeDeepScrapeQuota(userKey, ipKey)
      : false;
  const updatedQuota = getQuotaSnapshot(userKey, ipKey);

  const encoder = new TextEncoder();
  const streamAbortController = new AbortController();
  const linkedSignal = req.signal
    ? AbortSignal.any([req.signal, streamAbortController.signal])
    : streamAbortController.signal;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentSSEEvent) => {
        if (linkedSignal.aborted) return;
        try {
          const rawString = JSON.stringify(event);
          const sanitizedString = redactSecrets(rawString);
          controller.enqueue(encoder.encode(`data: ${sanitizedString}\n\n`));
        } catch {
          // Stream closed by client
        }
      };

      send({ type: "quota", quota: updatedQuota });

      if (cachedReport) {
        send({
          type: "stage",
          agent: "framer",
          status: "done",
          message: `Framed "${cachedReport.framer.startupTitle}" (cached)`,
        });
        send({ type: "partial", section: "framer", data: cachedReport.framer });
        send({ type: "partial", section: "market", data: cachedReport.market });
        send({ type: "partial", section: "competitors", data: cachedReport.competitors });
        send({ type: "partial", section: "customers", data: cachedReport.customers });
        send({ type: "partial", section: "validator", data: cachedReport.validator });
        send({ type: "partial", section: "planner", data: cachedReport.planner });

        send({
          type: "complete",
          report: cachedReport,
          quota: getQuotaSnapshot(userKey),
        });
        controller.close();
        return;
      }

      try {
        const report = await runStartupPipeline({
          input: parsed.data,
          allowDeepScrape,
          signal: linkedSignal,
          emit: send,
        });

        setCachedAnalysis(cacheKey, report);

        send({
          type: "complete",
          report,
          quota: getQuotaSnapshot(userKey),
        });
      } catch (err) {
        if (!linkedSignal.aborted) {
          const safeMessage = sanitizeServerError(
            "api/analyze",
            err,
            "Unable to complete startup analysis right now. Please try again."
          );
          send({
            type: "error",
            message: safeMessage,
            quota: getQuotaSnapshot(userKey),
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
    cancel() {
      streamAbortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
