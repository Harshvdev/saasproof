import { z } from "zod";

export const AnalysisInputSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(10, "Please describe your startup idea in at least 10 characters.")
    .max(1200, "Please keep your idea description under 1200 characters."),
  region: z.string().trim().min(2).max(60).default("India"),
  businessModel: z
    .enum(["Auto-detect", "Marketplace", "B2B SaaS", "B2C App", "AI Tool / API", "Hardware / Climate"])
    .default("Auto-detect"),
  enableDeepScrape: z.boolean().default(true),
});

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>;

export const SourceCitationSchema = z.object({
  title: z.string().default("Source"),
  url: z.string(),
  domain: z.string().default("web"),
});

export type SourceCitation = z.infer<typeof SourceCitationSchema>;

export const FramerOutputSchema = z.object({
  startupTitle: z.string(),
  oneLiner: z.string(),
  category: z.string(),
  detectedModel: z.string(),
  targetGeography: z.string(),
  coreProblem: z.string(),
  searchQueries: z.object({
    market: z.string(),
    competitors: z.string(),
    customers: z.string(),
    risks: z.string(),
  }),
});

export type FramerOutput = z.infer<typeof FramerOutputSchema>;

export const MarketOutputSchema = z.object({
  tam: z.string(),
  tamDetail: z.string(),
  sam: z.string(),
  samDetail: z.string(),
  som: z.string(),
  somDetail: z.string(),
  growthRate: z.string(),
  marketVerdict: z.string(),
  tailwinds: z.array(z.string()).min(1).max(6),
  headwinds: z.array(z.string()).min(1).max(6),
  sources: z.array(SourceCitationSchema).default([]),
});

export type MarketOutput = z.infer<typeof MarketOutputSchema>;

export const CompetitorItemSchema = z.object({
  name: z.string(),
  url: z.string(),
  positioning: z.string(),
  pricingModel: z.string(),
  strengths: z.array(z.string()).min(1).max(3),
  weaknessesOrGaps: z.array(z.string()).min(1).max(3),
  threatLevel: z.enum(["High", "Medium", "Low"]).catch("Medium"),
  extractionMethod: z.enum(["TinyAgent", "TinyFetch", "TinySearch"]).catch("TinyFetch"),
});

export type CompetitorItem = z.infer<typeof CompetitorItemSchema>;

export const CompetitorOutputSchema = z.object({
  landscapeSummary: z.string(),
  whiteSpaceOpportunity: z.string(),
  competitors: z.array(CompetitorItemSchema).min(2).max(7),
  deepScrapeNote: z.string().optional(),
  sources: z.array(SourceCitationSchema).default([]),
});

export type CompetitorOutput = z.infer<typeof CompetitorOutputSchema>;

export const CustomerPersonaSchema = z.object({
  name: z.string().default("Primary Persona"),
  roleOrSegment: z.string().default("Early Adopter"),
  side: z.string().default("Primary User"),
  topPainPoints: z.array(z.string()).min(1).max(5).default(["Unreliable current workflow", "High friction and cost"]),
  currentWorkaround: z.string().default("Manual spreadsheets or ad-hoc messaging"),
  willingnessToPay: z.string().default("Moderate initial budget"),
  acquisitionChannels: z.array(z.string()).min(1).max(5).default(["Direct community outreach", "Search / Social"]),
});

export type CustomerPersona = z.infer<typeof CustomerPersonaSchema>;

export const CustomerOutputSchema = z.object({
  targetSummary: z.string().default("Early adopter customer summary."),
  personas: z.array(CustomerPersonaSchema).min(1).max(4).default([]),
  interviewQuestions: z
    .array(z.string())
    .min(1)
    .max(8)
    .default([
      "How do you handle this problem today, and what workarounds have failed?",
      "When was the last time you spent money trying to fix this?",
      "What is the most frustrating part of the current solution?",
      "Who else on your team or in your household is impacted by this?",
    ]),
  earlyAdopterHook: z
    .string()
    .default("A direct, high-value solution for people frustrated by today's broken workarounds."),
  sources: z.array(SourceCitationSchema).default([]),
});

