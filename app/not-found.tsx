import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

/**
 * Standard Next.js 404 handler with accessible WCAG markup and recovery navigation.
 */
export default function NotFound() {
  return (
    <div
      role="region"
      aria-label="404 Not Found"
      style={{
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "var(--orange-50, #fff7ed)",
          color: "var(--orange-600, #ea580c)",
          border: "1px solid var(--orange-200, #fed7aa)",
          display: "grid",
          placeItems: "center",
          marginBottom: "16px",
        }}
      >
        <FileQuestion className="h-7 w-7" aria-hidden="true" />
      </div>

      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          fontSize: "0.94rem",
          color: "var(--text-secondary, #524e48)",
          maxWidth: "460px",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        The startup validation report or page you requested does not exist or may have
        expired from temporary cache.
      </p>

      <Link
        href="/"
        className="nav-btn nav-btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 22px",
          fontSize: "0.9rem",
          fontWeight: 700,
          borderRadius: "999px",
          textDecoration: "none",
        }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Return to SaaSProof</span>
      </Link>
    </div>
  );
}
