import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Accessibility Suite: WAI-ARIA Semantics & Structure Contracts", () => {
  const historyDrawerPath = resolve(__dirname, "../../components/HistoryDrawer.tsx");
  const copilotDrawerPath = resolve(__dirname, "../../components/CopilotDrawer.tsx");
  const reportWorkspacePath = resolve(__dirname, "../../components/ReportWorkspace.tsx");
  const layoutPath = resolve(__dirname, "../../app/layout.tsx");

  const historyCode = readFileSync(historyDrawerPath, "utf-8");
  const copilotCode = readFileSync(copilotDrawerPath, "utf-8");
  const workspaceCode = readFileSync(reportWorkspacePath, "utf-8");
  const layoutCode = readFileSync(layoutPath, "utf-8");

  test("root layout provides valid document language and hydration structure", () => {
    expect(layoutCode).toContain('lang="en"');
    expect(layoutCode).toContain("suppressHydrationWarning");
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
});
