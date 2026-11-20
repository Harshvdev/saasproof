"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  StartupReportSchema,
  type AnalysisInput,
  type StartupReport,
  type UsageQuotaInfo,
} from "@/lib/types";
import { useAgentStream } from "./useAgentStream";

const STORAGE_KEY = "saasproof_reports_v1";
const THEME_KEY = "saasproof_theme_v1";

export type ViewMode = "hero" | "validating" | "report";

function ensureUserCookie() {
  if (typeof document === "undefined") return;
  if (!document.cookie.includes("saasproof_uid=")) {
    const uid = `sp_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    document.cookie = `saasproof_uid=${uid}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

/**
 * useStartupAnalysis manages full application state, theme preferences,
 * report history persistence, and modal dialog visibility.
 *
 * @returns State properties and interactive action handlers for SaaSProof.
 */
export function useStartupAnalysis() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewMode, setViewMode] = useState<ViewMode>("hero");
  const [quota, setQuota] = useState<UsageQuotaInfo | null>(null);
  const [history, setHistory] = useState<StartupReport[]>([]);
  const [activeReport, setActiveReport] = useState<StartupReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

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

  const handleAnalysisComplete = useCallback(
    (report: StartupReport) => {
      setActiveReport(report);
      persistReport(report);
      setViewMode("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [persistReport]
  );

  const stream = useAgentStream({
    onQuotaUpdate: (q) => setQuota(q),
    onAnalysisComplete: handleAnalysisComplete,
    onError: (msg) => {
      setErrorMessage(msg);
      if (!activeReport) {
        setViewMode("hero");
      }
    },
  });

  const { abortStream } = stream;

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
          const raw = JSON.parse(saved);
          const parsed = z.array(StartupReportSchema).safeParse(raw);
          if (parsed.success) {
            setHistory(parsed.data);
          }
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
      abortStream();
    };
  }, [abortStream]);

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
      stream.setPartial({});
      setViewMode("hero");
    }
    showToast("Saved dossier deleted");
  };

  const handleLoadPreset = (preset: StartupReport) => {
    if (stream.isRunning) {
      stream.abortStream();
    }
    setErrorMessage(null);
    stream.setRunningIdeaText(null);
    stream.setPartial({});
    setActiveReport(preset);
    setViewMode("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartAnalysis = (input: AnalysisInput) => {
    setErrorMessage(null);
    setActiveReport(null);
    setViewMode("validating");
    window.scrollTo({ top: 0, behavior: "smooth" });
    stream.runLiveAnalysis(input);
  };

  const handleResetToHero = () => {
    stream.abortStream();
    setActiveReport(null);
    stream.setPartial({});
    stream.setRunningIdeaText(null);
    setErrorMessage(null);
    setViewMode("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasPartialReport = Boolean(
    activeReport ||
      stream.partial.framer ||
      stream.partial.market ||
      stream.partial.competitors ||
      stream.partial.customers ||
      stream.partial.validator ||
      stream.partial.planner
  );

  return {
    theme,
    viewMode,
    quota,
    history,
    activeReport,
    partial: stream.partial,
    nodes: stream.nodes,
    runningIdeaText: stream.runningIdeaText,
    isRunning: stream.isRunning,
    isPaused: stream.isPaused,
    errorMessage,
    historyOpen,
    copilotOpen,
    toastMessage,
    hasPartialReport,
    handleToggleTheme,
    handleTogglePause: stream.handleTogglePause,
    handleDeleteReport,
    handleLoadPreset,
    handleResetToHero,
    runLiveAnalysis: handleStartAnalysis,
    setHistoryOpen,
    setCopilotOpen,
    setQuota,
    setViewMode,
    showToast,
  };
}
