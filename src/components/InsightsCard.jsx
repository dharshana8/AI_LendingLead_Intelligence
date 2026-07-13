import React from "react";

const insights = [
  "AI identified 7 high-intent customers ready for immediate outreach",
  "Home Loan demand is highest — 9 out of 20 leads prefer Home Loans",
  "Expected conversion increased from 15% to 34% using AI scoring",
  "AI discovered 3 customers missed by traditional CIBIL screening",
  "Potential business value of ₹4.8 Crores identified this week",
];

export default function InsightsCard() {
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
        <span style={{
          marginLeft: "auto", background: "#1e40af", color: "#fff",
          fontSize: "10px", fontWeight: "600", padding: "3px 10px",
          borderRadius: "20px",
        }}>LIVE</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {insights.map((text, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            flex: "1 1 280px",
          }}>
            <span style={{ color: "#22c55e", fontWeight: "700", fontSize: "14px", marginTop: "1px" }}>✔</span>
            <span style={{ fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
