import { generateStructuredJSON } from "../llm";
import {
  FramerOutputSchema,
  type AgentSSEEvent,
  type AnalysisInput,
  type FramerOutput,
} from "../types";

/**
 * Stage 1: Intake & Framing Agent
 * Deconstructs raw, unstructured founder ideas into crisp research dimensions,
 * target categories, and 4 Google/web search queries.
 *
 * @param opts - Pipeline input and SSE emission callback.
 * @returns Framed startup details and LLM provider telemetry.
 */
export async function runFramerAgent(opts: {
  input: AnalysisInput;
  emit: (event: AgentSSEEvent) => void;
}): Promise<{ framer: FramerOutput; provider: string }> {
  const { input, emit } = opts;

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

  return { framer, provider: framerRes.provider };
}
