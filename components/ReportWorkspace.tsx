"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { scrollElementIntoView } from "@/lib/scroll";
import type {
  CompetitorOutput,
  CustomerOutput,
  FramerOutput,
  MarketOutput,
  PlannerOutput,
  StartupReport,
  ValidatorOutput,
} from "@/lib/types";
import { reportToMarkdown } from "@/lib/export";
import { OverviewTab } from "./report/OverviewTab";
import { MarketTab } from "./report/MarketTab";
import { CompetitorsTab } from "./report/CompetitorsTab";
import { CustomersTab } from "./report/CustomersTab";
import { RoadmapTab } from "./report/RoadmapTab";
import { ReportHeader } from "./report/ReportHeader";

export interface PartialReportData {
  framer?: FramerOutput;
  market?: MarketOutput;
  competitors?: CompetitorOutput;
  customers?: CustomerOutput;
  validator?: ValidatorOutput;
  planner?: PlannerOutput;
}

interface ReportWorkspaceProps {
  report: StartupReport | null;
  partial: PartialReportData;
  isRunning: boolean;
  onOpenCopilot: () => void;
  onRerunLive: () => void;
  onBackToProgress?: () => void;
  onShowToast: (msg: string) => void;
}

const TABS = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "market", num: "02", label: "Market" },
  { id: "competitors", num: "03", label: "Competitors" },
  { id: "customers", num: "04", label: "Customers" },
  { id: "planner", num: "05", label: "Plan" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * ReportWorkspace provides the interactive 5-tab startup validation dossier.
 *
 * @param props - ReportWorkspaceProps including live report and action callbacks.
 * @returns Fully rendered tabbed workspace conforming to WAI-ARIA tablist semantics.
 */
export function ReportWorkspace({
  report,
  partial,
  isRunning,
  onOpenCopilot,
  onRerunLive,
  onBackToProgress,
  onShowToast,
}: ReportWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showAllSections, setShowAllSections] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (showAllSections) return;
    const idx = TABS.findIndex((t) => t.id === activeTab);
    if (idx !== -1 && tabRefs.current[idx]) {
      scrollElementIntoView(tabRefs.current[idx], {
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab, showAllSections]);

  const framer = report?.framer ?? partial.framer;
  const market = report?.market ?? partial.market;
  const competitors = report?.competitors ?? partial.competitors;
  const customers = report?.customers ?? partial.customers;
  const validator = report?.validator ?? partial.validator;
  const planner = report?.planner ?? partial.planner;

  if (!framer && !isRunning) return null;

  const isTabReady = (id: TabId) => {
    switch (id) {
      case "overview":
        return Boolean(validator);
      case "market":
        return Boolean(market);
      case "competitors":
        return Boolean(competitors);
      case "customers":
        return Boolean(customers);
      case "planner":
        return Boolean(planner);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft")
      nextIdx = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = TABS.length - 1;
    else return;

    e.preventDefault();
    setShowAllSections(false);
    setActiveTab(TABS[nextIdx].id);
    const btn = tabRefs.current[nextIdx];
    btn?.focus();
    scrollElementIntoView(btn, { block: "nearest", inline: "nearest" });
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const md = reportToMarkdown(report);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const slug =
      report.framer.startupTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "report";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-saasproof.md`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onShowToast("Exported Markdown validation report");
  };

  const isSectionVisible = (id: TabId) => showAllSections || activeTab === id;

  return (
    <section className="view-enter report-workspace">
      <ReportHeader
        report={report}
        framer={framer}
        isRunning={isRunning}
        onRerunLive={onRerunLive}
        onBackToProgress={onBackToProgress}
        onOpenCopilot={onOpenCopilot}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      {/* Sticky Section Tabs + Show All Toggle */}
      <div className="report-nav-bar no-print">
        <div
          className="section-tabs"
          role="tablist"
          aria-label="Startup validation sections"
        >
          {TABS.map((tab, idx) => {
            const selected = !showAllSections && activeTab === tab.id;
            const ready = isTabReady(tab.id);
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={selected}
                tabIndex={selected || showAllSections ? 0 : -1}
                onClick={() => {
                  setShowAllSections(false);
                  setActiveTab(tab.id);
                }}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className="sec-tab"
              >
                <span className="tab-num">{tab.num}</span>
                <span>{tab.label}</span>
                {!ready && (
                  <>
                    <span
                      className="spinner-ring"
                      style={{ width: "9px", height: "9px" }}
                      aria-hidden="true"
                    />
                    <span className="sr-only">Loading {tab.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="expand-all-btn"
          aria-pressed={showAllSections}
          onClick={() => setShowAllSections((v) => !v)}
        >
          {showAllSections ? "Tabs" : "Show All"}
        </button>

        <button
          type="button"
          className="nav-copilot-pill no-print"
          onClick={onOpenCopilot}
          title="Open Co-Pilot"
        >
          <MessageSquareText
            className="h-3.5 w-3.5"
            style={{ color: "var(--orange-700)" }}
            aria-hidden="true"
          />
          <span>Co-Pilot</span>
        </button>
      </div>

      {/* Modular Section Panels */}
      <OverviewTab
        validator={validator}
        visible={isSectionVisible("overview")}
      />

      <MarketTab market={market} visible={isSectionVisible("market")} />

      <CompetitorsTab
        competitors={competitors}
        visible={isSectionVisible("competitors")}
      />

      <CustomersTab
        customers={customers}
        visible={isSectionVisible("customers")}
        onShowToast={onShowToast}
      />

      <RoadmapTab planner={planner} visible={isSectionVisible("planner")} />

      {/* Floating Co-Pilot Pill while reading Report */}
      {report && (
        <button
          type="button"
          className="floating-copilot-fab no-print"
          onClick={onOpenCopilot}
        >
          <MessageSquareText
            className="h-4 w-4"
            style={{ color: "var(--orange-700)" }}
            aria-hidden="true"
          />
          <span>Ask Co-Pilot</span>
        </button>
      )}
    </section>
  );
}
