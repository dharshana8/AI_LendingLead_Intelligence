import React, { useState } from "react";
import { useApp } from "../context/AppContext";

function SkeletonKPI() {
  return (
    <div style={{ flex: "1 1 160px", background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb", height: "130px" }}>
      {[44, 28, 14, 11].map((h, i) => (
        <div key={i} style={{ height: h, background: "#f3f4f6", borderRadius: "8px", marginBottom: "8px", width: i === 0 ? "44px" : i === 1 ? "60%" : "80%", animation: "shimmer 1.5s infinite" }} />
      ))}
    </div>
  );
}

export default function KPICards() {
  const { analytics, dataLoading, darkMode } = useApp();
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";

  if (dataLoading) {
    return (
      <div style={{ display: "flex", gap: "16px", padding: "24px 28px 0", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonKPI key={i} />)}
      </div>
    );
  }

  const a = analytics || {};
  const cardData = [
    { icon: "👥", value: a.total ?? "—",            label: "Total Leads",          desc: "Active pipeline leads",      color: "#1e40af", bg: "#eff6ff" },
    { icon: "🔥", value: a.highCount ?? "—",         label: "High Priority",        desc: "Immediate outreach needed",  color: "#22c55e", bg: "#dcfce7" },
    { icon: "🤖", value: a.avgScore ?? "—",          label: "Avg AI Score",         desc: "Above industry benchmark",   color: "#f59e0b", bg: "#fef3c7" },
    { icon: "📈", value: a.avgConv ? `${a.avgConv}%` : "—", label: "Expected Conversion", desc: "vs 15% industry avg", color: "#8b5cf6", bg: "#f5f3ff" },
    { icon: "💰", value: a.potentialRevenue ?? "—",  label: "Potential Business",   desc: "Total loan opportunity",     color: "#ef4444", bg: "#fee2e2" },
  ];

  return (
    <div style={{ display: "flex", gap: "16px", padding: "24px 28px 0", flexWrap: "wrap" }}>
      {cardData.map((c, i) => <KPICard key={i} {...c} cardBg={cardBg} border={border} darkMode={darkMode} />)}
    </div>
  );
}

function KPICard({ icon, value, label, desc, color, bg, cardBg, border, darkMode }) {
  const [hovered, setHovered] = useState(false);
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 160px", background: cardBg, borderRadius: "14px",
        padding: "20px", border: `1px solid ${border}`,
        boxShadow: hovered ? "0 12px 28px rgba(0,0,0,0.12)" : "0 4px 10px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease", cursor: "default",
      }}
    >
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "14px" }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: "800", color: textPrimary, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary, marginTop: "6px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: textSecondary, marginTop: "4px" }}>{desc}</div>
    </div>
  );
}
