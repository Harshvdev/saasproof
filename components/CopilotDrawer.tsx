"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Compass, Send, X } from "lucide-react";
import { z } from "zod";
import {
  SafeHttpUrlSchema,
  UsageQuotaInfoSchema,
  type StartupReport,
  type UsageQuotaInfo,
} from "@/lib/types";
import {
  CopilotMessageList,
  type CopilotChatMessage,
} from "./copilot/CopilotMessageList";
import { DrawerDialog } from "./ui/DrawerDialog";

const CopilotResponseSchema = z.object({
  answer: z.string().optional(),
  provider: z.string().optional(),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: SafeHttpUrlSchema,
        domain: z.string(),
      })
    )
    .optional(),
  quota: UsageQuotaInfoSchema.optional(),
  error: z.string().optional(),
});

interface CopilotDrawerProps {
  open: boolean;
  report: StartupReport | null;
  onClose: () => void;
  onQuotaUpdate: (quota: UsageQuotaInfo) => void;
}

const STARTERS = [
  {
    label: "14-Day Launch",
    prompt:
      "How do I launch the first version of this in 14 days on under a $1,500 budget?",
  },
  {
    label: "B2B Pivot",
    prompt:
      "What happens if I pivot this to a higher-ticket B2B model instead?",
  },
  {
    label: "Cold Outreach",
    prompt:
      "Write a high-converting cold DM or email to land my first 10 customers this week.",
  },
  {
    label: "Pricing Model",
    prompt:
      "How should I structure pricing so customers don't churn or bypass the platform?",
  },
];

/**
 * CopilotDrawer provides an interactive, context-aware AI advisory terminal.
 * Preserves the full startup report dossier in memory to answer founder follow-up queries,
 * draft cold outreach scripts, simulate pivot scenarios, and ground replies with live web data.
 *
 * @param props - CopilotDrawerProps containing dialog visibility, active report, and quota updates.
 * @returns Fully rendered accessible co-pilot dialog drawer.
 */
export function CopilotDrawer({
  open,
  report,
  onClose,
  onQuotaUpdate,
}: CopilotDrawerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputId = useId();
  const errorId = useId();

  const [question, setQuestion] = useState("");
  const [useLiveWeb, setUseLiveWeb] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<CopilotChatMessage[]>([]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendQuestion = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || !report || loading) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const nextHistory: CopilotChatMessage[] = [
      ...messages,
      { role: "user", content: clean },
    ];
    setMessages(nextHistory);
    setQuestion("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: clean,
          useLiveWeb,
          report,
          history: nextHistory.slice(-12).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const rawJson: unknown = await res.json().catch(() => ({}));
      const parsedRes = CopilotResponseSchema.safeParse(rawJson);
      const data = parsedRes.success ? parsedRes.data : {};

      if (data.quota) onQuotaUpdate(data.quota);

      const answerText = data.answer;
      if (!res.ok || !answerText) {
        setError(data.error || "Unable to get a Co-Pilot reply right now.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answerText,
          provider: data.provider,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Network error contacting Startup Co-Pilot.");
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  return (
    <DrawerDialog
      open={open}
      labelledBy="copilot-drawer-title"
      className="spark-drawer copilot-drawer"
      onClose={onClose}
      initialFocusRef={inputRef}
    >
      <div className="drawer-header">
        <div>
          <h2 className="drawer-title" id="copilot-drawer-title">
            <Compass
              className="h-4 w-4"
              style={{ color: "var(--orange-700)" }}
              aria-hidden="true"
            />
            <span>Co-Pilot</span>
          </h2>
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

      <CopilotMessageList
        startupTitle={report?.framer.startupTitle}
        messages={messages}
        loading={loading}
        error={error}
        errorId={errorId}
      />

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
              aria-hidden="true"
            >
              <span className="switch-thumb" />
            </span>
            <span>Live Web Search</span>
          </button>
        </div>

        <div className="copilot-input-row">
          <label htmlFor={inputId} className="sr-only">
            Ask a follow-up question
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="copilot-input"
            maxLength={600}
            enterKeyHint="send"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
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
    </DrawerDialog>
  );
}
