import React, { useEffect, useState } from "react";

export default function AIvsCIBIL() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      margin: "20px 28px 0", background: "#fff", borderRadius: "14px",
      border: "1px solid #e5e7eb", padding: "24px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ fontSize: "20px" }}>⚖️</span>
        <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>AI vs Traditional CIBIL Screening</span>
        <span style={{
          marginLeft: "auto", background: "#dcfce7", color: "#15803d",
          fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px",
        }}>+50% Better</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <CompareBar label="Traditional CIBIL Screening" value={60} max={100} color="#94a3b8" leads={6} animated={animated} />
        <CompareBar label="AI-Powered Screening" value={90} max={100} color="#1e40af" leads={9} animated={animated} highlight />
      </div>
      <div style={{
        marginTop: "20px", padding: "14px", background: "#eff6ff",
        borderRadius: "10px", border: "1px solid #bfdbfe",
        display: "flex", gap: "24px", flexWrap: "wrap",
      }}>
        {[
          { label: "Leads Missed by CIBIL", value: "3", color: "#ef4444" },
          { label: "Extra Conversion Value", value: "₹1.2 Cr", color: "#22c55e" },
          { label: "Accuracy Improvement", value: "+50%", color: "#1e40af" },
          { label: "Processing Time Saved", value: "4 hrs", color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 120px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareBar({ label, value, color, leads, animated, highlight }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: highlight ? "700" : "500", color: highlight ? "#111827" : "#6b7280" }}>
          {label}
        </span>
        <span style={{ fontSize: "13px", fontWeight: "700", color }}>
          {leads} Qualified Leads
        </span>
      </div>
      <div style={{ height: "14px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{
          height: "100%", background: color, borderRadius: "10px",
          width: animated ? `${value}%` : "0%",
          transition: "width 1.2s ease",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingRight: "8px",
        }}>
          {animated && <span style={{ fontSize: "9px", color: "#fff", fontWeight: "700" }}>{value}%</span>}
        </div>
      </div>
    </div>
  );
}
