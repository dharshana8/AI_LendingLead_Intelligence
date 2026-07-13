import React from "react";
import { useApp } from "../context/AppContext";

function SkeletonInsight() {
  return (
    <div style={{ flex: "1 1 280px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#bfdbfe", flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: "12px", background: "#bfdbfe", borderRadius: "6px", marginBottom: "4px", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: "12px", background: "#bfdbfe", borderRadius: "6px", width: "70%", animation: "shimmer 1.5s infinite" }} />
      </div>
    </div>
  );
}

export default function InsightsCard() {
  const { analytics, dataLoading } = useApp();

  const insights = analytics?.insights || [];

  return (
    <div style={{
      margin: "20px 28px 0", background: "#eff6ff",
      borderRadius: "14px", padding: "20px 24px",
      borderLeft: "5px solid #1e40af", border: "1px solid #bfdbfe",
      borderLeftWidth: "5px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <span style={{ fontSize: "20px" }}>🧠</span>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e40af" }}>Today's AI Insights</span>
        <span style={{ marginLeft: "auto", background: "#1e40af", color: "#fff", fontSize: "10px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>LIVE</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {dataLoading
          ? [1, 2, 3, 4, 5].map(i => <SkeletonInsight key={i} />)
          : insights.length > 0
            ? insights.map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: "1 1 280px" }}>
                  <span style={{ color: "#22c55e", fontWeight: "700", fontSize: "14px", marginTop: "1px" }}>✔</span>
                  <span style={{ fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{text}</span>
                </div>
              ))
            : <span style={{ fontSize: "13px", color: "#1e3a8a" }}>No insights available yet. Load sample data to begin.</span>
        }
      </div>
    </div>
  );
}
