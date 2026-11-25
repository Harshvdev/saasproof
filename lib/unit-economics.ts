export interface UnitEconomicsMetrics {
  churnDecimal: number;
  ltv: number;
  ltvCacRatio: number;
  paybackMonths: number;
  annualRevPer100: string;
  statusTier: {
    label: string;
    badgeCls: string;
    color: string;
    summary: string;
  };
}

/**
 * Calculates deterministic unit economics and venture viability tiers.
 *
 * @param arpu - Average Revenue Per User/Account per month in USD.
 * @param cac - Customer Acquisition Cost in USD.
 * @param churnPct - Monthly churn rate as a percentage (e.g. 4.0 for 4%).
 * @returns Computed metrics including LTV, LTV/CAC ratio, payback period, and status classification.
 */
export function calculateUnitEconomics(
  arpu: number,
  cac: number,
  churnPct: number
): UnitEconomicsMetrics {
  const churnDecimal = Math.max(0.005, churnPct / 100);
  const ltv = Math.round(arpu / churnDecimal);
  const ltvCacRatio = Number((ltv / Math.max(1, cac)).toFixed(1));
  const paybackMonths = Number((cac / Math.max(1, arpu)).toFixed(1));
  const annualRevPer100 = (arpu * 12 * 100).toLocaleString("en-US");

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

  return {
    churnDecimal,
    ltv,
    ltvCacRatio,
    paybackMonths,
    annualRevPer100,
    statusTier,
  };
}
