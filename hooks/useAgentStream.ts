"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { AgentNodeState } from "@/components/AgentMissionControl";
import type { PartialReportData } from "@/components/ReportWorkspace";
import {
  AgentSSEEventSchema,
  UsageQuotaInfoSchema,
  type AgentNodeId,
  type AgentSSEEvent,
  type AnalysisInput,
  type StartupReport,
  type UsageQuotaInfo,
} from "@/lib/types";

const StreamErrorResponseSchema = z.object({
  error: z.string().optional(),
  quota: UsageQuotaInfoSchema.optional(),
});

/**
 * Generates the default initial node state mapping for all 6 autonomous agents.
 *
 * @returns Initial dictionary mapping each AgentNodeId to its pending state.
 */
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

function parseSseDataChunk(chunk: string): AgentSSEEvent | null {
  const dataLines = chunk
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) return null;

  try {
    const raw: unknown = JSON.parse(dataLines.join("\n"));
    const validated = AgentSSEEventSchema.safeParse(raw);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

interface UseAgentStreamProps {
  onQuotaUpdate: (quota: UsageQuotaInfo) => void;
  onAnalysisComplete: (report: StartupReport) => void;
  onError: (message: string) => void;
}

/**
 * useAgentStream manages Server-Sent Events (SSE) streaming connections,
 * agent node statuses, runtime-validated partial result decoding, and pause/resume buffering.
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
  const callbacksRef = useRef({ onQuotaUpdate, onAnalysisComplete, onError });

  useEffect(() => {
    callbacksRef.current = { onQuotaUpdate, onAnalysisComplete, onError };
  }, [onQuotaUpdate, onAnalysisComplete, onError]);

  const applySseEvent = useCallback((ev: AgentSSEEvent) => {
    const { onQuotaUpdate: notifyQuota, onAnalysisComplete: notifyComplete, onError: notifyError } =
      callbacksRef.current;

    if (ev.type === "quota") {
      notifyQuota(ev.quota);
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
        [ev.section]: ev.data,
      }));
    } else if (ev.type === "complete") {
      notifyQuota(ev.quota);
      notifyComplete(ev.report);
    } else if (ev.type === "error") {
      if (ev.quota) notifyQuota(ev.quota);
      notifyError(ev.message);
    }
  }, []);

  const handleTogglePause = useCallback(() => {
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);

    if (!nextPaused && queuedEventsRef.current.length > 0) {
      const buffered = queuedEventsRef.current.splice(0);
      for (const ev of buffered) {
        applySseEvent(ev);
      }
    }
  }, [applySseEvent]);

  const abortStream = useCallback(() => {
    const current = abortControllerRef.current;
    abortControllerRef.current = null;
    current?.abort();
    isPausedRef.current = false;
    queuedEventsRef.current = [];
    setIsPaused(false);
    setIsRunning(false);
  }, []);

  const runLiveAnalysis = useCallback(
    async (input: AnalysisInput) => {
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

      const dispatchEvent = (ev: AgentSSEEvent | null) => {
        if (!ev) return;
        if (isPausedRef.current) {
          queuedEventsRef.current.push(ev);
        } else {
          applySseEvent(ev);
        }
      };

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const rawErr: unknown = await res.json().catch(() => ({}));
          const parsedErr = StreamErrorResponseSchema.safeParse(rawErr);
          const errBody = parsedErr.success ? parsedErr.data : {};
          if (errBody.quota) callbacksRef.current.onQuotaUpdate(errBody.quota);
          callbacksRef.current.onError(
            errBody.error || `Request failed (${res.status}). Please try again.`
          );
          setRunningIdeaText(null);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split(/\r?\n\r?\n/);
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            dispatchEvent(parseSseDataChunk(chunk));
          }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
          dispatchEvent(parseSseDataChunk(buffer));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        callbacksRef.current.onError(
          err instanceof Error
            ? err.message
            : "Network error while streaming agent updates."
        );
      } finally {
        if (abortControllerRef.current === controller) {
          if (queuedEventsRef.current.length > 0) {
            const remaining = queuedEventsRef.current.splice(0);
            for (const ev of remaining) {
              applySseEvent(ev);
            }
          }
          abortControllerRef.current = null;
          isPausedRef.current = false;
          setIsPaused(false);
          setIsRunning(false);
        }
      }
    },
    [abortStream, applySseEvent]
  );

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
