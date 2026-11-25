"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import { LandingPage } from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import { useStartupAnalysis } from "@/hooks/useStartupAnalysis";
import { scrollToTop } from "@/lib/scroll";

const ReportWorkspace = dynamic(
  () => import("@/components/ReportWorkspace").then((mod) => mod.ReportWorkspace),
  { ssr: false }
);

const AgentMissionControl = dynamic(
  () =>
    import("@/components/AgentMissionControl").then(
      (mod) => mod.AgentMissionControl
    ),
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
    reportSessionKey,
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

  const [historyMounted, setHistoryMounted] = React.useState(false);
  const [copilotMounted, setCopilotMounted] = React.useState(false);

  const openHistory = () => {
    setHistoryMounted(true);
    setHistoryOpen(true);
  };

  const openCopilot = () => {
    setCopilotMounted(true);
    setCopilotOpen(true);
  };

  return (
    <>
      <div className="ambient-backdrop" aria-hidden="true" />

      <Navbar
        quota={quota}
        historyCount={history.length}
        theme={theme}
        viewMode={viewMode}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={openHistory}
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
            startupTitle={
              activeReport?.framer.startupTitle ?? partial.framer?.startupTitle
            }
            nodes={nodes}
            isRunning={isRunning}
            isPaused={isPaused}
            hasPartialReport={hasPartialReport}
            onTogglePause={handleTogglePause}
            onSkipToReport={() => {
              if (isPaused) handleTogglePause();
              setViewMode("report");
              scrollToTop();
            }}
          />
        )}

        {viewMode === "report" && (
          <ReportWorkspace
            key={reportSessionKey}
            report={activeReport}
            partial={partial}
            isRunning={isRunning}
            onOpenCopilot={openCopilot}
            onRerunLive={() => {
              if (activeReport) {
                runLiveAnalysis(activeReport.input);
              }
            }}
            onBackToProgress={
              isRunning && runningIdeaText
                ? () => {
                    setViewMode("validating");
                    scrollToTop();
                  }
                : undefined
            }
            onShowToast={showToast}
          />
        )}
      </main>

      <footer className="lp-footer no-print">
        <p>
          SaaSProof · Multi-Agent Startup Co-Pilot (PS08) · Grounded market
          research, competitor intelligence, and unit economics modeling.
        </p>
      </footer>

      {historyMounted && (
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
      )}

      {copilotMounted && (
        <CopilotDrawer
          key={activeReport?.id ?? "empty"}
          open={copilotOpen}
          report={activeReport}
          onClose={() => setCopilotOpen(false)}
          onQuotaUpdate={(q) => setQuota(q)}
        />
      )}

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={15} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
