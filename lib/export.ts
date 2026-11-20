import type { StartupReport } from "./types";

export function reportToMarkdown(report: StartupReport): string {
  const { framer, market, competitors, customers, validator, planner } = report;

  const lines: string[] = [
    `# ${framer.startupTitle} — SaaSProof Validation Report`,
    `> ${framer.oneLiner}`,
    ``,
    `- **Generated:** ${new Date(report.createdAt).toLocaleString()}`,
    `- **Category / Model:** ${framer.category} • ${framer.detectedModel}`,
    `- **Target Region:** ${framer.targetGeography}`,
    `- **Viability Score:** **${validator.overallScore}/100** (${validator.verdictBadge})`,
    ``,
    `---`,
    ``,
    `## 1. Executive Verdict & Scorecard`,
    validator.executiveVerdict,
    ``,
    `| Dimension | Score |`,
    `| :--- | :--- |`,
    `| Demand | ${validator.scoreBreakdown.demand}/100 |`,
    `| Differentiation | ${validator.scoreBreakdown.differentiation}/100 |`,
    `| Feasibility | ${validator.scoreBreakdown.feasibility}/100 |`,
    `| Unit Economics | ${validator.scoreBreakdown.unitEconomics}/100 |`,
    `| Defensibility | ${validator.scoreBreakdown.defensibility}/100 |`,
    ``,
    `### Unit Economics Note`,
    validator.unitEconomicsNote,
    ``,
    `### Key Risks & Mitigations`,
    ...validator.fatalRisks.map(
      (r) =>
        `- **[${r.severity}] ${r.title}:** ${r.explanation}\n  - *Mitigation:* ${r.mitigation}`
    ),
    ``,
    `### Recommended Pivots / Wedges`,
    ...validator.pivotSuggestions.map((p) => `- ${p}`),
    ``,
    `---`,
    ``,
    `## 2. Market Sizing & Dynamics`,
    `- **TAM:** ${market.tam} — ${market.tamDetail}`,
    `- **SAM:** ${market.sam} — ${market.samDetail}`,
    `- **SOM:** ${market.som} — ${market.somDetail}`,
    `- **Growth Rate:** ${market.growthRate}`,
    ``,
    market.marketVerdict,
    ``,
    `**Tailwinds:**`,
    ...market.tailwinds.map((t) => `- ${t}`),
    ``,
    `**Headwinds:**`,
    ...market.headwinds.map((h) => `- ${h}`),
    ``,
    `---`,
    ``,
    `## 3. Competitor Landscape`,
    competitors.landscapeSummary,
    ``,
    `**White-Space Opportunity:** ${competitors.whiteSpaceOpportunity}`,
    ``,
    ...competitors.competitors.map(
      (c) =>
        `### ${c.name} (${c.threatLevel} Threat) — ${c.url}\n- **Positioning:** ${c.positioning}\n- **Pricing:** ${c.pricingModel}\n- **Strengths:** ${c.strengths.join("; ")}\n- **Gaps:** ${c.weaknessesOrGaps.join("; ")}`
    ),
    ``,
    `---`,
    ``,
    `## 4. Customer Profiles & Discovery`,
    customers.targetSummary,
    ``,
    ...customers.personas.map(
      (p) =>
        `### ${p.name} (${p.side} — ${p.roleOrSegment})\n- **Pain Points:** ${p.topPainPoints.join("; ")}\n- **Workaround:** ${p.currentWorkaround}\n- **Willingness to Pay:** ${p.willingnessToPay}\n- **Channels:** ${p.acquisitionChannels.join(", ")}`
    ),
    ``,
    `### 5 Mom-Test Discovery Questions`,
    ...customers.interviewQuestions.map((q, i) => `${i + 1}. ${q}`),
    ``,
    `---`,
    ``,
    `## 5. 90-Day Execution Plan`,
    `- **Recommended Launch Wedge:** ${planner.recommendedWedge}`,
    `- **Monetization:** ${planner.monetizationStrategy}`,
    `- **First 10 Customers Playbook:** ${planner.firstTenCustomersPlaybook}`,
    ``,
    `**MVP Must-Build:** ${planner.mvpFeatures.mustBuild.join(" • ")}`,
    `**Skip For Now:** ${planner.mvpFeatures.skipForNow.join(" • ")}`,
    ``,
    ...planner.roadmap.map(
      (phase) =>
        `### ${phase.phase} (${phase.timeframe})\n- **Objective:** ${phase.objective}\n- **Success Metric:** ${phase.successMetric}\n${phase.actions.map((a) => `  - [ ] ${a}`).join("\n")}`
    ),
  ];

  return lines.join("\n");
}

