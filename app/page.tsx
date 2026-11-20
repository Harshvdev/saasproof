"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import { LandingPage } from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import { useStartupAnalysis } from "@/hooks/useStartupAnalysis";

const ReportWorkspace = dynamic(
  () => import("@/components/ReportWorkspace").then((mod) => mod.ReportWorkspace),
  { ssr: false }
);

const AgentMissionControl = dynamic(
  () => import("@/components/AgentMissionControl").then((mod) => mod.AgentMissionControl),
  { ssr: false }
);

const HistoryDrawer = dynamic(
  () => import("@/components/HistoryDrawer").then((mod) => mod.HistoryDrawer),
  { ssr: false }
);

const CopilotDrawer = dynamic(
  () => import("@/components/CopilotDrawer").then((mod) => mod.CopilotDrawer),
  { ssr: false }
);

/**
 * HomePage serves as the root client application layout, orchestrating view transitions
 * across hero intake, live multi-agent execution, and the final validation dossier.
 *
 * @returns Fully rendered application page.
 */
export default function HomePage() {
  const {
    theme,
    viewMode,
    quota,
    history,
    activeReport,
    partial,
    nodes,
    runningIdeaText,
    isRunning,
    isPaused,
    errorMessage,
    historyOpen,
    copilotOpen,
    toastMessage,
    hasPartialReport,
    handleToggleTheme,
    handleTogglePause,
    handleDeleteReport,
    handleLoadPreset,
    handleResetToHero,
    runLiveAnalysis,
    setHistoryOpen,
    setCopilotOpen,
    setQuota,
    setViewMode,
    showToast,
  } = useStartupAnalysis();

  return (
    <>
      <div className="ambient-backdrop" aria-hidden="true" />

      <Navbar
        quota={quota}
        historyCount={history.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setHistoryOpen(true)}
        onResetToHero={handleResetToHero}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className={viewMode === "hero" ? "spark-main lp-main" : "spark-main"}
      >
        {viewMode === "hero" && (
          <LandingPage
            isRunning={isRunning}
            errorMessage={errorMessage}
            onSubmitIdea={runLiveAnalysis}
            onLoadPreset={handleLoadPreset}
            onShowToast={showToast}
          />
        )}

        {viewMode !== "hero" && errorMessage && (
          <div className="error-banner" role="alert">
            <span>{errorMessage}</span>
            {!isRunning && !hasPartialReport && (
              <button
                type="button"
                className="nav-btn"
                onClick={handleResetToHero}
              >
                Back
              </button>
            )}
          </div>
        )}

        {viewMode === "validating" && runningIdeaText && (
          <AgentMissionControl
            ideaText={runningIdeaText}
            startupTitle={activeReport?.framer.startupTitle ?? partial.framer?.startupTitle}
            nodes={nodes}
            isRunning={isRunning}
            isPaused={isPaused}
            hasPartialReport={hasPartialReport}
            onTogglePause={handleTogglePause}
            onSkipToReport={() => {
              if (isPaused) handleTogglePause();
              setViewMode("report");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {viewMode === "report" && (
          <ReportWorkspace
            report={activeReport}
            partial={partial}
            isRunning={isRunning}
            onOpenCopilot={() => setCopilotOpen(true)}
            onRerunLive={() => {
              if (activeReport) {
                runLiveAnalysis(activeReport.input);
              }
            }}
            onBackToProgress={
              isRunning && runningIdeaText
                ? () => {
                    setViewMode("validating");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                : undefined
            }
            onShowToast={showToast}
          />
        )}
      </main>

      <HistoryDrawer
        open={historyOpen}
        reports={history}
        activeReportId={activeReport?.id ?? null}
        onClose={() => setHistoryOpen(false)}
        onSelectReport={(rep) => {
          handleLoadPreset(rep);
        }}
        onDeleteReport={handleDeleteReport}
      />

      <CopilotDrawer
        key={activeReport?.id ?? "empty"}
        open={copilotOpen}
        report={activeReport}
        onClose={() => setCopilotOpen(false)}
        onQuotaUpdate={(q) => setQuota(q)}
      />

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
