"use client";

import React, { useId } from "react";
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
import {
  AnalysisInputSchema,
  BUSINESS_MODELS,
  REGIONS,
  type AnalysisInput,
} from "@/lib/types";

interface IdeaComposerFormProps {
  idea: string;
  region: string;
  businessModel: AnalysisInput["businessModel"];
  enableDeepScrape: boolean;
  isRunning: boolean;
  showValidationError: boolean;
  validationError: string | null;
  errorMessage: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onIdeaChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onBusinessModelChange: (value: AnalysisInput["businessModel"]) => void;
  onToggleDeepScrape: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

/**
 * Interactive startup idea intake form with single-source-of-truth Zod bounds,
 * accessible ARIA descriptions, and deep-search toggle.
 *
 * @param props - Controlled form fields, validation state, and callbacks.
 * @returns Accessible composer section.
 */
export function IdeaComposerForm({
  idea,
  region,
  businessModel,
  enableDeepScrape,
  isRunning,
  showValidationError,
  validationError,
  errorMessage,
  textareaRef,
  onIdeaChange,
  onRegionChange,
  onBusinessModelChange,
  onToggleDeepScrape,
  onSubmit,
}: IdeaComposerFormProps) {
  const generatedId = useId();
  const ideaId = "lp-idea";
  const countId = `${generatedId}-count`;
  const clientErrId = `${generatedId}-client-error`;
  const serverErrId = `${generatedId}-server-error`;
  const deepHintId = `${generatedId}-deep-hint`;
  const regionId = `${generatedId}-region`;
  const modelId = `${generatedId}-model`;

  const len = idea.trim().length;

  const describedByIds = [
    countId,
    showValidationError ? clientErrId : null,
    errorMessage ? serverErrId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.nativeEvent.isComposing) return;
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      onSubmit(event);
    }
  };

  return (
    <section className="lp-composer" aria-label="Describe your startup idea">
      <form onSubmit={onSubmit} noValidate>
        <label className="lp-composer-title" htmlFor={ideaId}>
          <Pencil aria-hidden="true" />
          <span>Describe your startup idea</span>
        </label>

        <div className={`lp-idea-box${showValidationError ? " is-invalid" : ""}`}>
          <textarea
            id={ideaId}
            ref={textareaRef}
            className="lp-idea-input"
            value={idea}
            maxLength={1200}
            onChange={(event) => onIdeaChange(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="e.g., A subscription compliance tracker for solo physiotherapists in India that automatically reconciles patient consent forms..."
            aria-invalid={showValidationError}
            aria-describedby={describedByIds}
            spellCheck={false}
          />
          <span id={countId} className="lp-char-count">
            {len} / 1,200
          </span>
        </div>

        {showValidationError && validationError && (
          <p id={clientErrId} className="lp-idea-error" role="alert">
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
                  onChange={(event) => onRegionChange(event.target.value)}
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
                      onBusinessModelChange(parsed.data);
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
              aria-describedby={deepHintId}
              onClick={onToggleDeepScrape}
            />
            <label
              htmlFor="lp-deep-scrape-switch"
              className="lp-deep-label"
              title="Uses TinyFish deep web browser extraction to analyze actual competitor pricing, features, and landing page claims."
            >
              <span>Deep Search</span>
              <CircleHelp aria-hidden="true" />
            </label>
            <span id={deepHintId} className="sr-only">
              Uses TinyFish deep web browser extraction to inspect live competitor
              pricing and landing page positioning.
            </span>
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
          <p id={serverErrId} className="lp-idea-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}
