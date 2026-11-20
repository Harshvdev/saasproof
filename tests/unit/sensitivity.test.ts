import { describe, expect, test } from "bun:test";
import { calculateUnitEconomics } from "../../components/report/SensitivityCalculator";

describe("Unit Suite: Sensitivity Calculator & Unit Economics Math", () => {
  test("computes accurate LTV and LTV/CAC ratio for standard SaaS assumptions", () => {
    // ARPU = $49/mo, Churn = 4.0%, CAC = $140
    // Churn decimal = 0.04
    // LTV = 49 / 0.04 = 1225
    // LTV/CAC = 1225 / 140 = 8.75 -> 8.8
    // Payback = 140 / 49 = 2.85 -> 2.9
    const res = calculateUnitEconomics(49, 140, 4.0);

    expect(res.ltv).toBe(1225);
    expect(res.ltvCacRatio).toBe(8.8);
    expect(res.paybackMonths).toBe(2.9);
    expect(res.statusTier.badgeCls).toBe("score-high");
    expect(res.statusTier.label).toBe("Prime Investable Unit Economics");
  });

  test("classifies Moderate Efficiency Wedge when LTV/CAC is between 2.0x and 3.0x", () => {
    // ARPU = $25/mo, Churn = 5.0% -> LTV = 500
    // CAC = $200 -> LTV/CAC = 2.5x
    const res = calculateUnitEconomics(25, 200, 5.0);

    expect(res.ltv).toBe(500);
    expect(res.ltvCacRatio).toBe(2.5);
    expect(res.statusTier.badgeCls).toBe("score-mid");
    expect(res.statusTier.label).toBe("Moderate Efficiency Wedge");
  });

  test("classifies High Acquisition Burn Risk when LTV/CAC is under 2.0x", () => {
    // ARPU = $20/mo, Churn = 10.0% -> LTV = 200
    // CAC = $150 -> LTV/CAC = 1.3x
    const res = calculateUnitEconomics(20, 150, 10.0);

    expect(res.ltv).toBe(200);
    expect(res.ltvCacRatio).toBe(1.3);
    expect(res.statusTier.badgeCls).toBe("score-low");
    expect(res.statusTier.label).toBe("High Acquisition Burn Risk");
  });

  test("enforces minimum churn boundary to prevent division by zero", () => {
    const res = calculateUnitEconomics(100, 50, 0.0);
    expect(res.churnDecimal).toBe(0.005);
    expect(res.ltv).toBe(20000);
    expect(res.paybackMonths).toBe(0.5);
  });
});
