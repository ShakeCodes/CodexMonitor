import type { CSSProperties } from "react";
import type { RuntimeCompatibility } from "@/types";

type UnsupportedRuntimeViewProps = {
  runtimeCompatibility: RuntimeCompatibility;
};

const shellStyle: CSSProperties = {
  minHeight: "100vh",
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(160deg, rgb(16 23 35) 0%, rgb(10 16 25) 52%, rgb(30 41 59) 100%)",
  color: "#f8fafc",
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: "24px",
};

const cardStyle: CSSProperties = {
  width: "min(560px, 100%)",
  borderRadius: "20px",
  background: "rgba(15, 23, 42, 0.86)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.45)",
  padding: "28px",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#fca5a5",
};

const titleStyle: CSSProperties = {
  margin: "10px 0 12px",
  fontSize: "30px",
  lineHeight: 1.1,
};

const bodyStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "15px",
  lineHeight: 1.65,
  color: "rgba(226, 232, 240, 0.92)",
};

const diagnosticsStyle: CSSProperties = {
  marginTop: "18px",
  padding: "16px",
  borderRadius: "14px",
  background: "rgba(30, 41, 59, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const diagnosticsLabelStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: "13px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(148, 163, 184, 0.92)",
};

const diagnosticsRowStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "14px",
  color: "rgba(226, 232, 240, 0.94)",
};

const codeStyle: CSSProperties = {
  fontFamily:
    'ui-monospace, "SFMono-Regular", SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: "13px",
  color: "#fde68a",
};

export function UnsupportedRuntimeView({
  runtimeCompatibility,
}: UnsupportedRuntimeViewProps) {
  return (
    <main style={shellStyle}>
      <section style={cardStyle} aria-labelledby="unsupported-runtime-title">
        <p style={eyebrowStyle}>Runtime Update Required</p>
        <h1 id="unsupported-runtime-title" style={titleStyle}>
          CodexMonitor needs a newer Monterey WebKit runtime
        </h1>
        <p style={bodyStyle}>Current runtime detected: macOS Monterey.</p>
        <p style={bodyStyle}>
          CodexMonitor requires Safari/WebKit 16.2 or newer on Monterey before it can
          load the main interface.
        </p>
        <p style={bodyStyle}>
          Update Monterey to the latest available Safari/WebKit build, or upgrade this
          Mac to Ventura or later for the most reliable experience.
        </p>

        <div style={diagnosticsStyle}>
          <p style={diagnosticsLabelStyle}>Detected Runtime</p>
          <p style={diagnosticsRowStyle}>
            macOS:{" "}
            <span style={codeStyle}>{runtimeCompatibility.macosVersion ?? "unknown"}</span>
          </p>
          <p style={{ ...diagnosticsRowStyle, marginBottom: 0 }}>
            WebKit:{" "}
            <span style={codeStyle}>{runtimeCompatibility.webkitVersion ?? "unknown"}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
