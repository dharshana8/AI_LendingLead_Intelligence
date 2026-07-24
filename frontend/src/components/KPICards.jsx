import React from "react";
import { useApp } from "../context/AppContext";

export default function KPICards() {
  const { analytics, dataLoading, darkMode } = useApp();
  const cardBg = darkMode ? "#152540" : "#FFFFFF";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E4DFD1";

  if (dataLoading) {
    return (
      <div style={{ display: "flex", gap: "12px", padding: "20px 24px 0", flexWrap: "wrap" }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: "1 1 150px", background: cardBg, borderRadius: "6px", padding: "18px", border: `1px solid ${border}`, height: "110px", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  const a = analytics || {};
  const cards = [
    { value: a.total ?? "—",                      label: "Total Leads",       sub: "Active pipeline",        accent: "#0E1A2B" },
    { value: a.highCount ?? "—",                  label: "High Priority",     sub: "Immediate action",       accent: "#C79A3D" },
    { value: a.avgScore ?? "—",                   label: "Avg AI Score",      sub: "Above benchmark",        accent: "#2F6E63" },
    { value: a.avgConv ? `${a.avgConv}%` : "—",  label: "Conversion Rate",   sub: "vs 15% industry avg",    accent: "#C79A3D" },
    { value: a.potentialRevenue ?? "—",           label: "Potential Revenue", sub: "Total loan opportunity", accent: "#2F6E63" },
  ];

  return (
    <div style={{ display: "flex", gap: "12px", padding: "20px 24px 0", flexWrap: "wrap" }}>
      {cards.map((c, i) => <KPICard key={i} {...c} cardBg={cardBg} border={border} darkMode={darkMode} />)}
    </div>
  );
}

function KPICard({ value, label, sub, accent, cardBg, border, darkMode }) {
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";
  return (
    <div style={{
      flex: "1 1 150px", background: cardBg, borderRadius: "6px",
      padding: "18px 20px", border: `1px solid ${border}`,
      borderTop: `2px solid ${accent}`,
    }}>
      <div style={{ fontSize: "26px", fontWeight: "700", color: textPrimary, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, marginTop: "8px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</div>
      <div style={{ fontSize: "11px", color: textSecondary, marginTop: "3px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{sub}</div>
    </div>
  );
}
