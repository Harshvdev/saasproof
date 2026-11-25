import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

function readRepoFile(relPath: string): string {
  return readFileSync(resolve(__dirname, "../..", relPath), "utf-8");
}

describe("Accessibility Suite: WAI-ARIA Semantics & Structure Contracts", () => {
  const drawerCode = readRepoFile("components/ui/DrawerDialog.tsx");
  const historyCode = readRepoFile("components/HistoryDrawer.tsx");
  const copilotCode = readRepoFile("components/CopilotDrawer.tsx");
  const copilotListCode = readRepoFile("components/copilot/CopilotMessageList.tsx");
  const workspaceCode = readRepoFile("components/ReportWorkspace.tsx");
  const composerCode = readRepoFile("components/landing/IdeaComposerForm.tsx");
  const sensitivityCode = readRepoFile("components/report/SensitivityCalculator.tsx");
  const sensitivityGridCode = readRepoFile("components/report/SensitivityMetricsGrid.tsx");
  const competitorsCode = readRepoFile("components/report/CompetitorsTab.tsx");
  const missionCode = readRepoFile("components/AgentMissionControl.tsx");
  const layoutCode = readRepoFile("app/layout.tsx");
  const pageCode = readRepoFile("app/page.tsx");
  const errorCode = readRepoFile("app/error.tsx");
  const globalErrorCode = readRepoFile("app/global-error.tsx");
  const notFoundCode = readRepoFile("app/not-found.tsx");

  test("root layout provides valid document language and skip-to-content link", () => {
    expect(layoutCode).toContain('lang="en"');
    expect(layoutCode).toContain("suppressHydrationWarning");
    expect(layoutCode).toContain('href="#main-content"');
    expect(layoutCode).toContain('className="skip-to-content"');
    expect(layoutCode).toContain("Skip to content");
  });

  test("all primary and error routes expose the #main-content landmark", () => {
    for (const code of [pageCode, errorCode, globalErrorCode, notFoundCode]) {
      expect(code).toContain("<main");
      expect(code).toContain('id="main-content"');
      expect(code).toContain("tabIndex={-1}");
    }
    expect(pageCode).toContain("<footer");
  });

  test("DrawerDialog, HistoryDrawer, and CopilotDrawer use native modal <dialog> with aria-labelledby", () => {
    expect(drawerCode).toContain("<dialog");
    expect(drawerCode).toContain("dialog.showModal()");
    expect(drawerCode).toContain("aria-labelledby={labelledBy}");

    expect(historyCode).toContain('labelledBy="history-drawer-title"');
    expect(historyCode).toContain('<h2 className="drawer-title" id="history-drawer-title">');

    expect(copilotCode).toContain('labelledBy="copilot-drawer-title"');
    expect(copilotCode).toContain('<h2 className="drawer-title" id="copilot-drawer-title">');
    expect(copilotListCode).toContain('role="log"');
    expect(copilotListCode).toContain('aria-live="polite"');
  });

  test("ReportWorkspace conforms to WAI-ARIA tablist pattern and toggle button semantics", () => {
    expect(workspaceCode).toContain('role="tablist"');
    expect(workspaceCode).toContain('role="tab"');
    expect(workspaceCode).toContain("aria-controls={`panel-${tab.id}`}");
    expect(workspaceCode).toContain("aria-selected={selected}");
    expect(workspaceCode).toContain("aria-pressed={showAllSections}");
  });

  test("IdeaComposerForm binds switch, labels, and error descriptions via ARIA attributes", () => {
    expect(composerCode).toContain('id="lp-deep-scrape-switch"');
    expect(composerCode).toContain('htmlFor="lp-deep-scrape-switch"');
    expect(composerCode).toContain('role="switch"');
    expect(composerCode).toContain("aria-checked={enableDeepScrape}");
    expect(composerCode).toContain("aria-describedby={describedByIds}");
  });

  test("SensitivityCalculator conforms to accessible range slider contracts with valuetext", () => {
    expect(sensitivityCode).toContain("<SensitivityMetricsGrid");
    expect(sensitivityGridCode).toContain('type="range"');
    expect(sensitivityGridCode).toContain("aria-valuemin=");
    expect(sensitivityGridCode).toContain("aria-valuemax=");
    expect(sensitivityGridCode).toContain("aria-valuenow=");
    expect(sensitivityGridCode).toContain("aria-valuetext=");
  });

  test("AgentMissionControl and CompetitorsTab maintain valid WCAG heading hierarchy", () => {
    expect(missionCode).toContain('<h1 className="orch-title">');
    expect(missionCode).toContain('<h2 className="agent-name">');
    expect(missionCode).toContain('role="progressbar"');

    expect(competitorsCode).toContain("<h2");
    expect(competitorsCode).toContain("<h3");
    expect(competitorsCode).toContain("<h4");
    expect(competitorsCode).not.toContain("<h5");
  });
});
