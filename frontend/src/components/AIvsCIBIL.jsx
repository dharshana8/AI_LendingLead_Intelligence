import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

export default function AIvsCIBIL() {
  const { analytics, dataLoading, darkMode } = useApp();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!dataLoading) { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }
  }, [dataLoading]);

  const cardBg = darkMode ? "#152540" : "#FFFFFF";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E4DFD1";
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";

  const cibilQ = analytics?.cibilQualified ?? 0;
  const aiQ = analytics?.aiQualified ?? 0;
  const missed = analytics?.missedByCibil ?? 0;
  const total = analytics?.total || 1;
  const cibilPct = Math.round((cibilQ / total) * 100);
  const aiPct = Math.round((aiQ / total) * 100);
  const improvement = cibilQ > 0 ? Math.round(((aiQ - cibilQ) / cibilQ) * 100) : 0;
  const potRev = analytics?.potentialRevenue ?? "—";

  if (dataLoading) return (
    <div style={{ margin: "16px 24px 0", background: cardBg, borderRadius: "6px", border: `1px solid ${border}`, height: "160px", animation: "shimmer 1.5s infinite" }} />
  );

  return (
    <div style={{ margin: "16px 24px 0", background: cardBg, borderRadius: "6px", border: `1px solid ${border}`, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>AI vs Traditional CIBIL Screening</span>
        <span style={{ marginLeft: "auto", background: "#DCEAE6", color: "#2F6E63", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}>+{improvement}% BETTER</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
        <Bar label="Traditional CIBIL" value={cibilPct} leads={cibilQ} color="#8CA0BC" animated={animated} textSecondary={textSecondary} />
        <Bar label="AI-Powered Screening" value={aiPct} leads={aiQ} color="#C79A3D" animated={animated} textSecondary={textSecondary} bold />
      </div>
      <div style={{ display: "flex", gap: "0", borderTop: `1px solid ${border}`, paddingTop: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Missed by CIBIL", value: String(missed), color: "#B5482F" },
          { label: "Extra Revenue",   value: potRev,          color: "#2F6E63" },
          { label: "Improvement",     value: `+${improvement}%`, color: "#C79A3D" },
          { label: "Time Saved",      value: "4 hrs",         color: "#5C6672" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 100px", textAlign: "center", padding: "0 8px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
            <div style={{ fontSize: "10px", color: textSecondary, marginTop: "3px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, leads, color, animated, textSecondary, bold }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: bold ? "600" : "400", color: bold ? "#12181F" : textSecondary, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "11px", fontWeight: "600", color, fontFamily: "'IBM Plex Mono', monospace" }}>{leads} leads</span>
      </div>
      <div style={{ height: "8px", background: "#E4DFD1", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, borderRadius: "2px", width: animated ? `${value}%` : "0%", transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}
