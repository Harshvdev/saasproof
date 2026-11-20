import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { MarketOutput } from "@/lib/types";
import { LoadingBlock } from "./LoadingBlock";

interface MarketTabProps {
  market?: MarketOutput;
  visible: boolean;
}

export function MarketTab({ market, visible }: MarketTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-market"
      aria-labelledby="tab-market"
      hidden={!visible}
      className="report-section"
    >
      {!market ? (
        <LoadingBlock message="Market Analyst agent is sizing TAM/SAM/SOM from live web sources..." />
      ) : (
        <div>
          <div className="section-grid-3">
            <div className="tam-card">
              <div className="tam-tier">TAM</div>
              <div className="tam-figure">{market.tam}</div>
              <p className="tam-desc">{market.tamDetail}</p>
            </div>
            <div className="tam-card">
              <div className="tam-tier">SAM</div>
              <div className="tam-figure">{market.sam}</div>
              <p className="tam-desc">{market.samDetail}</p>
            </div>
            <div className="tam-card highlight-som">
              <div className="tam-tier" style={{ color: "var(--orange-600)" }}>
                SOM (3Y)
              </div>
              <div className="tam-figure">{market.som}</div>
              <p className="tam-desc">{market.somDetail}</p>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Market Growth</div>
                <h3 className="panel-title">{market.growthRate}</h3>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.94rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {market.marketVerdict}
            </p>
          </div>

          <div className="section-equal-2">
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3 className="panel-title" style={{ color: "var(--emerald-text)" }}>
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span>Tailwinds</span>
                </h3>
              </div>
              <ul className="wind-list">
                {market.tailwinds.map((t) => (
                  <li key={t}>
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--emerald-text)" }}
                      aria-hidden="true"
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3 className="panel-title" style={{ color: "var(--rose-text)" }}>
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                  <span>Headwinds</span>
                </h3>
              </div>
              <ul className="wind-list">
                {market.headwinds.map((h) => (
                  <li key={h}>
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--amber-text)" }}
                      aria-hidden="true"
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel-card" style={{ marginTop: "20px" }}>
            <div className="panel-kicker">Verified Market Citations</div>
            <div className="source-chips" style={{ marginTop: "10px" }}>
              {market.sources.map((src) => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link-chip"
                >
                  <span>{src.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
