import { describe, expect, test } from "bun:test";
import {
  AnalysisInputSchema,
  CompetitorOutputSchema,
  CopilotRequestSchema,
  CustomerOutputSchema,
  FramerOutputSchema,
  MarketOutputSchema,
  PlannerOutputSchema,
  ValidatorOutputSchema,
} from "../../lib/types";
import {
  DEMO_PRESETS,
  creatorSponsorshipPreset,
  dentalCompliancePreset,
  inspectSecondhandPreset,
} from "../../lib/presets";

describe("Unit Suite: Zod Schema Integrity & Validation Bounds", () => {
  test("AnalysisInputSchema enforces minimum length of 10 characters", () => {
    expect(AnalysisInputSchema.safeParse({ idea: "too short" }).success).toBe(
      false
    );
    expect(
      AnalysisInputSchema.safeParse({
        idea: "Valid startup idea description with more than 10 chars",
      }).success
    ).toBe(true);
  });

  test("AnalysisInputSchema defaults region to India and businessModel to Auto-detect", () => {
    const res = AnalysisInputSchema.safeParse({
      idea: "Autonomous code verification engine for hackathon teams.",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.region).toBe("India");
      expect(res.data.businessModel).toBe("Auto-detect");
      expect(res.data.enableDeepScrape).toBe(true);
    }
  });

  test("CopilotRequestSchema validates structured message history", () => {
    const valid = {
      question: "What is my biggest vulnerability in enterprise pricing?",
      report: DEMO_PRESETS[0],
      history: [
        { role: "user" as const, content: "Can I sell to hospitals?" },
        {
          role: "assistant" as const,
          content: "Yes, but HIPAA and BAA agreements require 6-9 months sales cycle.",
        },
      ],
    };
    expect(CopilotRequestSchema.safeParse(valid).success).toBe(true);
  });

  test("all bundled demo presets validate 100% against all agent schemas", () => {
    for (const preset of DEMO_PRESETS) {
      expect(FramerOutputSchema.safeParse(preset.framer).success).toBe(true);
      expect(MarketOutputSchema.safeParse(preset.market).success).toBe(true);
      expect(CompetitorOutputSchema.safeParse(preset.competitors).success).toBe(true);
      expect(CustomerOutputSchema.safeParse(preset.customers).success).toBe(true);
      expect(ValidatorOutputSchema.safeParse(preset.validator).success).toBe(true);
      expect(PlannerOutputSchema.safeParse(preset.planner).success).toBe(true);
      expect(preset.validator.overallScore).toBeGreaterThanOrEqual(0);
      expect(preset.validator.overallScore).toBeLessThanOrEqual(100);
    }
  });

  test("individual modular presets export correctly and match IDs", () => {
    expect(inspectSecondhandPreset.id).toBe("preset_inspect_secondhand");
    expect(dentalCompliancePreset.id).toBe("preset_dental_compliance");
    expect(creatorSponsorshipPreset.id).toBe("preset_creator_sponsorship");
  });
});
