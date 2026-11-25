"use client";

import React, { useMemo, useRef, useState } from "react";
import { scrollElementIntoView } from "@/lib/scroll";
import { AnalysisInputSchema, type AnalysisInput, type StartupReport } from "@/lib/types";
import { DEMO_PRESETS } from "@/lib/presets";
import { ExampleReportsSection } from "./landing/ExampleReportsSection";
import { IdeaComposerForm } from "./landing/IdeaComposerForm";
import { ResearchSnapshot } from "./landing/ResearchSnapshot";

interface LandingPageProps {
  isRunning: boolean;
  errorMessage: string | null;
  onSubmitIdea: (input: AnalysisInput) => void;
  onLoadPreset: (preset: StartupReport) => void;
  onShowToast: (msg: string) => void;
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [idea, setIdea] = useState("");
  const [region, setRegion] = useState("India");
  const [businessModel, setBusinessModel] =
    useState<AnalysisInput["businessModel"]>("Auto-detect");
  const [enableDeepScrape, setEnableDeepScrape] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const parsedInput = AnalysisInputSchema.safeParse({
    idea,
    region,
    businessModel,
    enableDeepScrape,
  });

  const validationError = parsedInput.success
    ? null
    : parsedInput.error.issues[0]?.message ||
      "Describe your startup idea in at least 10 characters.";
  const showValidationError = Boolean(validationError && submitAttempted);

  const examples = useMemo(() => DEMO_PRESETS.slice(0, 3), []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!parsedInput.success || isRunning) {
      textareaRef.current?.focus();
      return;
    }
    onSubmitIdea(parsedInput.data);
  };

  const handleUsePrompt = (preset: StartupReport) => {
    setIdea(preset.input.idea);
    setRegion(preset.input.region);
    setBusinessModel(preset.input.businessModel);
    setEnableDeepScrape(preset.input.enableDeepScrape);
    setSubmitAttempted(false);
    textareaRef.current?.focus();
    scrollElementIntoView(textareaRef.current, { block: "center" });
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

      <IdeaComposerForm
        idea={idea}
        region={region}
        businessModel={businessModel}
        enableDeepScrape={enableDeepScrape}
        isRunning={isRunning}
        showValidationError={showValidationError}
        validationError={validationError}
        errorMessage={errorMessage}
        textareaRef={textareaRef}
        onIdeaChange={(val) => {
          setIdea(val);
          if (submitAttempted && val.trim().length >= 10) {
            setSubmitAttempted(false);
          }
        }}
        onRegionChange={setRegion}
        onBusinessModelChange={setBusinessModel}
        onToggleDeepScrape={() => setEnableDeepScrape((v) => !v)}
        onSubmit={handleSubmit}
      />

      <ExampleReportsSection
        examples={examples}
        onLoadPreset={onLoadPreset}
        onUsePrompt={handleUsePrompt}
      />
    </>
  );
}
