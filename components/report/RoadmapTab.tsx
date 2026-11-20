import type { PlannerOutput } from "@/lib/types";
import { LoadingBlock } from "./LoadingBlock";

interface RoadmapTabProps {
  planner?: PlannerOutput;
  visible: boolean;
}

/**
 * RoadmapTab displays the 90-day phased execution plan (Days 1–30, 31–60, 61–90),
 * recommended launch wedge, MVP feature scoping (Must-Build vs Skip), and first 10 customers playbook.
 *
 * @param props - RoadmapTabProps with execution planner output and visibility state.
 * @returns Fully rendered 90-day execution roadmap tabpanel.
 */
export function RoadmapTab({ planner, visible }: RoadmapTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-planner"
      aria-labelledby="tab-planner"
      hidden={!visible}
      className="report-section"
    >
      {!planner ? (
        <LoadingBlock message="Execution Planner agent is compiling your 90-day MVP & GTM roadmap..." />
      ) : (
        <div>
          <div className="section-equal-2">
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-kicker">Recommended Launch Wedge</div>
              <p style={{ fontSize: "0.94rem", fontWeight: 600, lineHeight: 1.6 }}>
                {planner.recommendedWedge}
              </p>
            </div>
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-kicker">Monetization Strategy</div>
              <p style={{ fontSize: "0.94rem", fontWeight: 600, lineHeight: 1.6 }}>
                {planner.monetizationStrategy}
              </p>
            </div>
          </div>

          <div className="section-equal-2">
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3 className="panel-title" style={{ color: "var(--emerald-text)" }}>
                  Must-Build
                </h3>
              </div>
              <ul className="wind-list">
                {planner.mvpFeatures.mustBuild.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </div>

            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3 className="panel-title" style={{ color: "var(--text-muted)" }}>
                  Skip For Now
                </h3>
              </div>
              <ul className="wind-list">
                {planner.mvpFeatures.skipForNow.map((item) => (
                  <li key={item}>✕ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="phases-grid">
            {planner.roadmap.map((phase) => (
              <article key={phase.phase} className="phase-card">
                <div>
                  <span className="phase-badge">{phase.timeframe}</span>
                  <h3
                    style={{
                      fontSize: "1.02rem",
                      fontWeight: 800,
                      marginBottom: "6px",
                    }}
                  >
                    {phase.phase}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--text-secondary)",
                      marginBottom: "12px",
                    }}
                  >
                    {phase.objective}
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                      fontSize: "0.82rem",
                    }}
                  >
                    {phase.actions.map((act) => (
                      <li key={act}>• {act}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--emerald-bg)",
                    color: "var(--emerald-text)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Goal: {phase.successMetric}
                </div>
              </article>
            ))}
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">First 10 Customers Playbook</h3>
            </div>
            <div className="playbook-step" style={{ marginBottom: 0 }}>
              <div className="step-index">10</div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {planner.firstTenCustomersPlaybook}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
