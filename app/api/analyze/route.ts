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
  extractUserKey,
  getQuotaSnapshot,
} from "@/lib/rate-limit";
import { redactSecrets, validatePromptGuard } from "@/lib/security";
import { AnalysisInputSchema, type AgentSSEEvent } from "@/lib/types";

export const maxDuration = 300;

/**
 * GET /api/analyze
 * Returns visitor quota status and server cache telemetry.
 *
 * @param req - Incoming HTTP request.
 * @returns JSON response containing current quota and cache statistics.
 */
export async function GET(req: Request) {
  const userKey = extractUserKey(req);
  return Response.json({
    quota: getQuotaSnapshot(userKey),
    cache: getCacheStats(),
  });
}

/**
 * POST /api/analyze
 * Validates, filters, and streams multi-agent startup validation dossier over SSE.
 *
 * @param req - Incoming HTTP request with JSON payload conforming to AnalysisInputSchema.
 * @returns Server-Sent Events stream or structured HTTP error (400, 422, 429).
 */
export async function POST(req: Request) {
  const userKey = extractUserKey(req);

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = AnalysisInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message || "Invalid input parameters.",
      },
      { status: 400 }
    );
  }

  // Security Guardrail: Reject adversarial prompt injections & script payloads with HTTP 422
  const guard = validatePromptGuard(parsed.data.idea);
  if (!guard.safe) {
    return Response.json(
      {
        error: `Prompt validation failed: ${guard.reason || "Adversarial or unsupported input patterns detected."}`,
      },
      { status: 422 }
    );
  }

  const quotaCheck = consumeAnalysisQuota(userKey);
  if (!quotaCheck.allowed) {
    return Response.json(
      {
        error: `Daily limit reached (${quotaCheck.quota.analysesLimit} live analyses per ${quotaCheck.quota.resetWindowHours}h). You can still explore saved reports or instant demo presets!`,
        quota: quotaCheck.quota,
      },
      { status: 429 }
    );
  }

  const allowDeepScrape = parsed.data.enableDeepScrape
    ? consumeDeepScrapeQuota(userKey)
    : false;
  const updatedQuota = getQuotaSnapshot(userKey);

  const cacheKey = hashAnalysisInput(parsed.data);
  const cachedReport = getCachedAnalysis(cacheKey);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentSSEEvent) => {
        try {
          const rawString = JSON.stringify(event);
          const sanitizedString = redactSecrets(rawString);
          controller.enqueue(
            encoder.encode(`data: ${sanitizedString}\n\n`)
          );
        } catch {
          // Stream closed by client
        }
      };

      send({ type: "quota", quota: updatedQuota });

      if (cachedReport) {
        // Fast-path: deliver cached pipeline result instantly for benchmarks & repeat calls
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
          emit: send,
        });

        // Store in LRU memory cache for fast repeat access
        setCachedAnalysis(cacheKey, report);

        send({
          type: "complete",
          report,
          quota: getQuotaSnapshot(userKey),
        });
      } catch (err) {
        send({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Unexpected error running startup agents.",
          quota: getQuotaSnapshot(userKey),
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
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
