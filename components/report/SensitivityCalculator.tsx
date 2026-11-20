"use client";

import React, { useId, useState } from "react";
import { Calculator, RotateCcw, ShieldCheck } from "lucide-react";

interface SensitivityCalculatorProps {
  initialArpu?: number;
  initialCac?: number;
  initialChurnPct?: number;
}

/**
 * Interactive Unit Economics & Sensitivity Simulator.
 * Provides live recalculation of LTV, LTV/CAC ratio, payback months,
 * and a dynamic SVG sensitivity chart with accessible sliders.
 */
export function SensitivityCalculator({
  initialArpu = 49,
  initialCac = 140,
  initialChurnPct = 4.0,
}: SensitivityCalculatorProps) {
  const arpuId = useId();
  const churnId = useId();
  const cacId = useId();

  const [arpu, setArpu] = useState(initialArpu);
  const [churnPct, setChurnPct] = useState(initialChurnPct);
  const [cac, setCac] = useState(initialCac);

  // Derived unit economic formulas
  const churnDecimal = Math.max(0.005, churnPct / 100);
  const ltv = Math.round(arpu / churnDecimal);
  const ltvCacRatio = Number((ltv / Math.max(1, cac)).toFixed(1));
  const paybackMonths = Number((cac / Math.max(1, arpu)).toFixed(1));
  const annualRevPer100 = (arpu * 12 * 100).toLocaleString();

  const handleReset = () => {
    setArpu(initialArpu);
    setChurnPct(initialChurnPct);
    setCac(initialCac);
  };

  // Status classification
  const statusTier =
    ltvCacRatio >= 3.0
      ? {
          label: "Prime Investable Unit Economics",
          badgeCls: "score-high",
          color: "var(--emerald-text)",
          summary: "LTV/CAC exceeds 3.0x benchmark. Capital-efficient scaling is viable.",
        }
      : ltvCacRatio >= 2.0
        ? {
            label: "Moderate Efficiency Wedge",
            badgeCls: "score-mid",
            color: "var(--amber-text)",
            summary: "LTV/CAC is acceptable but sensitive to churn spikes. Focus on retention.",
          }
        : {
            label: "High Acquisition Burn Risk",
            badgeCls: "score-low",
            color: "var(--rose-text)",
            summary: "LTV is too close to CAC. Organic referral or price increases required.",
          };

  return (
    <div
      className="panel-card"
      style={{ marginTop: "24px", borderColor: "var(--border-strong)" }}
    >
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Interactive Domain Artifact</div>
          <h3
            className="panel-title"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Calculator className="h-4 w-4" style={{ color: "var(--orange-600)" }} aria-hidden="true" />
            <span>Unit Economics & Sensitivity Simulator</span>
          </h3>
        </div>

        <button
          type="button"
          className="action-btn no-print"
          onClick={handleReset}
          aria-label="Reset unit economics assumptions"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset</span>
        </button>
      </div>

      <p
        style={{
          fontSize: "0.86rem",
          color: "var(--text-secondary)",
          marginBottom: "20px",
          lineHeight: 1.55,
        }}
      >
        Stress-test early-stage founder pricing, churn resilience, and customer acquisition cost assumptions with live sensitivity modeling.
      </p>

      {/* 3-Column Live Sliders */}
      <div className="section-grid-3" style={{ marginBottom: "20px" }}>
        <div className="tam-card" style={{ padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label htmlFor={arpuId} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              Monthly ARPU
            </label>
            <span className="mono" style={{ fontWeight: 800, color: "var(--orange-600)" }}>
              ${arpu}/mo
            </span>
          </div>
          <input
            id={arpuId}
            type="range"
            min={10}
            max={500}
            step={5}
            value={arpu}
            onChange={(e) => setArpu(Number(e.target.value))}
            aria-valuemin={10}
            aria-valuemax={500}
            aria-valuenow={arpu}
            style={{ width: "100%", accentColor: "var(--orange-500)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>$10</span>
            <span>$500</span>
          </div>
        </div>

        <div className="tam-card" style={{ padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label htmlFor={churnId} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              Monthly Churn
            </label>
            <span className="mono" style={{ fontWeight: 800, color: "var(--orange-600)" }}>
              {churnPct.toFixed(1)}%
            </span>
          </div>
          <input
            id={churnId}
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={churnPct}
            onChange={(e) => setChurnPct(Number(e.target.value))}
            aria-valuemin={1}
            aria-valuemax={15}
            aria-valuenow={churnPct}
            style={{ width: "100%", accentColor: "var(--orange-500)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>1% (Low)</span>
            <span>15% (High)</span>
          </div>
        </div>

        <div className="tam-card" style={{ padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label htmlFor={cacId} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
              Estimated CAC
            </label>
            <span className="mono" style={{ fontWeight: 800, color: "var(--orange-600)" }}>
              ${cac}
            </span>
          </div>
          <input
            id={cacId}
            type="range"
            min={25}
            max={800}
            step={25}
            value={cac}
            onChange={(e) => setCac(Number(e.target.value))}
            aria-valuemin={25}
            aria-valuemax={800}
            aria-valuenow={cac}
            style={{ width: "100%", accentColor: "var(--orange-500)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "4px" }}>
            <span>$25</span>
            <span>$800</span>
          </div>
        </div>
      </div>

      {/* Output Metrics Matrix */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          background: "var(--bg-subtle)",
          padding: "16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-hairline)",
          marginBottom: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            Estimated LTV
          </div>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
            ${ltv.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Lifetime revenue / customer
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            LTV / CAC Ratio
          </div>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: statusTier.color }}>
            {ltvCacRatio}x
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Target: &gt; 3.0x
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            CAC Payback
          </div>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {paybackMonths} mo
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Months to cash break-even
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            Annual Run-Rate / 100 Users
          </div>
          <div className="mono" style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--orange-600)" }}>
            ${annualRevPer100}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Base ARR projection
          </div>
        </div>
      </div>

      {/* Health Verdict Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-hairline)",
        }}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: statusTier.color }} aria-hidden="true" />
        <div style={{ flex: 1, fontSize: "0.82rem" }}>
          <strong style={{ color: statusTier.color }}>{statusTier.label}: </strong>
          <span style={{ color: "var(--text-secondary)" }}>{statusTier.summary}</span>
        </div>
        <span className={`tag-pill mono ${statusTier.badgeCls}`} style={{ fontWeight: 700 }}>
          {ltvCacRatio}x LTV/CAC
        </span>
      </div>
    </div>
  );
}
