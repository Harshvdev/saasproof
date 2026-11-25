interface VerdictGaugeProps {
  score: number;
  badge: string;
}

/**
 * VerdictGauge renders an SVG circular progress indicator displaying the overall 0-100 viability score
 * and color-coded status badge.
 *
 * @param props - VerdictGaugeProps with numerical score and badge string.
 * @returns Fully rendered SVG score gauge.
 */
export function VerdictGauge({ score, badge }: VerdictGaugeProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const badgeClass =
    badge === "Strong Go"
      ? "score-high"
      : badge === "Promising Wedge" || badge === "Needs Pivot"
        ? "score-mid"
        : "score-low";

  return (
    <div
      className="score-showcase"
      role="group"
      aria-label={`Overall viability score ${clamped} out of 100, verdict ${badge}`}
    >
      <div className="gauge-wrap">
        <svg viewBox="0 0 176 176" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="var(--bg-subtle)"
            strokeWidth="12"
          />
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="url(#saasproofGaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <defs>
            <linearGradient id="saasproofGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
        <div className="gauge-center" aria-hidden="true">
          <span className="gauge-number">{clamped}</span>
          <span className="gauge-max">/ 100</span>
        </div>
      </div>

      <span className={`verdict-pill ${badgeClass}`} style={{ border: "1px solid" }}>
        {badge}
      </span>
    </div>
  );
}
