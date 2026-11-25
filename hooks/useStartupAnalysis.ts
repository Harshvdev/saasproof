"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { scrollToTop } from "@/lib/scroll";
import {
  readStorageString,
  readStorageValidatedList,
  writeStorageString,
} from "@/lib/storage";
import {
  StartupReportSchema,
  UsageQuotaInfoSchema,
  type AnalysisInput,
  type StartupReport,
  type UsageQuotaInfo,
} from "@/lib/types";
import { useAgentStream } from "./useAgentStream";

const STORAGE_KEY = "saasproof_reports_v1";
const THEME_KEY = "saasproof_theme_v1";

export type ViewMode = "hero" | "validating" | "report";

const AnalyzeStatusSchema = z.object({
  quota: UsageQuotaInfoSchema.optional(),
});

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
  const [reportSessionKey, setReportSessionKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeReportRef = useRef<StartupReport | null>(null);

  useEffect(() => {
    activeReportRef.current = activeReport;
  }, [activeReport]);

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
      writeStorageString(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleAnalysisComplete = useCallback(
    (report: StartupReport) => {
      setActiveReport(report);
      persistReport(report);
      setViewMode("report");
      scrollToTop();
    },
    [persistReport]
  );

  const handleStreamError = useCallback((msg: string) => {
    setErrorMessage(msg);
    if (!activeReportRef.current) {
      setViewMode("hero");
    }
  }, []);

  const stream = useAgentStream({
    onQuotaUpdate: setQuota,
    onAnalysisComplete: handleAnalysisComplete,
    onError: handleStreamError,
  });

  const { abortStream } = stream;

  useEffect(() => {
    const quotaController = new AbortController();

    queueMicrotask(() => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") {
        setTheme(attr);
      } else {
        const savedTheme = readStorageString(THEME_KEY);
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

      const savedHistory = readStorageValidatedList(
        STORAGE_KEY,
        StartupReportSchema
      );
      if (savedHistory.length > 0) {
        setHistory(savedHistory);
      }
    });

    fetch("/api/analyze", { signal: quotaController.signal })
      .then((r) => r.json())
      .then((raw: unknown) => {
        const parsed = AnalyzeStatusSchema.safeParse(raw);
        if (parsed.success && parsed.data.quota) {
          setQuota(parsed.data.quota);
        }
      })
      .catch(() => undefined);

    return () => {
      quotaController.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      abortStream();
    };
  }, [abortStream]);

  const handleToggleTheme = useCallback(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    const currentTheme = attr === "dark" || attr === "light" ? attr : theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    writeStorageString(THEME_KEY, nextTheme);
  }, [theme]);

  const handleDeleteReport = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const next = prev.filter((r) => r.id !== id);
        writeStorageString(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      if (activeReportRef.current?.id === id) {
        setActiveReport(null);
        stream.setPartial({});
        setReportSessionKey((k) => k + 1);
        setViewMode("hero");
      }
      showToast("Saved dossier deleted");
    },
    [showToast, stream]
  );

  const handleLoadPreset = useCallback(
    (preset: StartupReport) => {
      if (stream.isRunning) {
        stream.abortStream();
      }
      setErrorMessage(null);
      stream.setRunningIdeaText(null);
      stream.setPartial({});
      setActiveReport(preset);
      setReportSessionKey((k) => k + 1);
      setViewMode("report");
      scrollToTop();
    },
    [stream]
  );

  const handleStartAnalysis = useCallback(
    (input: AnalysisInput) => {
      setErrorMessage(null);
      setActiveReport(null);
      setReportSessionKey((k) => k + 1);
      setViewMode("validating");
      scrollToTop();
      stream.runLiveAnalysis(input);
    },
    [stream]
  );

  const handleResetToHero = useCallback(() => {
    stream.abortStream();
    setActiveReport(null);
    stream.setPartial({});
    stream.setRunningIdeaText(null);
    setErrorMessage(null);
    setReportSessionKey((k) => k + 1);
    setViewMode("hero");
    scrollToTop();
  }, [stream]);

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
    reportSessionKey,
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
