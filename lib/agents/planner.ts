import { generateStructuredJSON } from "../llm";
import {
  PlannerOutputSchema,
  type AgentSSEEvent,
  type CompetitorOutput,
  type CustomerOutput,
  type FramerOutput,
  type MarketOutput,
  type PlannerOutput,
  type ValidatorOutput,
} from "../types";

/**
 * Stage 3: 90-Day Execution Planner Specialist Agent
 * Synthesizes research from all previous agents into a tactical, anti-bloat
 * 90-day phased MVP roadmap, must-build vs skip features, and first-10-customers playbook.
 *
 * @param opts - Previous agent outputs and SSE emission callback.
 * @returns Grounded PlannerOutput and execution telemetry.
 */
export async function runPlannerAgent(opts: {
  framer: FramerOutput;
  market: MarketOutput;
  competitors: CompetitorOutput;
  customers: CustomerOutput;
  validator: ValidatorOutput;
  emit: (event: AgentSSEEvent) => void;
}): Promise<{ planner: PlannerOutput; provider: string }> {
  const { framer, market, competitors, customers, validator, emit } = opts;

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

  emit({
    type: "stage",
    agent: "planner",
    status: "done",
    message: "90-day wedge MVP & first-10-customers playbook ready",
    provider: plannerRes.provider,
  });
  emit({ type: "partial", section: "planner", data: plannerRes.data });

  return { planner: plannerRes.data, provider: plannerRes.provider };
}
