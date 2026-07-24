import React from "react";
import { useApp } from "../context/AppContext";

export default function InsightsCard() {
  const { analytics, dataLoading, darkMode } = useApp();
  const insights = analytics?.insights || [];
  const bg = darkMode ? "#0E1A2B" : "#0E1A2B";

  return (
    <div style={{
      margin: "16px 24px 0",
      background: bg,
      borderRadius: "6px",
      padding: "18px 22px",
      borderLeft: "3px solid #C79A3D",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#C79A3D", fontFamily: "'IBM Plex Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Insights</span>
        <span style={{ marginLeft: "auto", background: "rgba(199,154,61,0.15)", color: "#C79A3D", fontSize: "9px", fontWeight: "700", padding: "2px 8px", borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}>LIVE</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {dataLoading
          ? [1,2,3].map(i => (
              <div key={i} style={{ flex: "1 1 260px", height: "14px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", animation: "shimmer 1.5s infinite" }} />
            ))
          : insights.length > 0
            ? insights.map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: "1 1 260px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C79A3D", flexShrink: 0, marginTop: "5px" }} />
                  <span style={{ fontSize: "12px", color: "#8CA0BC", lineHeight: 1.55, fontFamily: "'IBM Plex Sans', sans-serif" }}>{text}</span>
                </div>
              ))
            : <span style={{ fontSize: "12px", color: "#8CA0BC", fontFamily: "'IBM Plex Sans', sans-serif" }}>No insights yet. Load sample data to begin.</span>
        }
      </div>
    </div>
  );
}
