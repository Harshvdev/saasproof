"use client";

import React from "react";
import { Download, MessageSquareText, Printer, RefreshCw } from "lucide-react";
import type { FramerOutput, StartupReport } from "@/lib/types";

interface ReportHeaderProps {
  report: StartupReport | null;
  framer?: FramerOutput;
  isRunning: boolean;
  onRerunLive: () => void;
  onBackToProgress?: () => void;
  onOpenCopilot: () => void;
  onDownloadMarkdown: () => void;
}

/**
 * ReportHeader displays the startup dossier title card, market/model badges,
 * execution telemetry strip, and primary export/co-pilot action buttons.
 *
 * @param props - ReportHeaderProps including active report and callback handlers.
 * @returns Accessible header section for the validation workspace.
 */
export function ReportHeader({
  report,
  framer,
  isRunning,
  onRerunLive,
  onBackToProgress,
  onOpenCopilot,
  onDownloadMarkdown,
}: ReportHeaderProps) {
  if (!framer) return null;

  return (
    <>
      {/* Preset Notice Banner */}
      {report?.isPreset && (
        <div className="preset-notice-banner">
          <div>
            <strong>Sample Report</strong> — Pre-computed example.
          </div>
          <button
            type="button"
            className="action-btn action-btn-rerun"
            onClick={onRerunLive}
            disabled={isRunning}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Re-run Live</span>
          </button>
        </div>
      )}

      {/* Report Summary Dossier Hero Card */}
      <div className="report-hero-card">
        <div className="report-top-bar">
          <div>
            <div className="report-badges">
              <span className="tag-pill badge-accent">{framer.category}</span>
              <span className="tag-pill">{framer.detectedModel}</span>
              <span className="tag-pill">{framer.targetGeography}</span>
            </div>
            <h1 className="report-title">{framer.startupTitle}</h1>
            <p className="report-oneliner">{framer.oneLiner}</p>
          </div>

          <div className="report-actions-bar">
            {isRunning && onBackToProgress && (
              <button
                type="button"
                className="action-btn"
                onClick={onBackToProgress}
              >
                <span>← Progress</span>
              </button>
            )}
            {report && (
              <>
                <button
                  type="button"
                  className="action-btn action-btn-copilot"
                  onClick={onOpenCopilot}
                >
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                  <span>Co-Pilot</span>
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={onDownloadMarkdown}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Export .md</span>
                </button>
                <button
                  type="button"
                  className="action-btn action-btn-print"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  <span>Print</span>
                </button>
              </>
            )}
          </div>
        </div>

        {report?.telemetry && (
          <div className="telemetry-strip">
            <div className="telemetry-item">
              <div className="telemetry-label">Model</div>
              <div className="telemetry-val">
                {report.telemetry.llmProviderUsed}
              </div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Searches</div>
              <div className="telemetry-val">
                {report.telemetry.tinySearchCalls} queries
              </div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Pages</div>
              <div className="telemetry-val">
                {report.telemetry.tinyFetchCalls}
                {report.telemetry.tinyAgentUsed ? " + Agent" : ""}
              </div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Time</div>
              <div className="telemetry-val">
                {(report.telemetry.durationMs / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
