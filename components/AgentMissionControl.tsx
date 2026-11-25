"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Compass,
  ExternalLink,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import type { AgentNodeId, SourceCitation } from "@/lib/types";
import { sanitizeSafeUrl } from "@/lib/url";

export interface AgentNodeState {
  id: AgentNodeId;
  label: string;
  role: string;
  status: "pending" | "running" | "done" | "fallback";
  message: string;
  queries: string[];
  sources: SourceCitation[];
  provider?: string;
}

interface AgentMissionControlProps {
  ideaText: string;
  startupTitle?: string;
  nodes: Record<AgentNodeId, AgentNodeState>;
  isRunning: boolean;
  isPaused: boolean;
  hasPartialReport: boolean;
  onTogglePause: () => void;
  onSkipToReport: () => void;
}

const ORDERED_AGENTS: AgentNodeId[] = [
  "framer",
  "market",
  "competitors",
  "customers",
  "validator",
  "planner",
];

const NODE_ICONS: Record<AgentNodeId, React.ElementType> = {
  framer: Sparkles,
  market: Compass,
  competitors: Radar,
  customers: Users,
  validator: ShieldAlert,
  planner: CalendarCheck,
};

function MissionProgressFooter({
  isRunning,
  isPaused,
  completedCount,
}: {
  isRunning: boolean;
  isPaused: boolean;
  completedCount: number;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const accumulatedRef = useRef(0);
  const segmentStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      segmentStartRef.current = null;
      return;
    }

    if (isPaused) {
      if (segmentStartRef.current !== null) {
        accumulatedRef.current += Date.now() - segmentStartRef.current;
        segmentStartRef.current = null;
      }
      return;
    }

    segmentStartRef.current = Date.now();
    const timer = setInterval(() => {
      if (segmentStartRef.current !== null) {
        setElapsedMs(
          accumulatedRef.current + (Date.now() - segmentStartRef.current)
        );
      }
    }, 250);

    return () => {
      clearInterval(timer);
      if (segmentStartRef.current !== null) {
        accumulatedRef.current += Date.now() - segmentStartRef.current;
        segmentStartRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  // Expected live run target: ~68 seconds for deep multi-agent web retrieval
  const estSecondsRemaining = Math.max(
    3,
    Math.round(68 - elapsedMs / 1000)
  );
  const timeProgressPct = Math.min(94, Math.round((elapsedMs / 68000) * 100));
  const discreteProgressPct = Math.round((completedCount / 6) * 100);
  const progressPct = isRunning
    ? Math.max(discreteProgressPct, timeProgressPct)
    : 100;

  const stageLabel =
    completedCount === 0
      ? "Stage 1/3 · Framing & Search Queries"
      : completedCount < 5
        ? "Stage 2/3 · 4 Parallel Web Research Agents"
        : completedCount === 5
          ? "Stage 3/3 · 90-Day MVP & GTM Roadmap"
          : "Complete · All 6 Agents Done";

  const formattedTime = `${String(Math.floor(elapsedMs / 60000)).padStart(2, "0")}:${(
    (elapsedMs % 60000) /
    1000
  )
    .toFixed(1)
    .padStart(4, "0")}s`;

  return (
    <>
      <div className="orch-progress-meta">
        <span className="orch-stage-label">{stageLabel}</span>
        <div className="orch-timer-group">
          {isRunning && (
            <span className="orch-est-badge">
              <span className="orch-timer-label">ETA</span>
              <span className="mono">~{estSecondsRemaining}s left</span>
            </span>
          )}
          {isRunning && <span className="orch-divider" aria-hidden="true" />}
          <span className="orch-time-badge">
            <span className="orch-timer-label">Elapsed</span>
            <span className="mono orch-time-val">{formattedTime}</span>
          </span>
        </div>
      </div>
      <div
        className="orch-track"
        role="progressbar"
        aria-label="Validation pipeline progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
      >
        <div className="orch-fill" style={{ width: `${progressPct}%` }} />
      </div>
    </>
  );
}

/**
 * AgentMissionControl provides a live terminal visualization of the autonomous multi-agent pipeline.
 * Displays real-time status badges, live search queries, fetched sources, pause/resume controls,
 * and an isolated progress timer that preserves elapsed time across pauses.
 *
 * @param props - AgentMissionControlProps containing active nodes, streaming state, and pause controls.
 * @returns Fully rendered mission control progress interface.
 */
export function AgentMissionControl({
  ideaText,
  startupTitle,
  nodes,
  isRunning,
  isPaused,
  hasPartialReport,
  onTogglePause,
  onSkipToReport,
}: AgentMissionControlProps) {
  const completedCount = ORDERED_AGENTS.filter(
    (id) => nodes[id].status === "done" || nodes[id].status === "fallback"
  ).length;

  return (
    <section className="view-enter">
      <div className="orchestrator-header">
        <div className="orch-top-row">
          <div>
            <div className="orch-status-badge" aria-live="polite">
              {isRunning ? (
                <span className="spinner-ring" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {isRunning
                  ? isPaused
                    ? "PAUSED"
                    : "LIVE RESEARCH"
                  : "DONE"}
              </span>
            </div>
            <h1 className="orch-title">
              {startupTitle || "Validating Startup"}
            </h1>
            <p className="orch-idea-preview">{ideaText}</p>
          </div>

          <div className="orch-controls">
            {isRunning && (
              <button
                type="button"
                className="nav-btn"
                onClick={onTogglePause}
              >
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
            )}
            {hasPartialReport && (
              <button
                type="button"
                className="nav-btn nav-btn-primary"
                onClick={onSkipToReport}
                title="Early sections ready to read"
              >
                <span>View Live Report →</span>
              </button>
            )}
          </div>
        </div>

        <MissionProgressFooter
          isRunning={isRunning}
          isPaused={isPaused}
          completedCount={completedCount}
        />
      </div>

      <div className="agents-grid">
        {ORDERED_AGENTS.map((id) => {
          const node = nodes[id];
          const Icon = NODE_ICONS[id];
          const stateClass = `state-${node.status}`;

          return (
            <article key={id} className={`agent-card ${stateClass}`}>
              <div className="agent-head">
                <div className="agent-identity">
                  <div className="agent-icon">
                    {node.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : node.status === "fallback" ? (
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h2 className="agent-name">{node.label}</h2>
                    <p className="agent-model-provider">
                      {node.provider
                        ? `${node.role} · ${node.provider}`
                        : node.role}
                    </p>
                  </div>
                </div>

                <span className="agent-state-pill">
                  {node.status === "running" && (
                    <span className="spinner-ring" aria-hidden="true" />
                  )}
                  <span>
                    {node.status === "pending"
                      ? "QUEUED"
                      : node.status === "running"
                        ? "RUNNING"
                        : node.status === "fallback"
                          ? "FALLBACK"
                          : "DONE"}
                  </span>
                </span>
              </div>

              <div className="agent-live-msg">{node.message}</div>

              {node.queries.length > 0 && (
                <div className="query-chips">
                  {node.queries.slice(0, 3).map((q, idx) => (
                    <span key={`${id}-q-${idx}`} className="query-chip">
                      <Search className="h-3 w-3" aria-hidden="true" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              )}

              {node.sources.length > 0 && (
                <div className="source-chips">
                  {node.sources.slice(0, 4).map((src, idx) => {
                    const safeHref = sanitizeSafeUrl(src.url);
                    if (!safeHref) return null;
                    return (
                      <a
                        key={`${safeHref}-${idx}`}
                        href={safeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link-chip"
                      >
                        <span>{src.domain}</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
