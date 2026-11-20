import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Accessibility Suite: WAI-ARIA Semantics & Structure Contracts", () => {
  const historyDrawerPath = resolve(__dirname, "../../components/HistoryDrawer.tsx");
  const copilotDrawerPath = resolve(__dirname, "../../components/CopilotDrawer.tsx");
  const reportWorkspacePath = resolve(__dirname, "../../components/ReportWorkspace.tsx");
  const landingPagePath = resolve(__dirname, "../../components/LandingPage.tsx");
  const sensitivityPath = resolve(__dirname, "../../components/report/SensitivityCalculator.tsx");
  const competitorsPath = resolve(__dirname, "../../components/report/CompetitorsTab.tsx");
  const layoutPath = resolve(__dirname, "../../app/layout.tsx");

  const historyCode = readFileSync(historyDrawerPath, "utf-8");
  const copilotCode = readFileSync(copilotDrawerPath, "utf-8");
  const workspaceCode = readFileSync(reportWorkspacePath, "utf-8");
  const landingCode = readFileSync(landingPagePath, "utf-8");
  const sensitivityCode = readFileSync(sensitivityPath, "utf-8");
  const competitorsCode = readFileSync(competitorsPath, "utf-8");
  const layoutCode = readFileSync(layoutPath, "utf-8");

  test("root layout provides valid document language and hydration structure", () => {
    expect(layoutCode).toContain('lang="en"');
    expect(layoutCode).toContain("suppressHydrationWarning");
  });

  test("root layout provides an accessible skip-to-content link targeting main content", () => {
    expect(layoutCode).toContain('href="#main-content"');
    expect(layoutCode).toContain('className="skip-to-content"');
    expect(layoutCode).toContain("Skip to content");
  });

  test("HistoryDrawer conforms to WAI-ARIA dialog semantics with title label", () => {
    expect(historyCode).toContain('role="dialog"');
    expect(historyCode).toContain('aria-modal="true"');
    expect(historyCode).toContain('aria-labelledby="history-drawer-title"');
    expect(historyCode).toContain('id="history-drawer-title"');
  });

  test("CopilotDrawer conforms to WAI-ARIA dialog semantics with title label", () => {
    expect(copilotCode).toContain('role="dialog"');
    expect(copilotCode).toContain('aria-modal="true"');
    expect(copilotCode).toContain('aria-labelledby="copilot-drawer-title"');
    expect(copilotCode).toContain('id="copilot-drawer-title"');
  });

  test("ReportWorkspace conforms to WAI-ARIA tablist pattern with aria-controls", () => {
    expect(workspaceCode).toContain('role="tablist"');
    expect(workspaceCode).toContain('role="tab"');
    expect(workspaceCode).toContain("aria-controls={`panel-${tab.id}`}");
    expect(workspaceCode).toContain("aria-selected={selected}");
  });

  test("LandingPage links deep scrape toggle button to label via htmlFor", () => {
    expect(landingCode).toContain('id="lp-deep-scrape-switch"');
    expect(landingCode).toContain('htmlFor="lp-deep-scrape-switch"');
    expect(landingCode).toContain('role="switch"');
    expect(landingCode).toContain("aria-checked={enableDeepScrape}");
  });

  test("SensitivityCalculator conforms to accessible range slider contracts", () => {
    expect(sensitivityCode).toContain('type="range"');
    expect(sensitivityCode).toContain("aria-valuemin=");
    expect(sensitivityCode).toContain("aria-valuemax=");
    expect(sensitivityCode).toContain("aria-valuenow=");
  });

  test("CompetitorsTab maintains valid WCAG heading hierarchy without skipping levels", () => {
    expect(competitorsCode).toContain("<h3");
    expect(competitorsCode).toContain("<h4");
    // Verify no skipped h5 headings
    expect(competitorsCode).not.toContain("<h5");
  });
});
