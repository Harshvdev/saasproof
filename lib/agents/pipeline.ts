import { randomUUID } from "crypto";
import type {
  AgentSSEEvent,
  AnalysisInput,
  StartupReport,
} from "../types";
import { runCompetitorAgent } from "./competitor";
import { runCustomerAgent } from "./customer";
import { runFramerAgent } from "./framer";
import { runMarketAgent } from "./market";
import { runPlannerAgent } from "./planner";
import { runValidatorAgent } from "./validator";

type EmitFn = (event: AgentSSEEvent) => void;

/**
 * Orchestrates the full 3-stage, 6-agent startup validation pipeline.
 * Executes Stage 1 (Framing), Stage 2 (Parallel Market, Competitor, Customer, Risk specialists),
 * and Stage 3 (Execution Planner), emitting real-time Server-Sent Events (SSE).
 *
 * @param opts - Pipeline execution options including AnalysisInput, deep scraping allowance, optional AbortSignal, and emit callback.
 * @returns Complete, grounded StartupReport object with verified citations and telemetry.
 */
export async function runStartupPipeline(opts: {
  input: AnalysisInput;
  allowDeepScrape: boolean;
  signal?: AbortSignal;
  emit: EmitFn;
}): Promise<StartupReport> {
  const startedAt = Date.now();
  const { input, allowDeepScrape, signal, emit } = opts;

  let tinySearchCalls = 0;
  let tinyFetchCalls = 0;
  const providersUsed = new Set<string>();

  // ---------------------------------------------------------------------------
  // STAGE 1: Intake & Framing Agent
  // ---------------------------------------------------------------------------
  const { framer, provider: framerProvider } = await runFramerAgent({
    input,
    signal,
    emit,
  });
  providersUsed.add(framerProvider);

  // ---------------------------------------------------------------------------
  // STAGE 2: 4 Parallel Specialist Agents (linked cancellation on sibling failure)
  // ---------------------------------------------------------------------------
  const stage2Controller = new AbortController();
  const stage2Signal = signal
    ? AbortSignal.any([signal, stage2Controller.signal])
    : stage2Controller.signal;

  let marketRes;
  let competitorRes;
  let customerRes;
  let validatorRes;

  try {
    [marketRes, competitorRes, customerRes, validatorRes] = await Promise.all([
      runMarketAgent({
        framer,
        region: input.region,
        signal: stage2Signal,
        emit,
      }),
      runCompetitorAgent({
        framer,
        input,
        allowDeepScrape,
        signal: stage2Signal,
        emit,
      }),
      runCustomerAgent({
        framer,
        region: input.region,
        signal: stage2Signal,
        emit,
      }),
      runValidatorAgent({
        framer,
        region: input.region,
        signal: stage2Signal,
        emit,
      }),
    ]);
  } catch (err) {
    stage2Controller.abort();
    throw err;
  }

  providersUsed.add(marketRes.provider);
  providersUsed.add(competitorRes.provider);
  providersUsed.add(customerRes.provider);
  providersUsed.add(validatorRes.provider);

  tinySearchCalls +=
    marketRes.searchCalls +
    competitorRes.searchCalls +
    customerRes.searchCalls +
    validatorRes.searchCalls;

  tinyFetchCalls +=
    marketRes.fetchCalls +
    competitorRes.fetchCalls +
    customerRes.fetchCalls;

  const tinyAgentUsed = competitorRes.tinyAgentUsed;
  const tinyAgentFallbackReason = competitorRes.tinyAgentFallbackReason;

  // ---------------------------------------------------------------------------
  // STAGE 3: 90-Day Execution Planner Agent
  // ---------------------------------------------------------------------------
  const { planner, provider: plannerProvider } = await runPlannerAgent({
    framer,
    market: marketRes.market,
    competitors: competitorRes.competitors,
    customers: customerRes.customers,
    validator: validatorRes.validator,
    signal,
    emit,
  });
  providersUsed.add(plannerProvider);

  return {
    id: `sp_${randomUUID().slice(0, 12)}`,
    createdAt: new Date().toISOString(),
    input,
    framer,
    market: marketRes.market,
    competitors: competitorRes.competitors,
    customers: customerRes.customers,
    validator: validatorRes.validator,
    planner,
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
