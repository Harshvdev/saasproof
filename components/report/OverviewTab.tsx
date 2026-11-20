import { Lightbulb } from "lucide-react";
import type { ValidatorOutput } from "@/lib/types";
import { LoadingBlock } from "./LoadingBlock";
import { VerdictGauge } from "./VerdictGauge";
import { SensitivityCalculator } from "./SensitivityCalculator";

interface OverviewTabProps {
  validator?: ValidatorOutput;
  visible: boolean;
}

export function OverviewTab({ validator, visible }: OverviewTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-overview"
      aria-labelledby="tab-overview"
      hidden={!visible}
      className="report-section"
    >
      {!validator ? (
        <LoadingBlock message="Devil's Advocate agent is calculating viability score and fatal risks..." />
      ) : (
        <div>
          <div className="section-grid-2">
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-kicker">Verdict</div>
              <VerdictGauge
                score={validator.overallScore}
                badge={validator.verdictBadge}
              />
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {validator.executiveVerdict}
              </p>
            </div>

            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3 className="panel-title">Score Breakdown</h3>
              </div>

              {(
                [
                  ["Market Demand", validator.scoreBreakdown.demand],
                  ["Differentiation", validator.scoreBreakdown.differentiation],
                  ["Build Feasibility", validator.scoreBreakdown.feasibility],
                  ["Unit Economics", validator.scoreBreakdown.unitEconomics],
                  ["Defensibility", validator.scoreBreakdown.defensibility],
                ] as const
              ).map(([label, val]) => (
                <div key={label} className="axis-row">
                  <div className="axis-top">
                    <span>{label}</span>
                    <span className="axis-score">{val} / 100</span>
                  </div>
                  <div className="axis-bar-bg">
                    <div
                      className="axis-bar-fill"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-subtle)",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>Unit Economics: </strong>
                {validator.unitEconomicsNote}
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Pre-Mortem Analysis</div>
                <h3 className="panel-title">Top Fatal Risks & Mitigations</h3>
              </div>
            </div>

            <div className="section-equal-2" style={{ marginBottom: 0 }}>
              {validator.fatalRisks.map((risk) => {
                const sevCls =
                  risk.severity === "Critical"
                    ? "sev-critical"
                    : risk.severity === "High"
                      ? "sev-high"
                      : "sev-medium";
                return (
                  <div key={risk.title} className="risk-card">
                    <div className="risk-head">
                      <span className="risk-title">{risk.title}</span>
                      <span className={`severity-badge ${sevCls}`}>
                        {risk.severity}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.86rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {risk.explanation}
                    </p>
                    <div className="mitigation-box">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">
                <Lightbulb
                  className="h-4 w-4"
                  style={{ color: "var(--orange-600)" }}
                  aria-hidden="true"
                />
                <span>Pivot Angles</span>
              </h3>
            </div>

            <div className="section-equal-2" style={{ marginBottom: 0 }}>
              {validator.pivotSuggestions.map((pivot, i) => (
                <div key={pivot} className="pivot-card">
                  <span className="tag-pill mono" style={{ width: "fit-content" }}>
                    Option {i + 1}
                  </span>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-primary)",
                      lineHeight: 1.58,
                    }}
                  >
                    {pivot}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <SensitivityCalculator />
        </div>
      )}
    </div>
  );
}
