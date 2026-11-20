"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Compass, Send, X } from "lucide-react";
import type { StartupReport, UsageQuotaInfo } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  provider?: string;
  sources?: Array<{ title: string; url: string; domain: string }>;
}

interface CopilotDrawerProps {
  open: boolean;
  report: StartupReport | null;
  onClose: () => void;
  onQuotaUpdate: (quota: UsageQuotaInfo) => void;
}

const STARTERS = [
  {
    label: "14-Day Launch",
    prompt: "How do I launch the first version of this in 14 days on under a $1,500 budget?",
  },
  {
    label: "B2B Pivot",
    prompt: "What happens if I pivot this to a higher-ticket B2B model instead?",
  },
  {
    label: "Cold Outreach",
    prompt: "Write a high-converting cold DM or email to land my first 10 customers this week.",
  },
  {
    label: "Pricing Model",
    prompt: "How should I structure pricing so customers don't churn or bypass the platform?",
  },
];

export function CopilotDrawer({
  open,
  report,
  onClose,
  onQuotaUpdate,
}: CopilotDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputId = useId();
  const [question, setQuestion] = useState("");
  const [useLiveWeb, setUseLiveWeb] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const sendQuestion = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || !report || loading) return;

    const nextHistory = [...messages, { role: "user" as const, content: clean }];
    setMessages(nextHistory);
    setQuestion("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          useLiveWeb,
          report,
          history: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await res.json()) as {
        answer?: string;
        provider?: string;
        sources?: Array<{ title: string; url: string; domain: string }>;
        quota?: UsageQuotaInfo;
        error?: string;
      };

      if (data.quota) onQuotaUpdate(data.quota);

      if (!res.ok || !data.answer) {
        setError(data.error || "Unable to get a Co-Pilot reply right now.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer!,
          provider: data.provider,
          sources: data.sources,
        },
      ]);
    } catch {
      setError("Network error contacting Startup Co-Pilot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="spark-drawer copilot-drawer"
    >
      <div className="drawer-inner">
        <div className="drawer-header">
          <div>
            <div className="drawer-title" id="copilot-drawer-title">
              <Compass
                className="h-4 w-4"
                style={{ color: "var(--orange-500)" }}
                aria-hidden="true"
              />
              <span>Co-Pilot</span>
            </div>
            {report && (
              <div
                style={{
                  fontSize: "0.76rem",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {report.framer.startupTitle}
              </div>
            )}
          </div>

          <button
            type="button"
            className="close-drawer-btn"
            onClick={onClose}
            aria-label="Close Co-Pilot"
            autoFocus
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="copilot-starters">
          <div className="starter-chips">
            {STARTERS.map((s) => (
              <button
                key={s.label}
                type="button"
                className="starter-btn"
                onClick={() => sendQuestion(s.prompt)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-body">
          <div className="chat-stream">
            {messages.length === 0 && (
              <div className="chat-msg assistant">
                <div className="chat-bubble">
                  Ask me anything about{" "}
                  <strong>
                    {report?.framer.startupTitle || "this startup"}
                  </strong>
                  —test pricing changes, narrow your wedge, or draft your first
                  outreach messages.
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`chat-msg ${msg.role}`}>
                <div className="chat-bubble">{msg.content}</div>
                {msg.role === "assistant" && (
                  <div className="chat-meta-footer">
                    {msg.provider && (
                      <span className="model-tag">{msg.provider}</span>
                    )}
                    {msg.sources?.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link-chip"
                      >
                        <span>{src.domain}</span>
                        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <div
                  className="chat-bubble"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <span className="spinner-ring" aria-hidden="true" />
                  <span>Thinking through your pivot...</span>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--rose-bg)",
                  border: "1px solid var(--rose-border)",
                  color: "var(--rose-text)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <form
          className="copilot-footer"
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(question);
          }}
        >
          <div className="copilot-web-toggle-row">
            <button
              type="button"
              role="switch"
              aria-checked={useLiveWeb}
              className="web-search-toggle"
              onClick={() => setUseLiveWeb((v) => !v)}
            >
              <span
                className={`switch-track ${useLiveWeb ? "on" : ""}`}
                style={{ width: "30px", height: "17px" }}
              >
                <span
                  className="switch-thumb"
                  style={{
                    width: "13px",
                    height: "13px",
                    transform: useLiveWeb ? "translateX(13px)" : "translateX(0)",
                  }}
                />
              </span>
              <span>Live Web Search</span>
            </button>
          </div>

          <div className="copilot-input-row">
            <label htmlFor={inputId} className="sr-only">
              Ask a follow-up question
            </label>
            <input
              id={inputId}
              type="text"
              className="copilot-input"
              enterKeyHint="send"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
              }}
              placeholder="Ask a follow-up, stress-test pricing, or explore a pivot..."
            />
            <button
              type="submit"
              className="btn-send-copilot"
              disabled={loading || question.trim().length < 3}
              aria-label="Send inquiry to Co-Pilot"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
