"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentNodeState } from "@/components/AgentMissionControl";
import type { PartialReportData } from "@/components/ReportWorkspace";
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

export function createInitialNodes(): Record<AgentNodeId, AgentNodeState> {
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

interface UseAgentStreamProps {
  onQuotaUpdate: (quota: UsageQuotaInfo) => void;
  onAnalysisComplete: (report: StartupReport) => void;
  onError: (message: string) => void;
}

/**
 * useAgentStream manages Server-Sent Events (SSE) streaming connections,
 * agent node statuses, partial result decoding, and pause/resume buffering.
 *
 * @param props - Callback handlers for quota updates, completion, and errors.
 * @returns Streaming state and pipeline execution controls.
 */
export function useAgentStream({
  onQuotaUpdate,
  onAnalysisComplete,
  onError,
}: UseAgentStreamProps) {
  const [nodes, setNodes] = useState<Record<AgentNodeId, AgentNodeState>>(
    createInitialNodes
  );
  const [partial, setPartial] = useState<PartialReportData>({});
  const [runningIdeaText, setRunningIdeaText] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(false);
  const queuedEventsRef = useRef<AgentSSEEvent[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const applySseEvent = useCallback(
    (ev: AgentSSEEvent) => {
      if (ev.type === "quota") {
        onQuotaUpdate(ev.quota);
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
        onQuotaUpdate(ev.quota);
        onAnalysisComplete(ev.report);
      } else if (ev.type === "error") {
        if (ev.quota) onQuotaUpdate(ev.quota);
        onError(ev.message);
      }
    },
    [onQuotaUpdate, onAnalysisComplete, onError]
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

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    isPausedRef.current = false;
    queuedEventsRef.current = [];
    setIsPaused(false);
    setIsRunning(false);
  }, []);

  const runLiveAnalysis = async (input: AnalysisInput) => {
    abortStream();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPartial({});
    setNodes(createInitialNodes());
    setRunningIdeaText(input.idea);
    setIsPaused(false);
    isPausedRef.current = false;
    queuedEventsRef.current = [];
    setIsRunning(true);

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
        if (errBody.quota) onQuotaUpdate(errBody.quota);
        onError(
          errBody.error || `Request failed (${res.status}). Please try again.`
        );
        setRunningIdeaText(null);
        setIsRunning(false);
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
      onError(
        err instanceof Error
          ? err.message
          : "Network error while streaming agent updates."
      );
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

  return {
    nodes,
    partial,
    runningIdeaText,
    isRunning,
    isPaused,
    setPartial,
    setRunningIdeaText,
    setIsRunning,
    runLiveAnalysis,
    handleTogglePause,
    abortStream,
  };
}
