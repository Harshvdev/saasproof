"use client";

import React, { useEffect, useRef } from "react";
import { History, Trash2, X } from "lucide-react";
import type { StartupReport } from "@/lib/types";

interface HistoryDrawerProps {
  open: boolean;
  reports: StartupReport[];
  activeReportId: string | null;
  onClose: () => void;
  onSelectReport: (report: StartupReport) => void;
  onDeleteReport: (id: string) => void;
}

export function HistoryDrawer({
  open,
  reports,
  activeReportId,
  onClose,
  onSelectReport,
  onDeleteReport,
}: HistoryDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="spark-drawer"
    >
      <div className="drawer-inner">
        <div className="drawer-header">
          <div className="drawer-title" id="history-drawer-title">
            <History
              className="h-4 w-4"
              style={{ color: "var(--orange-500)" }}
              aria-hidden="true"
            />
            <span>Saved Reports</span>
          </div>
          <button
            type="button"
            className="close-drawer-btn"
            onClick={onClose}
            aria-label="Close drawer"
            autoFocus
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-body">
          {reports.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                textAlign: "center",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-strong)",
                background: "var(--bg-subtle)",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                No saved reports yet
              </p>
            </div>
          ) : (
            reports.map((item) => {
              const isActive = item.id === activeReportId;
              const score = item.validator.overallScore;
              const scoreCls =
                score >= 80
                  ? "score-high"
                  : score >= 65
                    ? "score-mid"
                    : "score-low";
              return (
                <article
                  key={item.id}
                  className={`history-item ${isActive ? "active" : ""}`}
                >
                  <div className="history-item-top">
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: "0.96rem" }}>
                        {item.framer.startupTitle}
                      </h3>
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {item.framer.detectedModel} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`tag-pill mono ${scoreCls}`}
                      style={{ fontWeight: 700 }}
                    >
                      {score}/100
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.input.idea}
                  </p>

                  <div className="history-actions">
                    <button
                      type="button"
                      className="btn-preset-view"
                      style={{ padding: "6px 12px" }}
                      onClick={() => {
                        onSelectReport(item);
                        onClose();
                      }}
                    >
                      Open →
                    </button>
                    <button
                      type="button"
                      className="btn-delete-history"
                      onClick={() => onDeleteReport(item.id)}
                      aria-label={`Delete ${item.framer.startupTitle}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}
