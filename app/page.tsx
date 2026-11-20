"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import type { AgentNodeState } from "@/components/AgentMissionControl";
import { LandingPage } from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import type { PartialReportData } from "@/components/ReportWorkspace";

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
import type {
  AgentNodeId,
  AgentSSEEvent,
  AnalysisInput,
  CompetitorOutput,
  CustomerOutput,
  FramerOutput,
  MarketOutput,
  PlannerOutput,
  StartupReport,
  UsageQuotaInfo,
  ValidatorOutput,
} from "@/lib/types";

const STORAGE_KEY = "sparkproof_reports_v1";
const THEME_KEY = "sparkproof_theme_v1";

type ViewMode = "hero" | "validating" | "report";

function createInitialNodes(): Record<AgentNodeId, AgentNodeState> {
  return {
    framer: {
      id: "framer",
      label: "Idea Framer",
      role: "Stage 1",
      status: "pending",
      message: "Waiting...",
      queries: [],
      sources: [],
    },
    market: {
      id: "market",
      label: "Market Analyst",
      role: "Stage 2",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    competitors: {
      id: "competitors",
      label: "Competitor Intel",
      role: "Stage 2",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    customers: {
      id: "customers",
      label: "Customer Profiler",
      role: "Stage 2",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    validator: {
      id: "validator",
      label: "Devil's Advocate",
      role: "Stage 2",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
    planner: {
      id: "planner",
      label: "Execution Planner",
      role: "Stage 3",
      status: "pending",
      message: "Queued",
      queries: [],
      sources: [],
    },
  };
}

function ensureUserCookie() {
  if (typeof document === "undefined") return;
  if (!document.cookie.includes("sparkproof_uid=")) {
    const uid = `sp_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    document.cookie = `sparkproof_uid=${uid}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewMode, setViewMode] = useState<ViewMode>("hero");
  const [quota, setQuota] = useState<UsageQuotaInfo | null>(null);
  const [history, setHistory] = useState<StartupReport[]>([]);
  const [activeReport, setActiveReport] = useState<StartupReport | null>(null);
  const [partial, setPartial] = useState<PartialReportData>({});
  const [nodes, setNodes] = useState<Record<AgentNodeId, AgentNodeState>>(
    createInitialNodes
  );
  const [runningIdeaText, setRunningIdeaText] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPausedRef = useRef(false);
  const queuedEventsRef = useRef<AgentSSEEvent[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  useEffect(() => {
    ensureUserCookie();

    queueMicrotask(() => {
      try {
        const activeTheme = document.documentElement.getAttribute("data-theme") as
          | "light"
          | "dark"
          | null;
        if (activeTheme === "dark" || activeTheme === "light") {
          setTheme(activeTheme);
        } else {
          const savedTheme = localStorage.getItem(THEME_KEY);
          if (savedTheme === "dark" || savedTheme === "light") {
            setTheme(savedTheme);
            document.documentElement.setAttribute("data-theme", savedTheme);
          } else if (
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            setTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
          }
        }
      } catch {
        // Ignore storage errors
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as StartupReport[];
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch {
        // Ignore corrupt localStorage
      }
    });

    fetch("/api/analyze")
      .then((r) => r.json())
      .then((data: { quota?: UsageQuotaInfo }) => {
        if (data.quota) setQuota(data.quota);
      })
      .catch(() => {});

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleToggleTheme = () => {
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark"
        | null) || theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Ignore storage errors
    }
  };

  const persistReport = useCallback((report: StartupReport) => {
    setHistory((prev) => {
      const next = [report, ...prev.filter((r) => r.id !== report.id)].slice(
        0,
        15
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota full
      }
      return next;
    });
  }, []);

  const handleDeleteReport = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
    if (activeReport?.id === id) {
      setActiveReport(null);
      setPartial({});
      setViewMode("hero");
    }
    showToast("Saved dossier deleted");
  };

  const handleLoadPreset = (preset: StartupReport) => {
    if (isRunning) {
      abortControllerRef.current?.abort();
      setIsRunning(false);
    }
    setErrorMessage(null);
    setRunningIdeaText(null);
    setPartial({});
    setActiveReport(preset);
    setViewMode("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applySseEvent = useCallback(
    (ev: AgentSSEEvent) => {
      if (ev.type === "quota") {
        setQuota(ev.quota);
      } else if (ev.type === "stage") {
        setNodes((prev) => ({
          ...prev,
          [ev.agent]: {
            ...prev[ev.agent],
            status: ev.status,
            message: ev.message,
            queries: ev.queries ?? prev[ev.agent].queries,
            sources: ev.sources ?? prev[ev.agent].sources,
            provider: ev.provider ?? prev[ev.agent].provider,
          },
        }));
      } else if (ev.type === "partial") {
        setPartial((prev) => ({
          ...prev,
          [ev.section]:
            ev.section === "framer"
              ? (ev.data as FramerOutput)
              : ev.section === "market"
                ? (ev.data as MarketOutput)
                : ev.section === "competitors"
                  ? (ev.data as CompetitorOutput)
                  : ev.section === "customers"
                    ? (ev.data as CustomerOutput)
                    : ev.section === "validator"
                      ? (ev.data as ValidatorOutput)
                      : (ev.data as PlannerOutput),
        }));
      } else if (ev.type === "complete") {
        setQuota(ev.quota);
        setActiveReport(ev.report);
        persistReport(ev.report);
        setViewMode("report");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (ev.type === "error") {
        if (ev.quota) setQuota(ev.quota);
        setErrorMessage(ev.message);
      }
    },
    [persistReport]
  );

  const handleTogglePause = () => {
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);

    if (!nextPaused && queuedEventsRef.current.length > 0) {
      const buffered = queuedEventsRef.current.splice(0);
      for (const ev of buffered) {
        applySseEvent(ev);
      }
    }
  };

  const runLiveAnalysis = async (input: AnalysisInput) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    ensureUserCookie();
    setErrorMessage(null);
    setActiveReport(null);
    setPartial({});
    setNodes(createInitialNodes());
    setRunningIdeaText(input.idea);
    setIsPaused(false);
    isPausedRef.current = false;
    queuedEventsRef.current = [];
    setIsRunning(true);
    setViewMode("validating");
    window.scrollTo({ top: 0, behavior: "smooth" });

    let receivedAnyPartial = false;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
          quota?: UsageQuotaInfo;
        };
        if (errBody.quota) setQuota(errBody.quota);
        setErrorMessage(
          errBody.error || `Request failed (${res.status}). Please try again.`
        );
        setRunningIdeaText(null);
        setIsRunning(false);
        setViewMode("hero");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const line = chunk
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!line) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as AgentSSEEvent;
            if (parsed.type === "partial" || parsed.type === "complete") {
              receivedAnyPartial = true;
            }
            if (isPausedRef.current) {
              queuedEventsRef.current.push(parsed);
            } else {
              applySseEvent(parsed);
            }
          } catch {
            // Ignore partial/malformed SSE chunk
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Network error while streaming agent updates."
      );
      if (!receivedAnyPartial) {
        setViewMode("hero");
      }
    } finally {
      if (queuedEventsRef.current.length > 0) {
        const remaining = queuedEventsRef.current.splice(0);
        for (const ev of remaining) {
          applySseEvent(ev);
        }
      }
      isPausedRef.current = false;
      setIsPaused(false);
      setIsRunning(false);
    }
  };

  const handleResetToHero = () => {
    abortControllerRef.current?.abort();
    isPausedRef.current = false;
    queuedEventsRef.current = [];
    setIsPaused(false);
    setIsRunning(false);
    setActiveReport(null);
    setPartial({});
    setRunningIdeaText(null);
    setErrorMessage(null);
    setViewMode("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasPartialReport = Boolean(
    activeReport ||
      partial.framer ||
      partial.market ||
      partial.competitors ||
      partial.customers ||
      partial.validator ||
      partial.planner
  );

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

      <main className={viewMode === "hero" ? "spark-main lp-main" : "spark-main"}>
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
              if (isPausedRef.current) handleTogglePause();
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
          if (isRunning) {
            abortControllerRef.current?.abort();
            setIsRunning(false);
          }
          setRunningIdeaText(null);
          setPartial({});
          setErrorMessage(null);
          setActiveReport(rep);
          setViewMode("report");
          window.scrollTo({ top: 0, behavior: "smooth" });
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
