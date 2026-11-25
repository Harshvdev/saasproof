import React from "react";
import { ArrowRight, Eye, FileText, Laptop, Store, Users } from "lucide-react";
import { scrollElementIntoView } from "@/lib/scroll";
import type { StartupReport } from "@/lib/types";

interface ExampleReportsSectionProps {
  examples: StartupReport[];
  onLoadPreset: (preset: StartupReport) => void;
  onUsePrompt: (preset: StartupReport) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  "Recommerce Trust & Verification": "Marketplace",
  "Vertical Healthcare Compliance SaaS": "B2B SaaS",
  "Creator Economy Fintech & LegalOps": "B2B / Prosumer AI SaaS",
};

function CategoryIcon({ category }: { category: string }) {
  const key = category.toLowerCase();
  if (key.includes("health") || key.includes("saas")) {
    return (
      <span className="lp-example-cat-icon">
        <Laptop aria-hidden="true" />
      </span>
    );
  }
  if (key.includes("creator") || key.includes("consumer")) {
    return (
      <span className="lp-example-cat-icon">
        <Users aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="lp-example-cat-icon">
      <Store aria-hidden="true" />
    </span>
  );
}

/**
 * ExampleReportsSection displays pre-computed sample validation dossiers
 * that founders can explore instantly without consuming quota.
 *
 * @param props - ExampleReportsSectionProps containing presets and interaction handlers.
 * @returns Fully rendered examples grid section.
 */
export function ExampleReportsSection({
  examples,
  onLoadPreset,
  onUsePrompt,
}: ExampleReportsSectionProps) {
  const scrollToExamples = () => {
    scrollElementIntoView(document.getElementById("example-reports-section"), {
      block: "start",
    });
  };

  return (
    <section className="lp-examples" id="example-reports-section">
      <div className="lp-examples-head">
        <h2 className="lp-examples-title">
          <FileText aria-hidden="true" />
          <span>Example reports</span>
        </h2>
        <span className="lp-examples-rule" aria-hidden="true" />
        <button
          type="button"
          className="lp-examples-link"
          onClick={scrollToExamples}
        >
          <span>View all examples</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      <div className="lp-example-grid">
        {examples.map((preset) => {
          const score = preset.validator.overallScore;
          const category =
            CATEGORY_LABELS[preset.framer.category] ?? preset.framer.category;
          return (
            <article className="lp-example-card" key={preset.id}>
              <div className="lp-example-top">
                <CategoryIcon category={preset.framer.category} />
                <span className="lp-example-cat">{category}</span>
                <span
                  className={`lp-example-score ${
                    score >= 75 ? "lp-score-green" : "lp-score-amber"
                  }`}
                >
                  {score}
                </span>
              </div>

              <h3 className="lp-example-title">{preset.framer.startupTitle}</h3>
              <p className="lp-example-desc">{preset.framer.oneLiner}</p>

              <div className="lp-example-actions">
                <button
                  type="button"
                  className="lp-example-btn is-primary"
                  onClick={() => onLoadPreset(preset)}
                >
                  <Eye aria-hidden="true" />
                  <span>View report</span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="lp-example-btn"
                  onClick={() => onUsePrompt(preset)}
                >
                  <FileText aria-hidden="true" />
                  <span>Use prompt</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
