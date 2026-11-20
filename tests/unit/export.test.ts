import { describe, expect, test } from "bun:test";
import { reportToMarkdown } from "../../lib/export";
import { DEMO_PRESETS } from "../../lib/presets";

describe("Unit Suite: Markdown Dossier Export & Structure", () => {
  test("reportToMarkdown produces complete executive dossier with all 5 sections", () => {
    const preset = DEMO_PRESETS[0];
    const md = reportToMarkdown(preset);

    // Document header
    expect(md).toContain(`# ${preset.framer.startupTitle}`);
    expect(md).toContain(preset.framer.oneLiner);
    expect(md).toContain(`**Viability Score:** **${preset.validator.overallScore}/100**`);

    // 5 Sections
    expect(md).toContain("## 1. Executive Verdict & Scorecard");
    expect(md).toContain("## 2. Market Sizing & Dynamics");
    expect(md).toContain("## 3. Competitor Landscape");
    expect(md).toContain("## 4. Customer Profiles & Discovery");
    expect(md).toContain("## 5. 90-Day Execution Plan");

    // Pre-mortem risks
    expect(md).toContain("### Key Risks & Mitigations");
    for (const risk of preset.validator.fatalRisks) {
      expect(md).toContain(risk.title);
      expect(md).toContain(risk.mitigation);
    }

    // Mom-Test Questions
    expect(md).toContain("### 5 Mom-Test Discovery Questions");
  });
});
