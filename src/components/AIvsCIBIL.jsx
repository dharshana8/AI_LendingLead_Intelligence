import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

export default function AIvsCIBIL() {
  const { analytics, dataLoading, darkMode } = useApp();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!dataLoading) {
      const t = setTimeout(() => setAnimated(true), 300);
      return () => clearTimeout(t);
    }
  }, [dataLoading]);

  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const cibilQ = analytics?.cibilQualified ?? 0;
  const aiQ = analytics?.aiQualified ?? 0;
  const missed = analytics?.missedByCibil ?? 0;
  const total = analytics?.total || 1;
  const cibilPct = Math.round((cibilQ / total) * 100);
  const aiPct = Math.round((aiQ / total) * 100);
  const improvement = cibilQ > 0 ? Math.round(((aiQ - cibilQ) / cibilQ) * 100) : 0;
  const potRev = analytics?.potentialRevenue ?? "—";

  if (dataLoading) {
    return (
      <div style={{ margin: "20px 28px 0", background: cardBg, borderRadius: "14px", border: `1px solid ${border}`, padding: "24px", height: "180px", animation: "shimmer 1.5s infinite" }} />
    );
  }

  return (
    <div style={{ margin: "20px 28px 0", background: cardBg, borderRadius: "14px", border: `1px solid ${border}`, padding: "24px", boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ fontSize: "20px" }}>⚖️</span>
        <span style={{ fontSize: "15px", fontWeight: "700", color: textPrimary }}>AI vs Traditional CIBIL Screening</span>
        <span style={{ marginLeft: "auto", background: "#dcfce7", color: "#15803d", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>
          +{improvement}% Better
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <CompareBar label="Traditional CIBIL Screening" value={cibilPct} color="#94a3b8" leads={cibilQ} animated={animated} textSecondary={textSecondary} />
        <CompareBar label="AI-Powered Screening" value={aiPct} color="#1e40af" leads={aiQ} animated={animated} highlight textPrimary={textPrimary} textSecondary={textSecondary} />
      </div>
      <div style={{ marginTop: "20px", padding: "14px", background: darkMode ? "#0f172a" : "#eff6ff", borderRadius: "10px", border: `1px solid ${darkMode ? "#334155" : "#bfdbfe"}`, display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Leads Missed by CIBIL", value: String(missed), color: "#ef4444" },
          { label: "Extra Conversion Value", value: potRev, color: "#22c55e" },
          { label: "Accuracy Improvement", value: `+${improvement}%`, color: "#1e40af" },
          { label: "Processing Time Saved", value: "4 hrs", color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 120px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareBar({ label, value, color, leads, animated, highlight, textPrimary, textSecondary }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: highlight ? "700" : "500", color: highlight ? textPrimary : textSecondary }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color }}>{leads} Qualified Leads</span>
      </div>
      <div style={{ height: "14px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, borderRadius: "10px", width: animated ? `${value}%` : "0%", transition: "width 1.2s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px" }}>
          {animated && value > 10 && <span style={{ fontSize: "9px", color: "#fff", fontWeight: "700" }}>{value}%</span>}
        </div>
      </div>
    </div>
  );
}
