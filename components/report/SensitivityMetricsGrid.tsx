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

  const metricCards = [
    {
      label: "Estimated LTV",
      value: `$${ltv.toLocaleString("en-US")}`,
      subtitle: "Lifetime revenue / customer",
      color: "var(--text-primary)",
    },
    {
      label: "LTV / CAC Ratio",
      value: `${ltvCacRatio}x`,
      subtitle: "Target: > 3.0x",
      color: statusTier.color,
    },
    {
      label: "CAC Payback",
      value: `${paybackMonths} mo`,
      subtitle: "Months to cash break-even",
      color: "var(--text-primary)",
    },
    {
      label: "Annual Run-Rate / 100 Users",
      value: `$${annualRevPer100}`,
      subtitle: "Base ARR projection",
      color: "var(--orange-700)",
    },
  ] as const;

  return (
    <>
      <div className="section-grid-3 sens-sliders-grid">
        {sliders.map((slider) => (
          <div key={slider.id} className="tam-card sens-slider-card">
            <div className="sens-slider-header">
              <label htmlFor={slider.id} className="sens-slider-label">
                {slider.label}
              </label>
              <span className="mono sens-slider-val">{slider.displayValue}</span>
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
              className="sens-range-input"
            />
            <div className="sens-range-bounds">
              <span>{slider.minLabel}</span>
              <span>{slider.maxLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sens-metrics-matrix">
        {metricCards.map((card) => (
          <div key={card.label}>
            <div className="sens-metric-label">{card.label}</div>
            <div
              className="mono sens-metric-val"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
            <div className="sens-metric-sub">{card.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="sens-verdict-bar" aria-live="polite">
        <ShieldCheck
          className="h-4 w-4 shrink-0"
          style={{ color: statusTier.color }}
          aria-hidden="true"
        />
        <div className="sens-verdict-copy">
          <strong style={{ color: statusTier.color }}>
            {statusTier.label}:{" "}
          </strong>
          <span>{statusTier.summary}</span>
        </div>
        <span className={`tag-pill mono sens-verdict-pill ${statusTier.badgeCls}`}>
          {ltvCacRatio}x LTV/CAC
        </span>
      </div>
    </>
  );
}
