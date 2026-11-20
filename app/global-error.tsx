"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root-level error boundary capturing catastrophic layout failures.
 * Next.js global-error.tsx must define its own <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global Layout Error:", error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#faf9f6",
          color: "#141311",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: "480px",
            textAlign: "center",
            padding: "32px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #e6e3dc",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "10px",
              color: "#c2410c",
            }}
          >
            System Recovery Mode
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#524e48",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            A root-level layout error was encountered. Click below to re-initialize
            the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#ea580c",
              color: "#ffffff",
              border: "none",
              padding: "10px 22px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
