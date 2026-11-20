import { getCachedCopilot, setCachedCopilot } from "@/lib/cache";
import { generateChatReply } from "@/lib/llm";
import { consumeCopilotQuota, extractUserKey } from "@/lib/rate-limit";
import { tinySearch } from "@/lib/tinyfish";
import { CopilotRequestSchema } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const userKey = extractUserKey(req);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = CopilotRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid question." },
      { status: 400 }
    );
  }

  const quotaRes = consumeCopilotQuota(userKey);
  if (!quotaRes.allowed) {
    return Response.json(
      {
        error: `Daily Co-Pilot chat limit reached (${quotaRes.quota.copilotMessagesLimit} messages / 24h).`,
        quota: quotaRes.quota,
      },
      { status: 429 }
    );
  }

  const { question, useLiveWeb, report, history } = parsed.data;

  // Fast-path: deliver cached reply for non-web repeat queries without conversational history
  if (!useLiveWeb && (!history || history.length === 0)) {
    const cachedAnswer = getCachedCopilot(report.id, question);
    if (cachedAnswer) {
      return Response.json({
        answer: cachedAnswer,
        provider: "cache",
        sources: [],
        quota: quotaRes.quota,
        cached: true,
      });
    }
  }

  let webSnippetBlock = "";
  let liveSources: Array<{ title: string; url: string; domain: string }> = [];

  if (useLiveWeb) {
    const searchRes = await tinySearch(
      `${report.framer.startupTitle} ${question}`,
      report.input.region
    );
    liveSources = searchRes.hits.slice(0, 4).map((h) => ({
      title: h.title,
      url: h.url,
      domain: h.domain,
    }));
    webSnippetBlock =
      searchRes.hits.length > 0
        ? `\nLIVE WEB SEARCH CONTEXT:\n${searchRes.hits
            .slice(0, 4)
            .map((h) => `- ${h.title} (${h.url}): ${h.snippet}`)
            .join("\n")}`
        : "";
  }

  const compactReportContext = {
    startup: report.framer,
    market: {
      tam: report.market.tam,
      sam: report.market.sam,
      som: report.market.som,
      growthRate: report.market.growthRate,
      verdict: report.market.marketVerdict,
    },
    competitors: report.competitors.competitors.map((c) => ({
      name: c.name,
      pricing: c.pricingModel,
      gaps: c.weaknessesOrGaps,
    })),
    validator: {
      score: report.validator.overallScore,
      verdict: report.validator.verdictBadge,
      risks: report.validator.fatalRisks,
      pivots: report.validator.pivotSuggestions,
      unitEconomics: report.validator.unitEconomicsNote,
    },
    planner: {
      wedge: report.planner.recommendedWedge,
      monetization: report.planner.monetizationStrategy,
      playbook: report.planner.firstTenCustomersPlaybook,
    },
  };

  const historyText = history
    .slice(-6)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  try {
    const reply = await generateChatReply({
      systemPrompt:
        "You are SparkProof's Startup Co-Pilot. Answer founder follow-up questions, test pivots, refine pricing/positioning, and give sharp, concrete numbers and action steps grounded in the validation report below. Keep answers concise, structured with bullet points, and honest about trade-offs.",
      userPrompt: `VALIDATION REPORT CONTEXT:
${JSON.stringify(compactReportContext, null, 2)}
${webSnippetBlock}

CONVERSATION HISTORY:
${historyText || "(none)"}

FOUNDER QUESTION:
${question}`,
    });

    if (!useLiveWeb && (!history || history.length === 0)) {
      setCachedCopilot(report.id, question, reply.text);
    }

    return Response.json({
      answer: reply.text,
      provider: reply.provider,
      sources: liveSources,
      quota: quotaRes.quota,
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate co-pilot response.",
        quota: quotaRes.quota,
      },
      { status: 500 }
    );
  }
}
