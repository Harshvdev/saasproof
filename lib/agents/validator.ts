import { generateStructuredJSON } from "../llm";
import { hitsToCitations, tinySearch } from "../tinyfish";
import {
  ValidatorOutputSchema,
  type AgentSSEEvent,
  type FramerOutput,
  type ValidatorOutput,
} from "../types";
import { formatSearchContext } from "./context";

/**
 * Stage 2: Devil's Advocate & Risk Validator Specialist Agent
 * Unsparingly scores startup viability across 5 dimensions (0-100),
 * surfaces fatal operational, trust, and unit economics risks, and provides mitigations.
 *
 * @param opts - Framer output, target region, and SSE callback.
 * @returns Bounded ValidatorOutput and execution metrics.
 */
export async function runValidatorAgent(opts: {
  framer: FramerOutput;
  region: string;
  emit: (event: AgentSSEEvent) => void;
}): Promise<{
  validator: ValidatorOutput;
  provider: string;
  searchCalls: number;
}> {
  const { framer, region, emit } = opts;
  let searchCalls = 0;

  emit({
    type: "stage",
    agent: "validator",
    status: "running",
    message: `Stress-testing unit economics, disintermediation & execution risks...`,
    queries: [framer.searchQueries.risks],
  });

  const searchRes = await tinySearch(framer.searchQueries.risks, region);
  searchCalls += 1;

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

  emit({
    type: "stage",
    agent: "validator",
    status: "done",
    message: `Viability score: ${res.data.overallScore}/100 (${res.data.verdictBadge})`,
    sources: hitsToCitations(searchRes.hits, 3),
    provider: res.provider,
  });
  emit({ type: "partial", section: "validator", data: res.data });

  return {
    validator: res.data,
    provider: res.provider,
    searchCalls,
  };
}
