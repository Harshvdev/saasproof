interface LoadingBlockProps {
  message: string;
}

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
