"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CustomerOutput } from "@/lib/types";
import { LoadingBlock } from "./LoadingBlock";

interface CustomersTabProps {
  customers?: CustomerOutput;
  visible: boolean;
  onShowToast: (msg: string) => void;
}

/**
 * CustomersTab renders dual-sided customer personas, pain points, current workarounds,
 * willingness to pay, and the 5 Mom-Test discovery interview script with clipboard copying.
 *
 * @param props - CustomersTabProps containing customer profiles, visibility, and toast handler.
 * @returns Fully rendered customer discovery tabpanel.
 */
export function CustomersTab({
  customers,
  visible,
  onShowToast,
}: CustomersTabProps) {
  const [copiedScript, setCopiedScript] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<
    Record<number, boolean>
  >({});
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyScript = async () => {
    if (!customers) return;
    const text = customers.interviewQuestions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(true);
      onShowToast("Discovery interview script copied to clipboard!");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedScript(false), 2400);
    } catch {
      onShowToast("Clipboard permission unavailable — please copy manually.");
    }
  };

  return (
    <div
      role="tabpanel"
      id="panel-customers"
      aria-labelledby="tab-customers"
      hidden={!visible}
      className="report-section"
    >
      {!customers ? (
        <LoadingBlock message="Customer Profiler agent is building ICP personas and discovery scripts..." />
      ) : (
        <div>
          <h2 className="sr-only">Customer Personas and Discovery Interview Script</h2>
          <div className="hook-callout">
            <div className="panel-kicker">
              High-Converting Early Adopter Hook
            </div>
            <p
              style={{
                fontSize: "1.02rem",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              &ldquo;{customers.earlyAdopterHook}&rdquo;
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              {customers.targetSummary}
            </p>
          </div>

          <div className="persona-grid">
            {customers.personas.map((persona, pIdx) => (
              <article key={`${persona.name}-${pIdx}`} className="persona-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span className="tag-pill badge-accent">{persona.side}</span>
                    <h3
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        marginTop: "8px",
                      }}
                    >
                      {persona.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {persona.roleOrSegment}
                    </p>
                  </div>
                </div>

                <div className="persona-field">
                  <strong>Top Pain Points</strong>
                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      marginTop: "4px",
                    }}
                  >
                    {persona.topPainPoints.map((p, idx) => (
                      <li key={`pain-${idx}`}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="persona-field">
                  <strong>Current Workaround</strong>
                  <span>{persona.currentWorkaround}</span>
                </div>

                <div className="persona-field">
                  <strong>Willingness to Pay</strong>
                  <span
                    style={{ fontWeight: 700, color: "var(--orange-700)" }}
                  >
                    {persona.willingnessToPay}
                  </span>
                </div>

                <div className="persona-field">
                  <strong>Acquisition Channels</strong>
                  <div className="source-chips" style={{ marginTop: "5px" }}>
                    {persona.acquisitionChannels.map((ch, idx) => (
                      <span key={`ch-${idx}`} className="tag-pill">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Interview Script</h3>
              <button
                type="button"
                className="action-btn no-print"
                onClick={handleCopyScript}
              >
                {copiedScript ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <div>
              {customers.interviewQuestions.map((q, idx) => {
                const checked = Boolean(checkedQuestions[idx]);
                return (
                  <label
                    key={`iq-${idx}`}
                    className={`checklist-item ${checked ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setCheckedQuestions((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="custom-checkbox" aria-hidden="true">
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="check-text" style={{ fontSize: "0.88rem" }}>
                      {q}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
