"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Eye,
  FileText,
  Globe2,
  Laptop,
  MapPin,
  MessageCircle,
  Pencil,
  PieChart,
  Store,
  TriangleAlert,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import type { AnalysisInput, StartupReport } from "@/lib/types";
import { DEMO_PRESETS } from "@/lib/presets";

interface LandingPageProps {
  isRunning: boolean;
  errorMessage: string | null;
  onSubmitIdea: (input: AnalysisInput) => void;
  onLoadPreset: (preset: StartupReport) => void;
  onShowToast: (msg: string) => void;
}

const BUSINESS_MODELS: AnalysisInput["businessModel"][] = [
  "Auto-detect",
  "Marketplace",
  "B2B SaaS",
  "B2C App",
  "AI Tool / API",
  "Hardware / Climate",
];

const REGIONS = [
  "India",
  "Global",
  "United States",
  "US & India Metro Cities",
  "Europe / UK",
];

const CATEGORY_LABELS: Record<string, string> = {
  "Recommerce Trust & Verification": "Marketplace",
  "Vertical Healthcare Compliance SaaS": "B2B SaaS",
  "Creator Economy Fintech & LegalOps": "B2B / Prosumer AI SaaS",
};

function reportScore(report: StartupReport) {
  return report.validator.overallScore;
}

