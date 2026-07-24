import React from "react";

// DS tokens
const DS = {
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  border: "#E4DFD1",
};

export function PriorityBadge({ priority }) {
  const map = {
    High:   { bg: DS.goldSoft,  color: DS.gold,  border: "#E8C97A" },
    Medium: { bg: "#EEF2FF",    color: "#4338CA", border: "#C7D2FE" },
    Low:    { bg: DS.tealSoft,  color: DS.teal,  border: "#A8CECA" },
  };
  const s = map[priority] || map.Low;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "3px", padding: "2px 8px", fontSize: "10.5px", fontWeight: "600",
      whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
      letterSpacing: "0.03em", textTransform: "uppercase",
    }}>{priority}</span>
  );
}

export function LoanBadge({ icon, loan }) {
  const map = {
    "Home Loan":     { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
    "Personal Loan": { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
    "Auto Loan":     { bg: DS.tealSoft, color: DS.teal, border: "#A8CECA" },
    "Mortgage Loan": { bg: DS.goldSoft, color: "#92400E", border: "#E8C97A" },
  };
  const s = map[loan] || map["Personal Loan"];
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "3px", padding: "2px 8px", fontSize: "10.5px", fontWeight: "600",
      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>{icon} {loan}</span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    New:        { bg: "#F0F4FF", color: "#3B5BDB", border: "#BAC8FF" },
    Contacted:  { bg: DS.goldSoft, color: "#92400E", border: "#E8C97A" },
    Interested: { bg: DS.tealSoft, color: DS.teal, border: "#A8CECA" },
    Applied:    { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
    Converted:  { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
  };
  const s = map[status] || map.New;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "3px", padding: "2px 8px", fontSize: "10.5px", fontWeight: "600",
      whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
      letterSpacing: "0.03em",
    }}>{status}</span>
  );
}
