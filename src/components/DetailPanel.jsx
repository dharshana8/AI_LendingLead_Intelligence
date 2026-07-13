import React, { useState, useEffect } from "react";
import { PriorityBadge, LoanBadge } from "./Badges";
import SignalBars from "./SignalBars";

function CircleScore({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto" }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "26px", fontWeight: "800", color }}>{score}</div>
        <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: "600" }}>AI SCORE</div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1e40af", "#7c3aed", "#0891b2", "#065f46", "#9a3412"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: "64px", height: "64px", borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px", fontWeight: "800", color: "#fff", margin: "0 auto",
      border: "3px solid #e5e7eb",
    }}>{initials}</div>
  );
}

function WhyCard({ lead }) {
  const reasons = [
    `Excellent ${lead.signal.toLowerCase()} detected`,
    "Low EMI burden relative to income",
    "Strong savings and repayment capacity",
    "High loan intent signals",
    "Healthy credit utilization pattern",
    "AI predicts high repayment probability",
  ];
  return (
    <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "14px", border: "1px solid #bfdbfe" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "16px" }}>💡</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>Why this Lead?</span>
      </div>
      {reasons.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
          <span style={{ color: "#22c55e", fontWeight: "700", fontSize: "12px" }}>✔</span>
          <span style={{ fontSize: "12px", color: "#1e3a8a" }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

function OutreachCard({ lead, onCopy }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(lead.outreach).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy && onCopy();
  };
  return (
    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "14px", border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "10px" }}>📨 AI Generated Outreach</div>
      <p style={{ fontSize: "12px", color: "#4b5563", fontStyle: "italic", lineHeight: "1.7", margin: 0, whiteSpace: "pre-line" }}>
        {lead.outreach}
      </p>
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button onClick={handleCopy} style={btnStyle("#6b7280", "#fff")}>
          {copied ? "✔ Copied" : "📋 Copy"}
        </button>
        <button style={btnStyle("#1e40af", "#fff")}>🔄 Regenerate</button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    flex: 1, padding: "8px", borderRadius: "8px", border: "none",
    background: bg, color, fontSize: "12px", fontWeight: "600",
    cursor: "pointer", transition: "opacity 0.2s",
  };
}

export default function DetailPanel({ lead, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (lead) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [lead]);

  if (!lead) return null;
  const convColor = lead.conversion >= 75 ? "#15803d" : lead.conversion >= 50 ? "#b45309" : "#b91c1c";

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
        zIndex: 998, opacity: visible ? 1 : 0, transition: "opacity 0.3s",
      }} />
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh",
        width: "clamp(300px, 360px, 100vw)",
        background: "#fff", zIndex: 999, overflowY: "auto",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1e40af,#1e3a8a)", padding: "20px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", opacity: 0.8 }}>Lead Details</span>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
              width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer",
              fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
          <Avatar name={lead.name} />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>{lead.name}</div>
            <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>{lead.occupation}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
              <PriorityBadge priority={lead.priority} />
              <LoanBadge icon={lead.loanIcon} loan={lead.loan} />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Score + Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <CircleScore score={lead.aiScore} />
            <div style={{ flex: 1 }}>
              <StatRow label="Conversion" value={`${lead.conversion}%`} color={convColor} />
              <StatRow label="Income" value={`₹${lead.income.toLocaleString("en-IN")}`} color="#111827" />
              <StatRow label="CIBIL" value={lead.cibil} color={lead.cibil >= 750 ? "#15803d" : lead.cibil >= 650 ? "#b45309" : "#b91c1c"} />
              <StatRow label="Top Signal" value={lead.signal} color="#6b7280" />
            </div>
          </div>

          {/* Signal Bars */}
          <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "14px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>📊 Signal Analysis</div>
            <SignalBars signals={lead.signals} />
          </div>

          <WhyCard lead={lead} />
          <OutreachCard lead={lead} />

          {/* Initiate Outreach */}
          <button style={{
            width: "100%", padding: "14px", background: "linear-gradient(135deg,#1e40af,#1e3a8a)",
            color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px",
            fontWeight: "700", cursor: "pointer", letterSpacing: "0.02em",
            boxShadow: "0 4px 14px rgba(30,64,175,0.4)", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.target.style.opacity = "0.9"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >🚀 Initiate Outreach</button>
        </div>
      </div>
    </>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
      <span style={{ fontSize: "11px", color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: "700", color }}>{value}</span>
    </div>
  );
}
