import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px",
            padding: "24px",
            background: "#0f172a",
            color: "#f1f5f9",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#f87171" }}>
            Terjadi Kesalahan
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", maxWidth: "400px" }}>
            {this.state.error?.message ?? "Kesalahan tidak diketahui"}
          </p>
          {this.state.errorInfo && (
            <details
              style={{
                background: "#1e293b",
                padding: "12px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "100%",
                fontSize: "11px",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              <summary style={{ color: "#94a3b8", marginBottom: "8px" }}>
                Detail teknis
              </summary>
              <pre style={{ overflow: "auto", maxHeight: "200px" }}>
                {this.state.error?.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 24px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            🔄 Muat Ulang Portal
          </button>
          <p style={{ fontSize: "12px", color: "#475569" }}>
            Jika masalah berlanjut, hubungi admin RT
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
