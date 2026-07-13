import React from "react";

export function PriorityBadge({ priority }) {
  const map = {
    High: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    Medium: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    Low: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  };
  const s = map[priority] || map.Low;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: "700",
      whiteSpace: "nowrap",
    }}>{priority}</span>
  );
}

export function LoanBadge({ icon, loan }) {
  const map = {
    "Home Loan": { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
    "Personal Loan": { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
    "Auto Loan": { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
    "Mortgage Loan": { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  };
  const s = map[loan] || map["Personal Loan"];
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: "600",
      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px",
    }}>{icon} {loan}</span>
  );
}
