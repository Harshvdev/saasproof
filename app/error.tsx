"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Standard Next.js App Router route-level error boundary.
 * Renders an accessible, recoverable failure state with a `#main-content` landmark.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Route Error Boundary caught:", error.message);
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <div
        role="alert"
        aria-live="assertive"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "var(--rose-bg, rgba(244, 63, 94, 0.12))",
            color: "var(--rose-text, #be123c)",
            display: "grid",
            placeItems: "center",
            marginBottom: "16px",
          }}
        >
          <AlertOctagon className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1
          style={{
            fontSize: "1.45rem",
            fontWeight: 800,
            marginBottom: "8px",
            color: "var(--text-primary, #141311)",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--text-secondary, #524e48)",
            maxWidth: "480px",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred while processing your request. You can
          retry without losing your stored dossier history.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="nav-btn nav-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: 700,
            borderRadius: "999px",
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      </div>
    </main>
  );
}
