import React from "react";
import {
  BarChart3,
  FileText,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";

/**
 * ResearchSnapshot renders the live animated example preview showing
 * market size, competitor market share bars, and key validation signals.
 *
 * @returns Accessible visual illustration previewing analysis outputs.
 */
export function ResearchSnapshot() {
  return (
    <aside className="lp-snapshot" aria-label="Example research snapshot">
      <div className="lp-snapshot-head">
        <div className="lp-snapshot-title">
          <BarChart3 aria-hidden="true" />
          <span>Research Snapshot</span>
        </div>
        <span className="lp-snapshot-example">Example: EdTech marketplace</span>
      </div>

      <div className="lp-snapshot-grid">
        <div className="lp-snap-col">
          <h2 className="lp-snap-col-title">Market Size</h2>
          <div className="lp-market-value">$12.8B</div>
          <div className="lp-market-sub">TAM (US, 2025)</div>

          <svg
            className="lp-sparkline"
            viewBox="0 0 220 58"
            preserveAspectRatio="none"
            role="img"
            aria-label="Market size growing over time"
          >
            <defs>
              <linearGradient id="lp-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 47 L10 43 L20 45 L30 37 L40 40 L50 32 L60 35 L70 28 L80 31 L90 24 L100 27 L110 21 L120 23 L130 16 L140 19 L150 12 L160 15 L170 8 L180 11 L190 4 L200 7 L210 0 L210 58 L0 58 Z"
              fill="url(#lp-spark-fill)"
            />
            <path
              d="M0 47 L10 43 L20 45 L30 37 L40 40 L50 32 L60 35 L70 28 L80 31 L90 24 L100 27 L110 21 L120 23 L130 16 L140 19 L150 12 L160 15 L170 8 L180 11 L190 4 L200 7 L210 0"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="lp-cagr">
            <TrendingUp aria-hidden="true" />
            <span>+11% CAGR</span>
          </div>
        </div>

        <div className="lp-snap-col">
          <h2 className="lp-snap-col-title">Top Competitors</h2>

          {[
            { name: "Coursera", pct: "28%", width: "72%" },
            { name: "Udemy", pct: "18%", width: "45%" },
            { name: "LinkedIn Learning", pct: "12%", width: "24%" },
          ].map((item) => (
            <div className="lp-competitor-row" key={item.name}>
              <div className="lp-competitor-name">{item.name}</div>
              <div className="lp-competitor-bar-row">
                <div className="lp-competitor-track">
                  <div
                    className="lp-competitor-fill"
                    style={{ width: item.width }}
                  />
                </div>
                <span className="lp-competitor-pct">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lp-snap-col">
          <h2 className="lp-snap-col-title">Key Signals</h2>

          <div className="lp-signal">
            <span className="lp-signal-icon">
              <FileText aria-hidden="true" />
            </span>
            <span>
              <span className="lp-signal-value">2.4K</span>
              <span className="lp-signal-label" style={{ display: "block" }}>
                relevant sources
              </span>
            </span>
          </div>

          <div className="lp-signal">
            <span className="lp-signal-icon">
              <Users aria-hidden="true" />
            </span>
            <span>
              <span className="lp-signal-value">156</span>
              <span className="lp-signal-label" style={{ display: "block" }}>
                competitor mentions
              </span>
            </span>
          </div>

          <div className="lp-signal">
            <span className="lp-signal-icon">
              <MessageCircle aria-hidden="true" />
            </span>
            <span>
              <span className="lp-signal-value">38</span>
              <span className="lp-signal-label" style={{ display: "block" }}>
                customer insights
              </span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
