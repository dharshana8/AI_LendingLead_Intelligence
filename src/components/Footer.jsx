import React from "react";

export default function Footer() {
  return (
    <footer style={{
      margin: "28px 28px 0", padding: "20px 24px",
      background: "#fff", borderRadius: "14px 14px 0 0",
      border: "1px solid #e5e7eb", borderBottom: "none",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: "8px",
    }}>
      <span style={{ fontSize: "12px", color: "#6b7280" }}>
        © 2026 IDBI Bank Hackathon · AI Lending Lead Intelligence Platform
      </span>
      <div style={{ display: "flex", gap: "16px" }}>
        {["Powered by AI/ML", "React 18", "IDBI Bank"].map(t => (
          <span key={t} style={{ fontSize: "11px", color: "#9ca3af" }}>{t}</span>
        ))}
      </div>
    </footer>
  );
}
