import { ArrowUpRight } from "lucide-react";
import type { CompetitorOutput } from "@/lib/types";
import { LoadingBlock } from "./LoadingBlock";

interface CompetitorsTabProps {
  competitors?: CompetitorOutput;
  visible: boolean;
}

/**
 * CompetitorsTab displays the competitor landscape matrix, threat ratings, verified URLs,
 * live pricing models, feature gaps, and the identified white-space opportunity.
 *
 * @param props - CompetitorsTabProps with competitor intel output and visibility state.
 * @returns Fully rendered competitor analysis tabpanel.
 */
export function CompetitorsTab({ competitors, visible }: CompetitorsTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-competitors"
      aria-labelledby="tab-competitors"
      hidden={!visible}
      className="report-section"
    >
      {!competitors ? (
        <LoadingBlock message="Competitor Intel agent is analyzing rival pricing and whitespace gaps..." />
      ) : (
        <div>
          <div className="whitespace-banner">
            <div className="panel-kicker">White-Space Opportunity</div>
            <h3
              style={{
                fontSize: "1.08rem",
                fontWeight: 800,
                marginBottom: "6px",
              }}
            >
              {competitors.whiteSpaceOpportunity}
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: 1.55,
              }}
            >
              {competitors.landscapeSummary}
            </p>
            {competitors.deepScrapeNote && (
              <p
                className="mono"
                style={{
                  fontSize: "0.74rem",
                  color: "var(--orange-700)",
                  marginTop: "10px",
                }}
              >
                Extraction status: {competitors.deepScrapeNote}
              </p>
            )}
          </div>

          <div className="competitor-grid">
            {competitors.competitors.map((comp) => {
              const threatCls =
                comp.threatLevel === "High"
                  ? "sev-critical"
                  : comp.threatLevel === "Medium"
                    ? "sev-high"
                    : "sev-medium";
              return (
                <article key={comp.name} className="comp-card">
                  <div className="comp-head">
                    <div>
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comp-name-link"
                      >
                        <span>{comp.name}</span>
                        <ArrowUpRight
                          className="h-4 w-4"
                          style={{ color: "var(--orange-600)" }}
                          aria-hidden="true"
                        />
                      </a>
                      <div className="preset-meta-tags" style={{ marginTop: "6px", marginBottom: 0 }}>
                        <span className="tag-pill mono">{comp.extractionMethod}</span>
                      </div>
                    </div>

                    <span className={`severity-badge ${threatCls}`}>
                      {comp.threatLevel} Threat
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.86rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                    }}
                  >
                    {comp.positioning}
                  </p>

                  <div
                    style={{
                      fontSize: "0.82rem",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-subtle)",
                    }}
                  >
                    <strong style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase" }}>
                      Pricing:{" "}
                    </strong>
                    <span style={{ fontWeight: 600 }}>{comp.pricingModel}</span>
                  </div>

                  <div className="comp-cols">
                    <div className="comp-mini-box">
                      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--emerald-text)" }}>Strengths</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {comp.strengths.map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="comp-mini-box">
                      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--orange-600)" }}>Gaps to Exploit</h4>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {comp.weaknessesOrGaps.map((g) => (
                          <li key={g}>→ {g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
