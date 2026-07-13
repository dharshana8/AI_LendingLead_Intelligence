import React, { useEffect, useState } from "react";

const signalConfig = [
  { key: "salaryStability", label: "Salary Stability", color: "#3b82f6" },
  { key: "repaymentCapacity", label: "Repayment Capacity", color: "#22c55e" },
  { key: "savingsRatio", label: "Savings Ratio", color: "#14b8a6" },
  { key: "loanIntent", label: "Loan Intent", color: "#8b5cf6" },
  { key: "creditHealth", label: "Credit Health", color: "#f59e0b" },
  { key: "cibilContribution", label: "CIBIL Contribution", color: "#6366f1" },
];

export default function SignalBars({ signals }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [signals]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {signalConfig.map(({ key, label, color }) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{label}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color }}>{signals[key]}%</span>
          </div>
          <div style={{ height: "7px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: color, borderRadius: "10px",
              width: animated ? `${signals[key]}%` : "0%",
              transition: "width 0.9s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