function CategoryIcon({ category }: { category: string }) {
  const key = category.toLowerCase();
  if (key.includes("health") || key.includes("saas")) {
    return (
      <span className="lp-example-cat-icon">
        <Laptop aria-hidden="true" />
      </span>
    );
  }
  if (key.includes("creator") || key.includes("consumer")) {
    return (
      <span className="lp-example-cat-icon">
        <Users aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="lp-example-cat-icon">
      <Store aria-hidden="true" />
    </span>
  );
}

function ResearchSnapshot() {
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

export function LandingPage({
  isRunning,
  errorMessage,
  onSubmitIdea,
  onLoadPreset,
  onShowToast,
}: LandingPageProps) {
  const ideaId = useId();
  const regionId = useId();
  const modelId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [idea, setIdea] = useState("");
  const [region, setRegion] = useState("India");
  const [businessModel, setBusinessModel] =
    useState<AnalysisInput["businessModel"]>("Auto-detect");
  const [enableDeepScrape, setEnableDeepScrape] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const trimmed = idea.trim();
  const len = trimmed.length;
  const isValid = len >= 10 && len <= 1200;
  const validationError =
    len === 0
      ? "Describe your startup idea so the agents know what to research."
      : len < 10
        ? "Add a little more detail (minimum 10 characters) for accurate research."
        : null;
  const showValidationError = Boolean(validationError && submitAttempted);

  const examples = useMemo(() => DEMO_PRESETS.slice(0, 3), []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid || isRunning) {
      textareaRef.current?.focus();
      return;
    }
    onSubmitIdea({
      idea: trimmed,
      region,
      businessModel,
      enableDeepScrape,
    });
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.nativeEvent.isComposing) return;
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      handleSubmit(event);
    }
  };

  const handleUsePrompt = (preset: StartupReport) => {
    setIdea(preset.input.idea);
    setRegion(preset.input.region);
    setBusinessModel(preset.input.businessModel);
    setEnableDeepScrape(preset.input.enableDeepScrape);
    setSubmitAttempted(false);
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    onShowToast(`Prompt loaded for ${preset.framer.startupTitle}`);
  };

  const scrollToExamples = () => {
    document
      .getElementById("example-reports-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">Startup idea validator</p>
          <h1 className="lp-h1">
            Find the weak point
            <br />
            <span className="lp-h1-accent">before</span> you{" "}
            <span className="lp-h1-orange">build.</span>
          </h1>
          <p className="lp-sub">
            Validate your startup idea with real market data, competitor
            analysis,
            <br />
            customer insights, risk assessment and a 90-day roadmap — in ~60s.
          </p>
        </div>

        <ResearchSnapshot />
      </section>

      <section className="lp-composer" aria-label="Describe your startup idea">
        <form onSubmit={handleSubmit} noValidate>
          <label className="lp-composer-title" htmlFor={ideaId}>
            <Pencil aria-hidden="true" />
            <span>Describe your startup idea</span>
          </label>

          <div
            className={`lp-idea-box${showValidationError ? " is-invalid" : ""}`}
          >
            <textarea
              id={ideaId}
              ref={textareaRef}
              className="lp-idea-input"
              value={idea}
              maxLength={1200}
              onChange={(event) => {
                setIdea(event.target.value);
                if (submitAttempted && event.target.value.trim().length >= 10) {
                  setSubmitAttempted(false);
                }
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder="e.g., A platform that connects local professionals with short-term gigs, or a mobile app for sustainable home products..."
              aria-invalid={showValidationError}
              spellCheck={false}
            />
            <span className="lp-char-count">{len} / 1,200</span>
          </div>

          {showValidationError && (
            <p className="lp-idea-error" role="alert">
              {validationError}
            </p>
          )}

          <div className="lp-controls">
            <div className="lp-field lp-field-region">
              <MapPin aria-hidden="true" />
              <div className="lp-field-body">
                <label className="lp-field-label" htmlFor={regionId}>
                  Region
                </label>
                <div className="lp-select-wrap">
                  <select
                    id={regionId}
                    className="lp-select"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                  >
                    {REGIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
            </div>

            <span className="lp-control-divider" aria-hidden="true" />

            <div className="lp-field lp-field-model">
              <Globe2 aria-hidden="true" />
              <div className="lp-field-body">
                <label className="lp-field-label" htmlFor={modelId}>
                  Model
                </label>
                <div className="lp-select-wrap">
                  <select
                    id={modelId}
                    className="lp-select"
                    value={businessModel}
                    onChange={(event) =>
                      setBusinessModel(
                        event.target.value as AnalysisInput["businessModel"]
                      )
                    }
                  >
                    {BUSINESS_MODELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
            </div>

            <span className="lp-control-divider" aria-hidden="true" />

            <div className="lp-deep">
              <button
                type="button"
                className="lp-switch"
                role="switch"
                aria-checked={enableDeepScrape}
                aria-label="Enable deep search"
                onClick={() => setEnableDeepScrape((value) => !value)}
              />
              <label
                className="lp-deep-label"
                onClick={() => setEnableDeepScrape((value) => !value)}
              >
                <span>Deep Search</span>
                <CircleHelp aria-hidden="true" />
              </label>
            </div>

            <button
              type="submit"
              className="lp-validate-btn"
              disabled={isRunning}
            >
              <Zap aria-hidden="true" fill="currentColor" />
              <span>{isRunning ? "Validating…" : "Validate Idea"}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>

          <div className="lp-analysis-row">
            <span className="lp-analysis-label">
              <PieChart aria-hidden="true" />
              Analysis includes:
            </span>
            <span className="lp-analysis-item">
              <BarChart3 aria-hidden="true" />
              Market size
            </span>
            <span className="lp-analysis-item">
              <Users aria-hidden="true" />
              Competitors
            </span>
            <span className="lp-analysis-item">
              <UserRound aria-hidden="true" />
              Customer fit
            </span>
            <span className="lp-analysis-item">
              <TriangleAlert aria-hidden="true" />
              Risks
            </span>
            <span className="lp-analysis-item">
              <CalendarDays aria-hidden="true" />
              Roadmap
            </span>
          </div>

          {errorMessage && (
            <p className="lp-idea-error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </section>

      <section className="lp-examples" id="example-reports-section">
        <div className="lp-examples-head">
          <h2 className="lp-examples-title">
            <FileText aria-hidden="true" />
            <span>Example reports</span>
          </h2>
          <span className="lp-examples-rule" aria-hidden="true" />
          <button
            type="button"
            className="lp-examples-link"
            onClick={scrollToExamples}
          >
            <span>View all examples</span>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <div className="lp-example-grid">
          {examples.map((preset) => {
            const score = reportScore(preset);
            const category =
              CATEGORY_LABELS[preset.framer.category] ?? preset.framer.category;
            return (
              <article className="lp-example-card" key={preset.id}>
                <div className="lp-example-top">
                  <CategoryIcon category={preset.framer.category} />
                  <span className="lp-example-cat">{category}</span>
                  <span
                    className={`lp-example-score ${
                      score >= 75 ? "lp-score-green" : "lp-score-amber"
                    }`}
                  >
                    {score}
                  </span>
                </div>

                <h3 className="lp-example-title">{preset.framer.startupTitle}</h3>
                <p className="lp-example-desc">{preset.framer.oneLiner}</p>

                <div className="lp-example-actions">
                  <button
                    type="button"
                    className="lp-example-btn is-primary"
                    onClick={() => onLoadPreset(preset)}
                  >
                    <Eye aria-hidden="true" />
                    <span>View report</span>
                    <ArrowRight aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="lp-example-btn"
                    onClick={() => handleUsePrompt(preset)}
                  >
                    <FileText aria-hidden="true" />
                    <span>Use prompt</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
