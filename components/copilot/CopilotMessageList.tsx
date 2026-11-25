"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { sanitizeSafeUrl } from "@/lib/url";

export interface CopilotChatMessage {
  role: "user" | "assistant";
  content: string;
  provider?: string;
  sources?: Array<{ title: string; url: string; domain: string }>;
}

interface CopilotMessageListProps {
  startupTitle?: string;
  messages: CopilotChatMessage[];
  loading: boolean;
  error: string | null;
  errorId: string;
}

/**
 * Renders the accessible Co-Pilot message stream, sanitized external citations,
 * loading indicator, and alert errors.
 *
 * @param props - Message list state and startup title context.
 * @returns Live-region message log container.
 */
export function CopilotMessageList({
  startupTitle,
  messages,
  loading,
  error,
  errorId,
}: CopilotMessageListProps) {
  return (
    <div className="drawer-body">
      <div
        className="chat-stream"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={loading}
      >
        {messages.length === 0 && (
          <div className="chat-msg assistant">
            <div className="chat-bubble">
              Ask me anything about{" "}
              <strong>{startupTitle || "this startup"}</strong>—test pricing
              changes, narrow your wedge, or draft your first outreach messages.
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
                {msg.sources?.map((src, sIdx) => {
                  const safeHref = sanitizeSafeUrl(src.url);
                  if (!safeHref) return null;
                  return (
                    <a
                      key={`${safeHref}-${sIdx}`}
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link-chip"
                    >
                      <span>{src.domain}</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </a>
                  );
                })}
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
          <div id={errorId} className="copilot-error-alert" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
