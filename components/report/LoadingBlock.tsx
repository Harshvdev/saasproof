interface LoadingBlockProps {
  message: string;
}

/**
 * LoadingBlock renders a clean, accessible loading placeholder with animated spinner
 * and status messaging while asynchronous agent tasks complete.
 *
 * @param props - LoadingBlockProps with status message text.
 * @returns Fully rendered loading card.
 */
export function LoadingBlock({ message }: LoadingBlockProps) {
  return (
    <div className="panel-card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div
        className="spinner-ring"
        style={{ width: "24px", height: "24px", margin: "0 auto 16px" }}
        aria-hidden="true"
      />
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
        {message}
      </p>
    </div>
  );
}
