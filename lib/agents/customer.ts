import { generateStructuredJSON } from "../llm";
import { hitsToCitations, tinyFetch, tinySearch } from "../tinyfish";
import {
  CustomerOutputSchema,
  type AgentSSEEvent,
  type CustomerOutput,
  type FramerOutput,
} from "../types";
import { formatSearchContext } from "./context";

/**
 * Stage 2: Customer Discovery & ICP Profiler Specialist Agent
 * Profiles dual-sided customer personas (demand & supply) and generates
 * 5 non-leading discovery questions based on "The Mom Test".
 *
 * @param opts - Framer output, target region, and SSE callback.
 * @returns Grounded CustomerOutput and execution metrics.
 */
export async function runCustomerAgent(opts: {
  framer: FramerOutput;
  region: string;
  emit: (event: AgentSSEEvent) => void;
}): Promise<{
  customers: CustomerOutput;
  provider: string;
  searchCalls: number;
  fetchCalls: number;
}> {
  const { framer, region, emit } = opts;
  let searchCalls = 0;
  let fetchCalls = 0;

  emit({
    type: "stage",
    agent: "customers",
    status: "running",
    message: `Researching buyer pain points & ICPs for "${framer.searchQueries.customers}"...`,
    queries: [framer.searchQueries.customers],
  });

  const searchRes = await tinySearch(framer.searchQueries.customers, region);
  searchCalls += 1;

  const fetchRes = await tinyFetch(
    searchRes.hits.slice(0, 2).map((h) => h.url),
    1500
  );
  fetchCalls += fetchRes.pages.length;

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

  return {
    customers: finalCustomers,
    provider: res.provider,
    searchCalls,
    fetchCalls,
  };
}
