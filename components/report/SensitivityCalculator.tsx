"use client";

import React, { useId, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import {
  calculateUnitEconomics,
  type UnitEconomicsMetrics,
} from "@/lib/unit-economics";
import {
  SensitivityMetricsGrid,
  type SliderConfig,
} from "./SensitivityMetricsGrid";

export { calculateUnitEconomics, type UnitEconomicsMetrics };

interface SensitivityCalculatorProps {
  initialArpu?: number;
  initialCac?: number;
  initialChurnPct?: number;
}

/**
 * Interactive Unit Economics & Sensitivity Simulator.
 * Provides live recalculation of LTV, LTV/CAC ratio, CAC payback months,
 * and annual run-rate using accessible range sliders.
 *
 * @param props - SensitivityCalculatorProps with initial ARPU, CAC, and Churn values.
 * @returns Fully rendered interactive domain calculator panel.
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

  const metrics = calculateUnitEconomics(arpu, cac, churnPct);

  const handleReset = () => {
    setArpu(initialArpu);
    setChurnPct(initialChurnPct);
    setCac(initialCac);
  };

  const sliders: SliderConfig[] = [
    {
      id: arpuId,
      label: "Monthly ARPU",
      displayValue: `$${arpu}/mo`,
      valueText: `$${arpu} per month`,
      min: 10,
      max: 500,
      step: 5,
      value: arpu,
      minLabel: "$10",
      maxLabel: "$500",
      onChange: setArpu,
    },
    {
      id: churnId,
      label: "Monthly Churn",
      displayValue: `${churnPct.toFixed(1)}%`,
      valueText: `${churnPct.toFixed(1)} percent monthly churn`,
      min: 1,
      max: 15,
      step: 0.5,
      value: churnPct,
      minLabel: "1% (Low)",
      maxLabel: "15% (High)",
      onChange: setChurnPct,
    },
    {
      id: cacId,
      label: "Estimated CAC",
      displayValue: `$${cac}`,
      valueText: `$${cac} acquisition cost`,
      min: 25,
      max: 800,
      step: 25,
      value: cac,
      minLabel: "$25",
      maxLabel: "$800",
      onChange: setCac,
    },
  ];

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
            <Calculator
              className="h-4 w-4"
              style={{ color: "var(--orange-700)" }}
              aria-hidden="true"
            />
            <span>Unit Economics &amp; Sensitivity Simulator</span>
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
        Stress-test early-stage founder pricing, churn resilience, and customer
        acquisition cost assumptions with live sensitivity modeling.
      </p>

      <SensitivityMetricsGrid sliders={sliders} metrics={metrics} />
    </div>
  );
}
