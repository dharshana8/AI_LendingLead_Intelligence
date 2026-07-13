import React, { useState } from "react";

const cardData = [
  { icon: "👥", value: "20", label: "Total Leads", desc: "Active pipeline leads", color: "#1e40af", bg: "#eff6ff" },
  { icon: "🔥", value: "7", label: "High Priority", desc: "Immediate outreach needed", color: "#22c55e", bg: "#dcfce7" },
  { icon: "🤖", value: "82", label: "Avg AI Score", desc: "Above industry benchmark", color: "#f59e0b", bg: "#fef3c7" },
  { icon: "📈", value: "34%", label: "Expected Conversion", desc: "vs 15% industry avg", color: "#8b5cf6", bg: "#f5f3ff" },
  { icon: "💰", value: "₹4.8 Cr", label: "Potential Business", desc: "Total loan opportunity", color: "#ef4444", bg: "#fee2e2" },
];

export default function KPICards() {
  return (
    <div style={{ display: "flex", gap: "16px", padding: "24px 28px 0", flexWrap: "wrap" }}>
      {cardData.map((c, i) => <KPICard key={i} {...c} />)}
    </div>
  );
}

function KPICard({ icon, value, label, desc, color, bg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "1 1 160px", background: "#fff", borderRadius: "14px",
        padding: "20px", border: "1px solid #e5e7eb",
        boxShadow: hovered ? "0 12px 28px rgba(0,0,0,0.12)" : "0 4px 10px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease", cursor: "default",
      }}
    >
      <div style={{
        width: "44px", height: "44px", borderRadius: "12px", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", marginBottom: "14px",
      }}>{icon}</div>
      <div style={{ fontSize: "28px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginTop: "6px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>{desc}</div>
    </div>
  );
}
