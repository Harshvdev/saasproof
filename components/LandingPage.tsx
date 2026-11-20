"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Globe2,
  MapPin,
  Pencil,
  PieChart,
  TriangleAlert,
  Zap,
} from "lucide-react";
import type { AnalysisInput, StartupReport } from "@/lib/types";
import { DEMO_PRESETS } from "@/lib/presets";
import { ResearchSnapshot } from "./landing/ResearchSnapshot";
import { ExampleReportsSection } from "./landing/ExampleReportsSection";

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

/**
 * LandingPage renders the hero value proposition, research snapshot preview,
 * interactive idea composer form, and pre-computed demo reports.
 *
 * @param props - LandingPageProps with submit and preset selection callbacks.
 * @returns Fully rendered landing page view.
 */
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
          <div className="lp-pill">
            <span className="lp-pill-badge">6 Specialized Agents</span>
            <span className="lp-pill-text">Live web-grounded research</span>
          </div>

          <h1 className="lp-hero-title">
            Find the weak point <br />
            <em>before you build.</em>
          </h1>

          <p className="lp-hero-sub">
            Validate any startup idea with real market data, competitor intel,
            customer insights, and a 90-day roadmap in ~60 seconds.
          </p>

          <div className="lp-hero-actions">
            <button
              type="button"
              className="lp-hero-btn is-primary"
              onClick={() => textareaRef.current?.focus()}
            >
              <span>Validate your idea</span>
              <ArrowRight aria-hidden="true" />
            </button>
            <button
              type="button"
              className="lp-hero-btn"
              onClick={scrollToExamples}
            >
              <span>Explore example reports</span>
            </button>
          </div>
        </div>

        <ResearchSnapshot />
      </section>

      {/* Interactive Idea Composer Section */}
      <section className="lp-composer" aria-label="Describe your startup idea">
        <form className="lp-composer-card" onSubmit={handleSubmit}>
          <div className="lp-composer-head">
            <div className="lp-composer-title-group">
              <Pencil aria-hidden="true" />
              <div>
                <label className="lp-composer-title" htmlFor={ideaId}>
                  Describe your idea
                </label>
                <div className="lp-composer-sub">
                  Be specific about who pays and what problem you solve.
                </div>
              </div>
            </div>
          </div>

          <div className="lp-textarea-wrap">
            <textarea
              id={ideaId}
              ref={textareaRef}
              rows={4}
              maxLength={1200}
              placeholder="e.g., A subscription compliance tracker for solo physiotherapists in India that automatically reconciles patient consent forms..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              aria-invalid={showValidationError}
              aria-describedby={showValidationError ? "idea-error" : undefined}
            />
            <div className="lp-char-count">{len} / 1200</div>
          </div>

          {showValidationError && (
            <p className="lp-input-error" id="idea-error" role="alert">
              <TriangleAlert aria-hidden="true" />
              <span>{validationError}</span>
            </p>
          )}

          <div className="lp-controls">
            <div className="lp-field lp-field-region">
              <label className="lp-label" htmlFor={regionId}>
                <MapPin aria-hidden="true" />
                <span>Target Region</span>
              </label>
              <div className="lp-field-body">
                <div className="lp-select-wrap">
                  <select
                    id={regionId}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="lp-select-arrow" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="lp-field lp-field-model">
              <label className="lp-label" htmlFor={modelId}>
                <PieChart aria-hidden="true" />
                <span>Business Model</span>
              </label>
              <div className="lp-field-body">
                <div className="lp-select-wrap">
                  <select
                    id={modelId}
                    value={businessModel}
                    onChange={(e) =>
                      setBusinessModel(
                        e.target.value as AnalysisInput["businessModel"]
                      )
                    }
                  >
                    {BUSINESS_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="lp-select-arrow" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="lp-deep">
              <div className="lp-deep-top">
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableDeepScrape}
                  className="lp-switch"
                  onClick={() => setEnableDeepScrape((v) => !v)}
                >
                  <span
                    className={`lp-switch-track ${enableDeepScrape ? "is-on" : ""}`}
                  >
                    <span className="lp-switch-thumb" />
                  </span>
                  <span className="lp-switch-text">Deep scrape</span>
                </button>
                <div className="lp-tooltip-wrap">
                  <span
                    className="lp-tooltip-trigger"
                    tabIndex={0}
                    role="button"
                    aria-label="Deep scrape info"
                  >
                    <CircleHelp aria-hidden="true" />
                  </span>
                  <div className="lp-tooltip" role="tooltip">
                    Uses TinyFish deep web browser extraction to analyze actual
                    competitor pricing, features, and landing page claims.
                  </div>
                </div>
              </div>
              <span className="lp-deep-sub">
                Extracts full competitor landing pages
              </span>
            </div>
          </div>

          <div className="lp-analysis-row">
            <div className="lp-agents-hint">
              <span className="lp-hint-title">Agents that will run:</span>
              <div className="lp-agent-badges">
                <span className="lp-agent-badge">
                  <Globe2 aria-hidden="true" />
                  <span>Market Analyst</span>
                </span>
                <span className="lp-agent-badge">
                  <Globe2 aria-hidden="true" />
                  <span>Competitor Intel</span>
                </span>
                <span className="lp-agent-badge">
                  <Globe2 aria-hidden="true" />
                  <span>Customer Profiler</span>
                </span>
                <span className="lp-agent-badge">
                  <Globe2 aria-hidden="true" />
                  <span>Execution Planner</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="lp-submit-btn"
              disabled={isRunning || !isValid}
            >
              <Zap aria-hidden="true" />
              <span>{isRunning ? "Running..." : "Analyze Idea"}</span>
            </button>
          </div>

          {errorMessage && (
            <p className="lp-error-banner" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </section>

      <ExampleReportsSection
        examples={examples}
        onLoadPreset={onLoadPreset}
        onUsePrompt={handleUsePrompt}
      />
    </>
  );
}
