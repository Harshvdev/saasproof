import React from "react";
import { ShieldCheck } from "lucide-react";
import type { UnitEconomicsMetrics } from "@/lib/unit-economics";

export interface SliderConfig {
  id: string;
  label: string;
  displayValue: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (val: number) => void;
}

interface SensitivityMetricsGridProps {
  sliders: readonly SliderConfig[];
  metrics: UnitEconomicsMetrics;
}

/**
 * Renders the 3 unit-economics input sliders, the 4-metric sensitivity grid,
 * and the live LTV/CAC viability summary bar.
 */
export function SensitivityMetricsGrid({
  sliders,
  metrics,
}: SensitivityMetricsGridProps) {
  const { ltv, ltvCacRatio, paybackMonths, annualRevPer100, statusTier } = metrics;

  return (
    <>
      {/* 3-Column Live Sliders */}
      <div className="section-grid-3" style={{ marginBottom: "20px" }}>
        {sliders.map((slider) => (
          <div key={slider.id} className="tam-card" style={{ padding: "14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                htmlFor={slider.id}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {slider.label}
              </label>
              <span
                className="mono"
                style={{ fontWeight: 800, color: "var(--orange-700)" }}
              >
                {slider.displayValue}
              </span>
            </div>
            <input
              id={slider.id}
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={slider.value}
              onChange={(e) => slider.onChange(Number(e.target.value))}
              aria-valuemin={slider.min}
              aria-valuemax={slider.max}
              aria-valuenow={slider.value}
              aria-valuetext={slider.valueText}
              style={{
                width: "100%",
                accentColor: "var(--orange-700)",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.68rem",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              <span>{slider.minLabel}</span>
              <span>{slider.maxLabel}</span>
            </div>
          </div>
        ))}
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
          <div
            style={{
              fontSize: "0.74rem",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            Estimated LTV
          </div>
          <div
            className="mono"
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            ${ltv.toLocaleString("en-US")}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Lifetime revenue / customer
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.74rem",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            LTV / CAC Ratio
          </div>
          <div
            className="mono"
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: statusTier.color,
            }}
          >
            {ltvCacRatio}x
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Target: &gt; 3.0x
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.74rem",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            CAC Payback
          </div>
          <div
            className="mono"
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            {paybackMonths} mo
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Months to cash break-even
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.74rem",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            Annual Run-Rate / 100 Users
          </div>
          <div
            className="mono"
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--orange-700)",
            }}
          >
            ${annualRevPer100}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Base ARR projection
          </div>
        </div>
      </div>

      {/* Health Verdict Bar */}
      <div
        aria-live="polite"
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
        <ShieldCheck
          className="h-4 w-4 shrink-0"
          style={{ color: statusTier.color }}
          aria-hidden="true"
        />
        <div style={{ flex: 1, fontSize: "0.82rem" }}>
          <strong style={{ color: statusTier.color }}>
            {statusTier.label}:{" "}
          </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            {statusTier.summary}
          </span>
        </div>
        <span
          className={`tag-pill mono ${statusTier.badgeCls}`}
          style={{ fontWeight: 700 }}
        >
          {ltvCacRatio}x LTV/CAC
        </span>
      </div>
    </>
  );
}
