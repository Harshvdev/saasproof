import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ErrorBoundary from "../../app/error";
import NotFound from "../../app/not-found";
import { AgentMissionControl, type AgentNodeState } from "../../components/AgentMissionControl";
import { LandingPage } from "../../components/LandingPage";
import { Navbar } from "../../components/Navbar";
import { ReportWorkspace } from "../../components/ReportWorkspace";
import { CompetitorsTab } from "../../components/report/CompetitorsTab";
import { SensitivityCalculator } from "../../components/report/SensitivityCalculator";
import { DEMO_PRESETS } from "../../lib/presets";
import type { AgentNodeId } from "../../lib/types";

const noop = () => {};

function buildSampleNodes(): Record<AgentNodeId, AgentNodeState> {
  return {
    framer: {
      id: "framer",
      label: "Framer Agent",
      role: "Problem Structurer",
      status: "done",
      message: "Structured startup thesis.",
      queries: ["b2b inspection saas"],
      sources: [
        { title: "Benchmarks", url: "https://example.com/benchmarks", domain: "example.com" },
      ],
      provider: "Gemini",
    },
    market: {
      id: "market",
      label: "Market Agent",
      role: "TAM / SAM / SOM",
      status: "running",
      message: "Sizing regional market...",
      queries: [],
      sources: [],
    },
    competitors: {
      id: "competitors",
      label: "Competitor Intel",
      role: "Rival Pricing",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    customers: {
      id: "customers",
      label: "Customer Profiler",
      role: "Mom Test Personas",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    validator: {
      id: "validator",
      label: "Devil's Advocate",
      role: "Fatal Risks",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    planner: {
      id: "planner",
      label: "90-Day Planner",
      role: "Execution Roadmap",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
  };
}

describe("Component Rendering Suite: UI Trees, ARIA Semantics & XSS Neutralization", () => {
  test("LandingPage renders hero headline, accessible composer form, switch, and 3 demo presets", () => {
    const html = renderToStaticMarkup(
      React.createElement(LandingPage, {
        isRunning: false,
        errorMessage: null,
        onSubmitIdea: noop,
        onLoadPreset: noop,
        onShowToast: noop,
      })
    );

    expect(html).toContain("Build products");
    expect(html).toContain("pay for.");
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('id="example-reports-section"');
    for (const preset of DEMO_PRESETS) {
      expect(html).toContain(preset.framer.startupTitle);
    }
  });

  test("SensitivityCalculator renders 3 accessible range sliders and computed LTV/CAC output", () => {
    const html = renderToStaticMarkup(
      React.createElement(SensitivityCalculator, {
        initialArpu: 60,
        initialCac: 150,
        initialChurnPct: 5,
      })
    );

    const sliderMatches = html.match(/type="range"/g) ?? [];
    expect(sliderMatches).toHaveLength(3);
    expect(html).toContain('aria-valuetext="$60 per month"');
    expect(html).toContain('aria-label="Reset unit economics assumptions"');
    expect(html).toContain("8x LTV/CAC");
  });

  test("CompetitorsTab maintains WCAG heading order and strips unsafe javascript: URLs", () => {
    const base = DEMO_PRESETS[0].competitors;
    const html = renderToStaticMarkup(
      React.createElement(CompetitorsTab, {
        visible: true,
        competitors: {
          ...base,
          competitors: [
            {
              ...base.competitors[0],
              name: "MaliciousRival",
              url: "javascript:alert(1)",
            },
            {
              ...base.competitors[0],
              name: "SafeRival",
              url: "https://saferival.example.com/pricing",
            },
          ],
        },
      })
    );

    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
    expect(html).not.toContain("javascript:alert");
    expect(html).toContain('href="https://saferival.example.com/pricing"');
  });

  test("AgentMissionControl renders heading hierarchy, progressbar, and scoped live status", () => {
    const html = renderToStaticMarkup(
      React.createElement(AgentMissionControl, {
        ideaText: "Autonomous fleet maintenance ledger for regional carriers",
        startupTitle: "FleetLedger",
        nodes: buildSampleNodes(),
        isRunning: true,
        isPaused: false,
        hasPartialReport: true,
        onTogglePause: noop,
        onSkipToReport: noop,
      })
    );

    expect(html).toContain('<h1 class="orch-title">FleetLedger</h1>');
    expect(html).toContain('<h2 class="agent-name">Framer Agent</h2>');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="17"');
    expect(html).toContain('<div class="orch-status-badge" aria-live="polite">');
  });

  test("ReportWorkspace renders 5 accessible tabs and active panel for full report", () => {
    const html = renderToStaticMarkup(
      React.createElement(ReportWorkspace, {
        report: DEMO_PRESETS[0],
        partial: {},
        isRunning: false,
        onOpenCopilot: noop,
        onRerunLive: noop,
        onShowToast: noop,
      })
    );

    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(5);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(DEMO_PRESETS[0].framer.startupTitle);
  });

  test("Navbar, ErrorBoundary, and NotFound expose valid landmarks and navigation actions", () => {
    const navHtml = renderToStaticMarkup(
      React.createElement(Navbar, {
        quota: null,
        historyCount: 2,
        theme: "light",
        viewMode: "hero",
        onToggleTheme: noop,
        onOpenHistory: noop,
        onResetToHero: noop,
      })
    );
    expect(navHtml).toContain("<header");
    expect(navHtml).toContain("Saved (2)");

    const errorHtml = renderToStaticMarkup(
      React.createElement(ErrorBoundary, {
        error: new Error("Synthetic boundary test"),
        reset: noop,
      })
    );
    expect(errorHtml).toContain('<main id="main-content"');
    expect(errorHtml).toContain('role="alert"');

    const notFoundHtml = renderToStaticMarkup(React.createElement(NotFound));
    expect(notFoundHtml).toContain('<main id="main-content"');
    expect(notFoundHtml).toContain("Page Not Found");
  });
});