export type CustomerOutput = z.infer<typeof CustomerOutputSchema>;

export const RiskItemSchema = z.object({
  title: z.string(),
  severity: z.enum(["Critical", "High", "Medium"]).catch("High"),
  explanation: z.string(),
  mitigation: z.string(),
});

export const ValidatorOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdictBadge: z.enum(["Strong Go", "Promising Wedge", "Needs Pivot", "High Risk"]).catch("Promising Wedge"),
  executiveVerdict: z.string(),
  scoreBreakdown: z.object({
    demand: z.number().min(0).max(100),
    differentiation: z.number().min(0).max(100),
    feasibility: z.number().min(0).max(100),
    unitEconomics: z.number().min(0).max(100),
    defensibility: z.number().min(0).max(100),
  }),
  fatalRisks: z.array(RiskItemSchema).min(2).max(6),
  pivotSuggestions: z.array(z.string()).min(1).max(4),
  unitEconomicsNote: z.string(),
});

export type ValidatorOutput = z.infer<typeof ValidatorOutputSchema>;

export const RoadmapPhaseSchema = z.object({
  phase: z.string(),
  timeframe: z.string(),
  objective: z.string(),
  actions: z.array(z.string()).min(2).max(6),
  successMetric: z.string(),
});

export const PlannerOutputSchema = z.object({
  recommendedWedge: z.string(),
  monetizationStrategy: z.string(),
  mvpFeatures: z.object({
    mustBuild: z.array(z.string()).min(2).max(6),
    skipForNow: z.array(z.string()).min(1).max(5),
  }),
  roadmap: z.array(RoadmapPhaseSchema).min(2).max(4),
  firstTenCustomersPlaybook: z.string(),
});

export type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export const CopilotRequestSchema = z.object({
  question: z.string().trim().min(3).max(600),
  useLiveWeb: z.boolean().default(false),
  report: z.custom<StartupReport>((v) => Boolean(v && typeof v === "object")),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(12)
    .default([]),
});
export type CopilotRequest = z.infer<typeof CopilotRequestSchema>;

export interface UsageQuotaInfo {
  analysesRemaining: number;
  analysesLimit: number;
  deepScrapesRemaining: number;
  deepScrapesLimit: number;
  copilotMessagesRemaining: number;
  copilotMessagesLimit: number;
  resetWindowHours: number;
}

export interface StartupReport {
  id: string;
  createdAt: string;
  isPreset?: boolean;
  input: AnalysisInput;
  framer: FramerOutput;
  market: MarketOutput;
  competitors: CompetitorOutput;
  customers: CustomerOutput;
  validator: ValidatorOutput;
  planner: PlannerOutput;
  telemetry: {
    durationMs: number;
    llmProviderUsed: string;
    tinySearchCalls: number;
    tinyFetchCalls: number;
    tinyAgentUsed: boolean;
    tinyAgentFallbackReason?: string;
  };
}

export type AgentNodeId =
  | "framer"
  | "market"
  | "competitors"
  | "customers"
  | "validator"
  | "planner";

export type AgentSSEEvent =
  | {
      type: "quota";
      quota: UsageQuotaInfo;
    }
  | {
      type: "stage";
      agent: AgentNodeId;
      status: "running" | "done" | "fallback";
      message: string;
      queries?: string[];
      sources?: SourceCitation[];
      provider?: string;
    }
  | {
      type: "partial";
      section: "framer" | "market" | "competitors" | "customers" | "validator" | "planner";
      data: unknown;
    }
  | {
      type: "complete";
      report: StartupReport;
      quota: UsageQuotaInfo;
    }
  | {
      type: "error";
      message: string;
      quota?: UsageQuotaInfo;
    };

