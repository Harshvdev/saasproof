"use client";

import React, { useEffect, useState } from "react";
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
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const start = Date.now();
    const timer = setInterval(() => {
      if (!isPaused) {
        setElapsedMs(Date.now() - start);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [isRunning, isPaused]);

  const completedCount = ORDERED_AGENTS.filter(
    (id) => nodes[id].status === "done" || nodes[id].status === "fallback"
  ).length;

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
    <section className="view-enter" aria-live="polite">
      <div className="orchestrator-header">
        <div className="orch-top-row">
          <div>
            <div className="orch-status-badge">
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
            <h2 className="orch-title">
              {startupTitle || "Validating Startup"}
            </h2>
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
        <div className="orch-track">
          <div className="orch-fill" style={{ width: `${progressPct}%` }} />
        </div>
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
                    <h3 className="agent-name">{node.label}</h3>
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
                  {node.queries.slice(0, 3).map((q) => (
                    <span key={q} className="query-chip">
                      <Search className="h-3 w-3" aria-hidden="true" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              )}

              {node.sources.length > 0 && (
                <div className="source-chips">
                  {node.sources.slice(0, 4).map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link-chip"
                    >
                      <span>{src.domain}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
