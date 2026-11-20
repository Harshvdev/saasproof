import { generateStructuredJSON } from "../llm";
import {
  hitsToCitations,
  tinyAgentWithFallback,
  tinyFetch,
  tinySearch,
  type FetchedPage,
  type SearchHit,
} from "../tinyfish";
import {
  CompetitorOutputSchema,
  CustomerOutputSchema,
  FramerOutputSchema,
  MarketOutputSchema,
  PlannerOutputSchema,
  ValidatorOutputSchema,
  type AgentSSEEvent,
  type AnalysisInput,
  type CompetitorOutput,
  type CustomerOutput,
  type FramerOutput,
  type MarketOutput,
  type PlannerOutput,
  type StartupReport,
  type ValidatorOutput,
} from "../types";

type EmitFn = (event: AgentSSEEvent) => void;

function formatSearchContext(hits: SearchHit[], pages: FetchedPage[]): string {
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

/**
 * Orchestrates the full 3-stage, 6-agent startup validation pipeline.
 * Executes Stage 1 (Framing), Stage 2 (Parallel Market, Competitor, Customer, Risk specialists),
 * and Stage 3 (Execution Planner), emitting real-time Server-Sent Events (SSE).
 *
 * @param opts - Pipeline execution options including AnalysisInput, deep scraping allowance, and emit callback.
 * @returns Complete, grounded StartupReport object with verified citations and telemetry.
 */
export async function runStartupPipeline(opts: {
  input: AnalysisInput;
  allowDeepScrape: boolean;
  emit: EmitFn;
}): Promise<Omit<StartupReport, "id" | "createdAt"> & { id: string; createdAt: string }> {
  const startedAt = Date.now();
  const { input, allowDeepScrape, emit } = opts;

  let tinySearchCalls = 0;
  let tinyFetchCalls = 0;
  let tinyAgentUsed = false;
  let tinyAgentFallbackReason: string | undefined;
  const providersUsed = new Set<string>();

  // ---------------------------------------------------------------------------
  // STAGE 1: Intake & Framing Agent
  // ---------------------------------------------------------------------------
  emit({
    type: "stage",
    agent: "framer",
    status: "running",
    message: "Decomposing startup idea into market, competitor, and risk queries...",
  });

  const framerRes = await generateStructuredJSON<FramerOutput>({
    systemPrompt:
      "You are a Y Combinator partner & startup strategist. Frame raw founder ideas into crisp, searchable research dimensions.",
    userPrompt: `Startup Idea: "${input.idea}"
Target Region: ${input.region}
Preferred Model: ${input.businessModel}

Produce a concise startup title (2-4 words), a sharp one-liner, category, detected business model, target geography, core problem statement, and 4 focused Google/web search queries (4-8 words each, no quotes) to research market size, real competitors, customer pain points, and operational/regulatory risks.`,
    schema: FramerOutputSchema,
    schemaHint: `{
  "startupTitle": "string",
  "oneLiner": "string",
  "category": "string",
  "detectedModel": "string",
  "targetGeography": "string",
  "coreProblem": "string",
  "searchQueries": {
    "market": "string",
    "competitors": "string",
    "customers": "string",
    "risks": "string"
  }
}`,
  });

  providersUsed.add(framerRes.provider);
  const framer = framerRes.data;

  emit({
    type: "stage",
    agent: "framer",
    status: "done",
    message: `Framed "${framer.startupTitle}" (${framer.detectedModel})`,
    queries: [
      framer.searchQueries.market,
      framer.searchQueries.competitors,
      framer.searchQueries.customers,
      framer.searchQueries.risks,
    ],
    provider: framerRes.provider,
  });
  emit({ type: "partial", section: "framer", data: framer });

  // ---------------------------------------------------------------------------
  // STAGE 2: 4 Parallel Specialist Agents
  // ---------------------------------------------------------------------------
  const runMarketAgent = async (): Promise<MarketOutput> => {
    emit({
      type: "stage",
      agent: "market",
      status: "running",
      message: `Searching market size & growth signals for "${framer.searchQueries.market}"...`,
      queries: [framer.searchQueries.market],
    });

    const searchRes = await tinySearch(framer.searchQueries.market, input.region);
    tinySearchCalls += 1;

    const topUrls = searchRes.hits.slice(0, 2).map((h) => h.url);
    const fetchRes = await tinyFetch(topUrls, 1500);
    tinyFetchCalls += fetchRes.pages.length;

    emit({
      type: "stage",
      agent: "market",
      status: "running",
      message: `Sizing TAM/SAM/SOM from ${searchRes.hits.length} sources...`,
    });

    const citations = hitsToCitations(searchRes.hits, 5);
    const context = formatSearchContext(searchRes.hits, fetchRes.pages);

    const res = await generateStructuredJSON<MarketOutput>({
      systemPrompt:
        "You are a venture market analyst. Synthesize realistic TAM/SAM/SOM estimates grounded in the retrieved web sources. Do not invent fake URLs—only cite URLs from the provided context.",
      userPrompt: `Startup: ${framer.startupTitle} — ${framer.oneLiner}
Region: ${framer.targetGeography}
Problem: ${framer.coreProblem}

${context}

Return market sizing (TAM, SAM, SOM with short clear labels like "$18.4B" plus 1-sentence bottom-up/top-down explanation), CAGR/growthRate, a crisp 2-sentence marketVerdict, 3 tailwinds, 3 headwinds, and the verified sources array.`,
      schema: MarketOutputSchema,
      schemaHint: `{
  "tam": "string",
  "tamDetail": "string",
  "sam": "string",
  "samDetail": "string",
  "som": "string",
  "somDetail": "string",
  "growthRate": "string",
  "marketVerdict": "string",
  "tailwinds": ["string", "string", "string"],
  "headwinds": ["string", "string", "string"],
  "sources": [{ "title": "string", "url": "string", "domain": "string" }]
}`,
    });

    providersUsed.add(res.provider);
    const finalMarket: MarketOutput = {
      ...res.data,
      sources: res.data.sources.length > 0 ? res.data.sources : citations,
    };

    emit({
      type: "stage",
      agent: "market",
      status: "done",
      message: `Estimated TAM ${finalMarket.tam} (${finalMarket.growthRate}) from ${finalMarket.sources.length} sources`,
      sources: finalMarket.sources,
      provider: res.provider,
    });
    emit({ type: "partial", section: "market", data: finalMarket });
    return finalMarket;
  };

  const runCompetitorAgent = async (): Promise<CompetitorOutput> => {
    emit({
      type: "stage",
      agent: "competitors",
      status: "running",
      message: `Mapping live competitors via TinySearch & TinyFetch...`,
      queries: [framer.searchQueries.competitors],
    });

    const searchRes = await tinySearch(framer.searchQueries.competitors, input.region);
    tinySearchCalls += 1;

    const topUrls = searchRes.hits.slice(0, 2).map((h) => h.url);

    let deepAgentContext = "";
    let deepNote =
      "Standard TinySearch + TinyFetch extraction used ($0 free tier).";
    let deepStatus: "done" | "fallback" = "done";

    if (input.enableDeepScrape && allowDeepScrape && topUrls[0]) {
      emit({
        type: "stage",
        agent: "competitors",
        status: "running",
        message: `Deep-scraping ${searchRes.hits[0]?.domain || topUrls[0]} + fetching rival pages...`,
      });
    } else {
      emit({
        type: "stage",
        agent: "competitors",
        status: "running",
        message: `Fetching ${topUrls.length} competitor pages...`,
      });
    }

    const [fetchRes, agentRes] = await Promise.all([
      tinyFetch(topUrls, 1500),
      input.enableDeepScrape && allowDeepScrape && topUrls[0]
        ? tinyAgentWithFallback(
            topUrls[0],
            `Extract exact product positioning, pricing tiers or fees, target customers, and any customer complaints or limitations visible on this site.`
          )
        : Promise.resolve(null),
    ]);
    tinyFetchCalls += fetchRes.pages.length;

    if (agentRes) {
      tinyAgentUsed = agentRes.usedTinyAgent;
      if (agentRes.usedTinyAgent) {
        deepAgentContext = `\n\nDEEP TINYAGENT EXTRACTION (${topUrls[0]}):\n${agentRes.content}`;
        deepNote = `Deep live extraction succeeded via TinyAgent on ${searchRes.hits[0]?.domain || topUrls[0]}.`;
      } else {
        tinyAgentFallbackReason = agentRes.fallbackReason;
        deepAgentContext = agentRes.content
          ? `\n\nFALLBACK FETCH (${topUrls[0]}):\n${agentRes.content}`
          : "";
        deepNote =
          agentRes.fallbackReason ||
          "TinyAgent unavailable; safely fell back to free TinyFetch.";
        deepStatus = "fallback";
      }
    } else if (input.enableDeepScrape && !allowDeepScrape) {
      deepNote =
        "Per-user TinyAgent deep-scrape quota reached; automatically used free TinyFetch instead.";
      tinyAgentFallbackReason = deepNote;
      deepStatus = "fallback";
    }

    emit({
      type: "stage",
      agent: "competitors",
      status: "running",
      message: `Analyzing ${fetchRes.pages.length} fetched pages & mapping rivals...`,
    });

    const citations = hitsToCitations(searchRes.hits, 5);
    const context = `${formatSearchContext(searchRes.hits, fetchRes.pages)}${deepAgentContext}`;

    const res = await generateStructuredJSON<CompetitorOutput>({
      systemPrompt:
        "You are a competitive intelligence analyst. Identify 4-5 real direct or adjacent competitors from the retrieved search results and pages. Never fabricate URLs—use real URLs from context or verified competitor domains.",
      userPrompt: `Startup: ${framer.startupTitle} — ${framer.oneLiner}
Category: ${framer.category}
Region: ${framer.targetGeography}

${context}

Return landscapeSummary, the single sharpest whiteSpaceOpportunity, 4-5 competitors (with name, real url, positioning, pricingModel, 2 strengths, 2 weaknessesOrGaps, threatLevel High/Medium/Low, extractionMethod), and verified sources.`,
      schema: CompetitorOutputSchema,
      schemaHint: `{
  "landscapeSummary": "string",
  "whiteSpaceOpportunity": "string",
  "competitors": [
    {
      "name": "string",
      "url": "https://...",
      "positioning": "string",
      "pricingModel": "string",
      "strengths": ["string", "string"],
      "weaknessesOrGaps": ["string", "string"],
      "threatLevel": "High" | "Medium" | "Low",
      "extractionMethod": "TinyAgent" | "TinyFetch" | "TinySearch"
    }
  ],
  "sources": [{ "title": "string", "url": "string", "domain": "string" }]
}`,
    });

    providersUsed.add(res.provider);
    const finalCompetitors: CompetitorOutput = {
      ...res.data,
      deepScrapeNote: deepNote,
      sources: res.data.sources.length > 0 ? res.data.sources : citations,
    };

    emit({
      type: "stage",
      agent: "competitors",
      status: deepStatus,
      message: `Mapped ${finalCompetitors.competitors.length} competitors${tinyAgentUsed ? " (including TinyAgent deep scrape)" : ""}`,
      sources: finalCompetitors.sources,
      provider: res.provider,
    });
    emit({ type: "partial", section: "competitors", data: finalCompetitors });
    return finalCompetitors;
  };

  const runCustomerAgent = async (): Promise<CustomerOutput> => {
    emit({
      type: "stage",
      agent: "customers",
      status: "running",
      message: `Researching buyer pain points & ICPs for "${framer.searchQueries.customers}"...`,
      queries: [framer.searchQueries.customers],
    });

    const searchRes = await tinySearch(framer.searchQueries.customers, input.region);
    tinySearchCalls += 1;

    const fetchRes = await tinyFetch(
      searchRes.hits.slice(0, 2).map((h) => h.url),
      1500
    );
    tinyFetchCalls += fetchRes.pages.length;

    emit({
      type: "stage",
      agent: "customers",
      status: "running",
      message: `Building ICP personas & interview script from ${searchRes.hits.length} sources...`,
    });

    const citations = hitsToCitations(searchRes.hits, 4);
    const context = formatSearchContext(searchRes.hits, fetchRes.pages);

    const res = await generateStructuredJSON<CustomerOutput>({
      systemPrompt:
        "You are a customer discovery & UX researcher trained in 'The Mom Test'. Profile concrete ICPs (include both Demand and Supply personas if this is a 2-sided marketplace!) and write non-leading discovery interview questions.",
      userPrompt: `Startup: ${framer.startupTitle} — ${framer.oneLiner}
Model: ${framer.detectedModel}
Problem: ${framer.coreProblem}

${context}

Return targetSummary, 2-3 detailed customer personas, 5 Mom-Test interview questions, a compelling earlyAdopterHook, and verified sources.`,
      schema: CustomerOutputSchema,
      schemaHint: `{
  "targetSummary": "string",
  "personas": [
    {
      "name": "string",
      "roleOrSegment": "string",
      "side": "Demand / Buyer" | "Supply / Provider" | "Primary User",
      "topPainPoints": ["string", "string", "string"],
      "currentWorkaround": "string",
      "willingnessToPay": "string",
      "acquisitionChannels": ["string", "string"]
    }
  ],
  "interviewQuestions": ["string", "string", "string", "string", "string"],
  "earlyAdopterHook": "string",
  "sources": [{ "title": "string", "url": "string", "domain": "string" }]
}`,
    });

    providersUsed.add(res.provider);
    const finalCustomers: CustomerOutput = {
      ...res.data,
      sources: res.data.sources.length > 0 ? res.data.sources : citations,
    };

    emit({
      type: "stage",
      agent: "customers",
      status: "done",
      message: `Built ${finalCustomers.personas.length} ICP personas + ${finalCustomers.interviewQuestions.length} interview questions`,
      sources: finalCustomers.sources,
      provider: res.provider,
    });
    emit({ type: "partial", section: "customers", data: finalCustomers });
    return finalCustomers;
  };

  const runValidatorAgent = async (): Promise<ValidatorOutput> => {
    emit({
      type: "stage",
      agent: "validator",
      status: "running",
      message: `Stress-testing unit economics, disintermediation & execution risks...`,
      queries: [framer.searchQueries.risks],
    });

    const searchRes = await tinySearch(framer.searchQueries.risks, input.region);
    tinySearchCalls += 1;

    const context = formatSearchContext(searchRes.hits, []);

    const res = await generateStructuredJSON<ValidatorOutput>({
      systemPrompt:
        "You are a blunt, analytical Devil's Advocate VC partner. Score startup viability honestly (never inflate scores artificially—most raw ideas score 55-78 unless truly exceptional) and surface real operational, trust, liability, and unit-economics risks.",
      userPrompt: `Startup: ${framer.startupTitle} — ${framer.oneLiner}
Model: ${framer.detectedModel}
Region: ${framer.targetGeography}
Problem: ${framer.coreProblem}

${context}

Score 5 dimensions (0-100): demand, differentiation, feasibility, unitEconomics, defensibility, and compute an overallScore (0-100). Assign verdictBadge ("Strong Go" | "Promising Wedge" | "Needs Pivot" | "High Risk"), 4 concrete fatalRisks with severity + mitigation, 2-3 sharp pivotSuggestions, and a unitEconomicsNote.`,
      schema: ValidatorOutputSchema,
      schemaHint: `{
  "overallScore": 72,
  "verdictBadge": "Promising Wedge",
  "executiveVerdict": "string",
  "scoreBreakdown": {
    "demand": 78,
    "differentiation": 74,
    "feasibility": 70,
    "unitEconomics": 64,
    "defensibility": 68
  },
  "fatalRisks": [
    {
      "title": "string",
      "severity": "Critical" | "High" | "Medium",
      "explanation": "string",
      "mitigation": "string"
    }
  ],
  "pivotSuggestions": ["string", "string"],
  "unitEconomicsNote": "string"
}`,
    });

    providersUsed.add(res.provider);

    emit({
      type: "stage",
      agent: "validator",
      status: "done",
      message: `Viability score: ${res.data.overallScore}/100 (${res.data.verdictBadge})`,
      sources: hitsToCitations(searchRes.hits, 3),
      provider: res.provider,
    });
    emit({ type: "partial", section: "validator", data: res.data });
    return res.data;
  };

  const [market, competitors, customers, validator] = await Promise.all([
    runMarketAgent(),
    runCompetitorAgent(),
    runCustomerAgent(),
    runValidatorAgent(),
  ]);

  // ---------------------------------------------------------------------------
  // STAGE 3: 90-Day Execution Planner Agent
  // ---------------------------------------------------------------------------
  emit({
    type: "stage",
    agent: "planner",
    status: "running",
    message: "Synthesizing all findings into a focused 90-day MVP & GTM roadmap...",
  });

  const plannerRes = await generateStructuredJSON<PlannerOutput>({
    systemPrompt:
      "You are a pragmatic startup COO & growth operator. Turn market, competitor, customer, and risk findings into a concrete, anti-bloat 90-day execution plan.",
    userPrompt: `Startup: ${framer.startupTitle} — ${framer.oneLiner}
Market Verdict: ${market.marketVerdict} (TAM ${market.tam})
White Space: ${competitors.whiteSpaceOpportunity}
Validator Score: ${validator.overallScore}/100 (${validator.verdictBadge})
Top Risks: ${validator.fatalRisks.map((r) => `${r.title} -> ${r.mitigation}`).join(" | ")}
Early Adopter Hook: ${customers.earlyAdopterHook}

Create a sharp 90-day execution plan: recommendedWedge (which single niche/city/segment to launch first), monetizationStrategy, mvpFeatures (mustBuild vs skipForNow), 3 phases (Days 1-30, Days 31-60, Days 61-90), and a concrete firstTenCustomersPlaybook.`,
    schema: PlannerOutputSchema,
    schemaHint: `{
  "recommendedWedge": "string",
  "monetizationStrategy": "string",
  "mvpFeatures": {
    "mustBuild": ["string", "string", "string", "string"],
    "skipForNow": ["string", "string", "string"]
  },
  "roadmap": [
    {
      "phase": "Phase 1: Validate & Concierge MVP",
      "timeframe": "Days 1-30",
      "objective": "string",
      "actions": ["string", "string", "string"],
      "successMetric": "string"
    },
    {
      "phase": "Phase 2: Launch Focused Wedge",
      "timeframe": "Days 31-60",
      "objective": "string",
      "actions": ["string", "string", "string"],
      "successMetric": "string"
    },
    {
      "phase": "Phase 3: Repeatable GTM & Unit Economics",
      "timeframe": "Days 61-90",
      "objective": "string",
      "actions": ["string", "string", "string"],
      "successMetric": "string"
    }
  ],
  "firstTenCustomersPlaybook": "string"
}`,
  });

  providersUsed.add(plannerRes.provider);

  emit({
    type: "stage",
    agent: "planner",
    status: "done",
    message: "90-day wedge MVP & first-10-customers playbook ready",
    provider: plannerRes.provider,
  });
  emit({ type: "partial", section: "planner", data: plannerRes.data });

  return {
    id: `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    input,
    framer,
    market,
    competitors,
    customers,
    validator,
    planner: plannerRes.data,
    telemetry: {
      durationMs: Date.now() - startedAt,
      llmProviderUsed: Array.from(providersUsed).join(" + "),
      tinySearchCalls,
      tinyFetchCalls,
      tinyAgentUsed,
      tinyAgentFallbackReason,
    },
  };
}

