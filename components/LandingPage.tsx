"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Globe2,
  MapPin,
  Pencil,
  PieChart,
  TriangleAlert,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { AnalysisInputSchema, type AnalysisInput, type StartupReport } from "@/lib/types";
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
  const generatedId = useId();
  const ideaId = "lp-idea";
  const regionId = `${generatedId}-region`;
  const modelId = `${generatedId}-model`;
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

  return (
    <>
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">Startup idea validator</p>
          <h1 className="lp-h1">
            Build products
            <br />
            people <span className="lp-h1-orange">pay for.</span>
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

      {/* Interactive Idea Composer Section */}
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
              placeholder="e.g., A subscription compliance tracker for solo physiotherapists in India that automatically reconciles patient consent forms..."
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
                    onChange={(event) => {
                      const parsed =
                        AnalysisInputSchema.shape.businessModel.safeParse(
                          event.target.value
                        );
                      if (parsed.success) {
                        setBusinessModel(parsed.data);
                      }
                    }}
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
                id="lp-deep-scrape-switch"
                type="button"
                className="lp-switch"
                role="switch"
                aria-checked={enableDeepScrape}
                aria-label="Enable deep search"
                onClick={() => setEnableDeepScrape((value) => !value)}
              />
              <label
                htmlFor="lp-deep-scrape-switch"
                className="lp-deep-label"
                title="Uses TinyFish deep web browser extraction to analyze actual competitor pricing, features, and landing page claims."
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

      <ExampleReportsSection
        examples={examples}
        onLoadPreset={onLoadPreset}
        onUsePrompt={handleUsePrompt}
      />
    </>
  );
}
