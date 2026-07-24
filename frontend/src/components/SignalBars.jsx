import React from "react";
import { T } from "../tokens";
import { useInView } from "../hooks";

const SIGNALS = [
  { key: "salaryStability",   label: "Salary Stability",   color: T.teal },
  { key: "repaymentCapacity", label: "Repayment Capacity", color: T.gold },
  { key: "savingsRatio",      label: "Savings Ratio",      color: T.teal },
  { key: "loanIntent",        label: "Loan Intent",        color: T.gold },
  { key: "creditHealth",      label: "Credit Health",      color: T.teal },
  { key: "cibilContribution", label: "CIBIL Contribution", color: T.gold },
];

export default function SignalBars({ signals = {} }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {SIGNALS.map(({ key, label, color }, i) => {
        const val = Math.min(100, Math.max(0, signals[key] ?? 0));
        return (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: T.sub, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {label}
              </span>
              <span style={{ fontSize: "11px", fontWeight: "600", color, fontFamily: "'IBM Plex Mono', monospace" }}>
                {val}%
              </span>
            </div>
            <div style={{ height: "5px", background: T.line, borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                background: color,
                borderRadius: "3px",
                width: inView ? `${val}%` : "0%",
                transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
