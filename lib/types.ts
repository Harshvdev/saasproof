import { z } from "zod";
import { isSafeHttpUrl } from "./url";

export const BUSINESS_MODELS = [
  "Auto-detect",
  "Marketplace",
  "B2B SaaS",
  "B2C App",
  "AI Tool / API",
  "Hardware / Climate",
] as const;

export const REGIONS = [
  "India",
  "Global",
  "United States",
  "US & India Metro Cities",
  "Europe / UK",
] as const;

export const AnalysisInputSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(10, "Please describe your startup idea in at least 10 characters.")
    .max(1200, "Please keep your idea description under 1200 characters."),
  region: z.string().trim().min(2).max(60).default("India"),
  businessModel: z.enum(BUSINESS_MODELS).default("Auto-detect"),
  enableDeepScrape: z.boolean().default(true),
});

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>;

export const SafeHttpUrlSchema = z
  .string()
  .trim()
  .refine(isSafeHttpUrl, "URL must use http:// or https://");

export const SourceCitationSchema = z.object({
  title: z.string().default("Source"),
  url: SafeHttpUrlSchema,
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
  url: SafeHttpUrlSchema,
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
  personas: z.array(CustomerPersonaSchema).min(1).max(4),
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

export const StartupReportSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  isPreset: z.boolean().optional(),
  input: AnalysisInputSchema,
  framer: FramerOutputSchema,
  market: MarketOutputSchema,
  competitors: CompetitorOutputSchema,
  customers: CustomerOutputSchema,
  validator: ValidatorOutputSchema,
  planner: PlannerOutputSchema,
  telemetry: z.object({
    durationMs: z.number(),
    llmProviderUsed: z.string(),
    tinySearchCalls: z.number(),
    tinyFetchCalls: z.number(),
    tinyAgentUsed: z.boolean(),
    tinyAgentFallbackReason: z.string().optional(),
  }),
});

export type StartupReport = z.infer<typeof StartupReportSchema>;

export const CopilotRequestSchema = z.object({
  question: z.string().trim().min(3).max(600),
  useLiveWeb: z.boolean().default(false),
  report: StartupReportSchema,
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1500),
      })
    )
    .max(12)
    .default([]),
});

export type CopilotRequest = z.infer<typeof CopilotRequestSchema>;

export const UsageQuotaInfoSchema = z.object({
  analysesRemaining: z.number(),
  analysesLimit: z.number(),
  deepScrapesRemaining: z.number(),
  deepScrapesLimit: z.number(),
  copilotMessagesRemaining: z.number(),
  copilotMessagesLimit: z.number(),
  resetWindowHours: z.number(),
});

export type UsageQuotaInfo = z.infer<typeof UsageQuotaInfoSchema>;

export const AgentNodeIdSchema = z.enum([
  "framer",
  "market",
  "competitors",
  "customers",
  "validator",
  "planner",
]);

export type AgentNodeId = z.infer<typeof AgentNodeIdSchema>;

export const AgentSSEEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("quota"),
    quota: UsageQuotaInfoSchema,
  }),
  z.object({
    type: z.literal("stage"),
    agent: AgentNodeIdSchema,
    status: z.enum(["running", "done", "fallback"]),
    message: z.string(),
    queries: z.array(z.string()).optional(),
    sources: z.array(SourceCitationSchema).optional(),
    provider: z.string().optional(),
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("framer"),
    data: FramerOutputSchema,
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("market"),
    data: MarketOutputSchema,
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("competitors"),
    data: CompetitorOutputSchema,
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("customers"),
    data: CustomerOutputSchema,
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("validator"),
    data: ValidatorOutputSchema,
  }),
  z.object({
    type: z.literal("partial"),
    section: z.literal("planner"),
    data: PlannerOutputSchema,
  }),
  z.object({
    type: z.literal("complete"),
    report: StartupReportSchema,
    quota: UsageQuotaInfoSchema,
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
    quota: UsageQuotaInfoSchema.optional(),
  }),
]);

export type AgentSSEEvent = z.infer<typeof AgentSSEEventSchema>;
