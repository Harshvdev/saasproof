"use client";

import React from "react";
import {
  BookOpen,
  Bookmark,
  Clock3,
  Moon,
  Plus,
  Search,
  Sun,
  Zap,
} from "lucide-react";
import type { UsageQuotaInfo } from "@/lib/types";

interface NavbarProps {
  quota: UsageQuotaInfo | null;
  historyCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onResetToHero: () => void;
}

export function Navbar({
  quota,
  historyCount,
  theme,
  onToggleTheme,
  onOpenHistory,
  onResetToHero,
}: NavbarProps) {
  const liveRem = quota?.analysesRemaining ?? 8;
  const liveLimit = quota?.analysesLimit ?? 8;
  const scrapeRem = quota?.deepScrapesRemaining ?? 2;
  const scrapeLimit = quota?.deepScrapesLimit ?? 2;

  const handleNewIdea = () => {
    onResetToHero();
    window.setTimeout(() => {
      const el = document.getElementById("lp-idea");
      if (el instanceof HTMLTextAreaElement) el.focus();
    }, 60);
  };

  const scrollToExamples = () => {
    document
      .getElementById("example-reports-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="global-header lp-header no-print">
      <div className="header-inner">
        <button
          type="button"
          className="lp-brand"
          onClick={onResetToHero}
          title="SparkProof Home"
          aria-label="SparkProof home"
        >
          <span className="lp-brand-mark">
            <Zap size={17} strokeWidth={2.4} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="lp-brand-name">SparkProof</span>
        </button>

        <nav className="lp-nav" aria-label="Main navigation">
          <button
            type="button"
            className="lp-nav-link is-active"
            onClick={onResetToHero}
            aria-current="page"
          >
            <Search aria-hidden="true" />
            <span>Validate</span>
          </button>

          <button type="button" className="lp-nav-link" onClick={onOpenHistory}>
            <Clock3 aria-hidden="true" />
            <span>History</span>
          </button>

          <button type="button" className="lp-nav-link" onClick={onOpenHistory}>
            <Bookmark aria-hidden="true" />
            <span>Saved</span>
            {historyCount > 0 && (
              <span className="sr-only">{historyCount} saved reports</span>
            )}
          </button>

          <button type="button" className="lp-nav-link" onClick={scrollToExamples}>
            <BookOpen aria-hidden="true" />
            <span>Learn</span>
          </button>
        </nav>

        <div className="lp-header-right">
          <div className="lp-quota-pill" title="Remaining runs and deep scrapes">
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
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button type="button" className="lp-new-idea" onClick={handleNewIdea}>
            <Plus aria-hidden="true" />
            <span>New Idea</span>
          </button>
        </div>
      </div>
    </header>
  );
}
