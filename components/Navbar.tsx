"use client";

import React, { useEffect, useRef } from "react";
import {
  BookOpen,
  Clock3,
  Moon,
  Plus,
  Search,
  Sun,
  Zap,
} from "lucide-react";
import type { ViewMode } from "@/hooks/useStartupAnalysis";
import { QUOTA_LIMITS } from "@/lib/rate-limit";
import { scrollElementIntoView } from "@/lib/scroll";
import type { UsageQuotaInfo } from "@/lib/types";

interface NavbarProps {
  quota: UsageQuotaInfo | null;
  historyCount: number;
  theme: "light" | "dark";
  viewMode: ViewMode;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onResetToHero: () => void;
}

/**
 * Top navigation bar featuring brand identity, quota indicators, history drawer trigger,
 * theme toggle, and instant 'New Idea' quick action.
 *
 * @param props - NavbarProps containing user quotas, theme, viewMode, and navigation callbacks.
 * @returns Fully rendered header and navigation component.
 */
export function Navbar({
  quota,
  historyCount,
  theme,
  viewMode,
  onToggleTheme,
  onOpenHistory,
  onResetToHero,
}: NavbarProps) {
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const examplesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      if (examplesTimerRef.current) clearTimeout(examplesTimerRef.current);
    };
  }, []);

  const liveRem = quota?.analysesRemaining ?? QUOTA_LIMITS.analysesPerUser;
  const liveLimit = quota?.analysesLimit ?? QUOTA_LIMITS.analysesPerUser;
  const scrapeRem =
    quota?.deepScrapesRemaining ?? QUOTA_LIMITS.deepScrapesPerUser;
  const scrapeLimit =
    quota?.deepScrapesLimit ?? QUOTA_LIMITS.deepScrapesPerUser;

  const focusIdeaInput = () => {
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      const el = document.getElementById("lp-idea");
      if (el instanceof HTMLTextAreaElement) el.focus();
    }, 60);
  };

  const handleNewIdea = () => {
    onResetToHero();
    focusIdeaInput();
  };

  const scrollToExamples = () => {
    if (viewMode !== "hero") {
      onResetToHero();
      if (examplesTimerRef.current) clearTimeout(examplesTimerRef.current);
      examplesTimerRef.current = setTimeout(() => {
        scrollElementIntoView(
          document.getElementById("example-reports-section"),
          { block: "start" }
        );
      }, 60);
      return;
    }
    scrollElementIntoView(document.getElementById("example-reports-section"), {
      block: "start",
    });
  };

  const isHero = viewMode === "hero";

  return (
    <header className="global-header lp-header no-print">
      <div className="header-inner">
        <button
          type="button"
          className="lp-brand"
          onClick={onResetToHero}
          title="SaaSProof Home"
          aria-label="SaaSProof home"
        >
          <span className="lp-brand-mark">
            <Zap
              size={17}
              strokeWidth={2.4}
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
          <span className="lp-brand-name">SaaSProof</span>
        </button>

        <nav className="lp-nav" aria-label="Main navigation">
          <button
            type="button"
            className={`lp-nav-link${isHero ? " is-active" : ""}`}
            onClick={onResetToHero}
            aria-current={isHero ? "page" : undefined}
          >
            <Search aria-hidden="true" />
            <span>Validate</span>
          </button>

          <button
            type="button"
            className="lp-nav-link"
            onClick={onOpenHistory}
            aria-label={`Saved reports (${historyCount})`}
          >
            <Clock3 aria-hidden="true" />
            <span>Saved ({historyCount})</span>
          </button>

          <button
            type="button"
            className="lp-nav-link"
            onClick={scrollToExamples}
          >
            <BookOpen aria-hidden="true" />
            <span>Examples</span>
          </button>
        </nav>

        <div className="lp-header-right">
          <div
            className="lp-quota-pill"
            title="Remaining runs and deep scrapes"
          >
            <span className="lp-quota-item">
              <span className="lp-dot lp-dot-amber" aria-hidden="true" />
              {liveRem}/{liveLimit} runs
            </span>
            <span className="lp-quota-divider" aria-hidden="true" />
            <span className="lp-quota-item">
              <span className="lp-dot lp-dot-green" aria-hidden="true" />
              {scrapeRem}/{scrapeLimit} scrapes
            </span>
          </div>

          <button
            type="button"
            className="theme-btn lp-history-btn-mobile"
            onClick={onOpenHistory}
            title="Saved reports"
            aria-label={`Saved reports (${historyCount})`}
          >
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {historyCount > 0 && (
              <span className="lp-mobile-history-badge" aria-hidden="true">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="theme-btn"
            onClick={onToggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="lp-new-idea"
            onClick={handleNewIdea}
            aria-label="Create new startup idea analysis"
          >
            <Plus aria-hidden="true" />
            <span>New Idea</span>
          </button>
        </div>
      </div>
    </header>
  );
}
