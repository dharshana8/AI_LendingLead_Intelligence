import React, { useState, useEffect, useRef } from "react";
import { PriorityBadge, LoanBadge } from "./Badges";
import SignalBars from "./SignalBars";
import { useApp } from "../context/AppContext";
import { apiDeleteCustomer, apiUpdateCustomer, apiChat } from "../services/api";
import LogCallModal from "./LogCallModal";
import { useCountUp } from "../hooks";

const DS = {
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

function CircleScore({ score }) {
  const color = score >= 80 ? DS.teal : score >= 65 ? DS.gold : DS.rust;
  const r = 44, circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const displayScore = useCountUp(score, 1400, 0, 200);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    return () => clearTimeout(t);
  }, [score, circ]);

  return (
    <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto" }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke={DS.border} strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: "26px", fontWeight: "700", color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "-0.02em" }}>{displayScore}</div>
        <div style={{ fontSize: "9px", color: DS.textMuted, fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI SCORE</div>
      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: "64px", height: "64px", borderRadius: "50%", background: DS.gold,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px", fontWeight: "800", color: DS.navy, margin: "0 auto",
      border: `3px solid rgba(255,255,255,0.2)`, fontFamily: "'IBM Plex Mono', monospace",
    }}>{initials}</div>
  );
}

// predict.py emits title-case feature names; map them to lookup keys
const SHAP_KEY_MAP = {
  "Age":                 "age",
  "Monthly_Income":      "monthly_income",
  "CIBIL_Score":         "cibil_score",
  "EMI_Burden":          "emi_burden",
  "Savings_Ratio":       "savings_ratio",
  "Credit_Health":       "credit_health",
  "Repayment_Capacity":  "repayment_capacity",
  "Debt_Ratio":          "debt_ratio",
  "Existing_Loan_Count": "existing_loan_count",
  "Years_of_Experience": "years_of_experience",
  "Account_Balance":     "account_balance",
};

const SHAP_LABEL = {
  age:                 { pos: "Customer age is within the preferred lending range",     neg: "Age is outside the preferred lending range" },
  monthly_income:      { pos: "High monthly income supports loan eligibility",          neg: "Monthly income may limit loan eligibility" },
  cibil_score:         { pos: "Strong CIBIL score supports creditworthiness",           neg: "CIBIL score below preferred threshold" },
  emi_burden:          { pos: "Low EMI burden — strong repayment headroom",             neg: "High EMI burden may affect repayment" },
  savings_ratio:       { pos: "Strong savings ratio reflects financial discipline",     neg: "Low savings margin observed" },
  credit_health:       { pos: "Healthy credit card utilization",                        neg: "High credit utilization is a risk signal" },
  repayment_capacity:  { pos: "Strong repayment capacity relative to income",          neg: "Limited repayment capacity" },
  debt_ratio:          { pos: "Low debt-to-income ratio",                               neg: "Elevated debt-to-income ratio" },
  existing_loan_count: { pos: "Manageable existing loan obligations",                   neg: "High number of existing loans is a risk factor" },
  years_of_experience: { pos: "Strong work experience signals income stability",        neg: "Limited work experience noted" },
  account_balance:     { pos: "Healthy account balance indicates financial stability",  neg: "Low account balance observed" },
  income:              { pos: "High income supports loan eligibility",                  neg: "Income may limit loan eligibility" },
  salary_regularity:   { pos: "Excellent salary consistency across six months",         neg: "Irregular salary credits detected" },
  intent_score:        { pos: "High loan intent based on page visit activity",          neg: "Low loan intent signals" },
};

function shapToReason(item) {
  const rawKey = item?.feature || "";
  const key = SHAP_KEY_MAP[rawKey] || rawKey.toLowerCase().replace(/ /g, "_");
  const map = SHAP_LABEL[key];
  if (!map) return rawKey ? `${rawKey.replace(/_/g, " ")} is a contributing factor` : null;
  return item.direction === "positive" || item.shap_value > 0 ? map.pos : map.neg;
}

function WhyCard({ lead }) {
  const shap = lead._raw?.shap_top3 || [];
  const hasShap = shap.length > 0;
  const reasons = hasShap
    ? shap.map(shapToReason).filter(Boolean)
    : [
        `Excellent ${(lead.signal || "salary stability").toLowerCase()} detected`,
        "Low EMI burden relative to income",
        "Strong savings and repayment capacity",
      ];
  const alsoEligible = lead.alsoEligible || [];
  const collateral = lead.collateralOption;
  return (
    <div style={{
      background: DS.card, borderRadius: "6px", padding: "14px",
      borderLeft: `3px solid ${DS.navy}`, border: `1px solid ${DS.border}`,
      borderLeftWidth: "3px", borderLeftColor: DS.navy,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "14px" }}>🎯</span>
        <span style={{ fontSize: "12px", fontWeight: "700", color: DS.navy, textTransform: "uppercase", letterSpacing: "0.04em" }}>Why this Lead?</span>
        {hasShap && <span style={{ fontSize: "9px", background: DS.navy, color: "#fff", padding: "2px 6px", borderRadius: "3px", fontWeight: "600", letterSpacing: "0.04em", marginLeft: "auto" }}>SHAP</span>}
      </div>
      {reasons.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
          <span style={{ color: DS.navy, fontWeight: "700", fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>▸</span>
          <span style={{ fontSize: "12px", color: DS.ink, lineHeight: 1.5 }}>{r}</span>
        </div>
      ))}
      {alsoEligible.length > 0 && (
        <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${DS.border}` }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>Also Eligible</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {alsoEligible.map(l => (
              <span key={l} style={{ fontSize: "11px", background: DS.tealSoft, color: DS.teal, padding: "2px 8px", borderRadius: "3px", fontWeight: "600" }}>{l}</span>
            ))}
          </div>
        </div>
      )}
      {collateral && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.04em" }}>Collateral Option:</span>
          <span style={{ fontSize: "11px", background: DS.goldSoft, color: DS.gold, padding: "2px 8px", borderRadius: "3px", fontWeight: "700" }}>🪙 {collateral}</span>
        </div>
      )}
    </div>
  );
}

function OutreachCard({ lead, message, generating, onRegenerate, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div style={{ background: DS.goldSoft, borderRadius: "6px", padding: "14px", border: `1px solid ${DS.border}` }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: DS.navy, marginBottom: "10px" }}>📨 AI Generated Outreach</div>
      <p style={{ fontSize: "12px", color: DS.ink, fontStyle: "italic", lineHeight: "1.7", margin: 0, whiteSpace: "pre-line" }}>
        {generating ? "✨ Generating message..." : message}
      </p>
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button onClick={handleCopy} style={btnStyle(DS.ink2, "#fff")}>
          {copied ? "✔ Copied" : "📋 Copy"}
        </button>
        <button onClick={onRegenerate} disabled={generating}
          style={btnStyle(generating ? DS.border : DS.navy, generating ? DS.ink2 : "#fff")}>
          {generating ? "⏳ Generating..." : "🔄 Regenerate"}
        </button>
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    flex: 1, padding: "8px", borderRadius: "5px", border: "none",
    background: bg, color, fontSize: "12px", fontWeight: "600",
    cursor: "pointer", transition: "opacity 0.2s",
  };
}

function fmtCurrency(v) {
  if (v === undefined || v === null || v === "") return "—";
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function fmtPct(v) {
  if (v === undefined || v === null || v === "") return "—";
  const n = Number(v);
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
}

function RecordSection({ title, rows }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{title}</div>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "4px 0", borderBottom: `1px solid ${DS.border}` }}>
          <span style={{ fontSize: "11px", color: DS.ink2, flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: DS.ink, textAlign: "right", wordBreak: "break-word", fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomerRecordCard({ lead }) {
  const [open, setOpen] = useState(false);
  const [masked, setMasked] = useState(true);
  const raw = lead._raw || {};
  const created = raw.created_at ? String(raw.created_at).split("T")[0] : "—";
  const scoredAt = raw.scored_at ? String(raw.scored_at).split("T")[0] : "—";

  const mask = (v) => masked ? "••••••" : v;
  const maskCurrency = (v) => masked ? "₹••••••" : fmtCurrency(v);

  const sections = [
    { title: "Personal", rows: [["Customer ID", raw.customer_id ?? lead.id ?? "—"], ["Name", raw.name ?? lead.name], ["Age", raw.age ?? "—"], ["Occupation", raw.occupation ?? lead.occupation], ["CIBIL Score", mask(raw.cibil_score ?? lead.cibil)]] },
    { title: "Financial Inputs", rows: [["Monthly Credit 1", maskCurrency(raw.monthly_credit_1)], ["Monthly Credit 2", maskCurrency(raw.monthly_credit_2)], ["Monthly Credit 3", maskCurrency(raw.monthly_credit_3)], ["Monthly Credit 4", maskCurrency(raw.monthly_credit_4)], ["Monthly Credit 5", maskCurrency(raw.monthly_credit_5)], ["Monthly Credit 6", maskCurrency(raw.monthly_credit_6)], ["EMI Debits", maskCurrency(raw.emi_debits)], ["CC Spend", maskCurrency(raw.cc_spend)], ["Credit Limit", maskCurrency(raw.credit_limit)], ["Account Balance", maskCurrency(raw.account_balance)], ["Existing Loans", raw.existing_loan_count ?? "—"], ["Years of Experience", raw.years_of_experience ?? "—"], ["Loan Page Visits", raw.loan_page_visits ?? "—"]] },
    { title: "Derived Features", rows: [["Income", maskCurrency(raw.income ?? lead.income)], ["Salary Regularity", fmtPct(raw.salary_regularity)], ["EMI Burden", fmtPct(raw.emi_burden)], ["Savings Ratio", fmtPct(raw.savings_ratio)], ["Credit Health", fmtPct(raw.credit_health)], ["Intent Score", fmtPct(raw.intent_score)], ["Repayment Capacity", maskCurrency(raw.repayment_capacity)], ["Debt Ratio", fmtPct(raw.debt_ratio)]] },
    { title: "AI & CRM", rows: [["AI Score", raw.ai_score ?? lead.aiScore], ["Conversion", fmtPct(raw.conversion_probability ?? lead.conversion / 100)], ["Priority", raw.priority ?? lead.priority], ["Recommended Loan", raw.recommended_loan ?? lead.loan], ["Top Signal", raw.top_signal ?? lead.signal], ["Model Version", raw.model_version || "—"], ["Scored At", scoredAt], ["Status", raw.status ?? lead.status ?? "New"], ["Assigned To", raw.assigned_to || lead.assignedTo || "Unassigned"], ["Last Contact", raw.last_contact || lead.lastContact || "—"], ["Created", created]] },
  ];

  return (
    <div style={{ background: DS.bg, borderRadius: "6px", border: `1px solid ${DS.border}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "12px 14px", border: "none", background: "transparent", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: DS.ink }}>📋 Full Customer Record</span>
        <span style={{ fontSize: "12px", color: DS.ink2 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px", maxHeight: "320px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
            <button onClick={() => setMasked(m => !m)} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "4px", border: `1px solid ${DS.border}`, background: masked ? DS.navy : DS.tealSoft, color: masked ? "#fff" : DS.teal, cursor: "pointer", fontWeight: "600" }}>
              {masked ? "👁 Reveal" : "🔒 Mask"}
            </button>
          </div>
          {sections.map(s => <RecordSection key={s.title} title={s.title} rows={s.rows} />)}
          {raw.explanation && (
            <div style={{ marginTop: "8px", padding: "8px", background: DS.goldSoft, borderRadius: "4px", fontSize: "11px", color: DS.navy, lineHeight: 1.5 }}>
              {raw.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConfirmRemoveModal({ name, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,26,43,0.65)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: DS.card, borderRadius: "8px", padding: "24px", width: "100%", maxWidth: "340px", border: `1px solid ${DS.border}`, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div style={{ fontSize: "15px", fontWeight: "700", color: DS.ink, marginBottom: "8px" }}>Remove Customer</div>
        <div style={{ fontSize: "13px", color: DS.ink2, marginBottom: "22px", lineHeight: 1.55 }}>
          Remove <strong>{name}</strong> from your portfolio? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", border: `1px solid ${DS.border}`, borderRadius: "6px", background: "transparent", color: DS.ink2, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px", background: DS.rust, color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function DetailPanel({ lead, onClose, onRefresh, onOptimisticRemove }) {
  const { addToast, user } = useApp();
  const outreachCache = useRef({});
  const [outreachMessage, setOutreachMessage] = useState("");
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [visible, setVisible] = useState(false);
  const [logCallOpen, setLogCallOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // On lead change: restore from cache or generate fresh
  useEffect(() => {
    if (!lead) return;
    if (outreachCache.current[lead.id]) {
      setOutreachMessage(outreachCache.current[lead.id]);
      return;
    }
    // Use static fallback immediately, then try to generate via AI
    const fallback = lead.outreach || "";
    setOutreachMessage(fallback);
    outreachCache.current[lead.id] = fallback;
    setGeneratingOutreach(true);
    apiChat(
      `Generate a personalized loan outreach message for this customer:\nName: ${lead.name}\nOccupation: ${lead.occupation}\nIncome: ₹${lead.income?.toLocaleString("en-IN")}\nCIBIL Score: ${lead.cibil}\nRecommended Loan: ${lead.loan}\nAI Score: ${lead.aiScore}\nConversion Probability: ${lead.conversion}%\n\nWrite a short, professional, personalized SMS/WhatsApp outreach message in 3-4 lines. Include the loan type and an estimated eligible amount. Do not mention any specific bank name or contact number. No subject line.`,
      []
    ).then(data => {
      if (data?.reply) {
        outreachCache.current[lead.id] = data.reply;
        setOutreachMessage(data.reply);
      }
    }).catch(() => {}).finally(() => setGeneratingOutreach(false));
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lead) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [lead]);

  const handleInitiateOutreach = async () => {
    try {
      await apiUpdateCustomer(lead.id, { status: "Contacted", assigned_to: user?.name || "", last_contact: new Date().toISOString().split("T")[0] });
      navigator.clipboard.writeText(outreachMessage).catch(() => {});
      addToast(`Outreach initiated for ${lead.name} — status set to Contacted, message copied`, "success");
      onRefresh?.();
    } catch { addToast("Failed to initiate outreach", "error"); }
  };

  const handleDelete = async () => {
    try {
      // Optimistic: close panel + remove from list immediately
      onOptimisticRemove?.(lead.id);
      onClose();
      addToast(`${lead.name} removed`, "success");
      await apiDeleteCustomer(lead.id);
    } catch {
      addToast("Delete failed — refreshing", "error");
      onRefresh?.();
    }
  };

  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await apiUpdateCustomer(lead.id, { status: newStatus });
      addToast(`${lead.name} → ${newStatus}`, "success");
      onRefresh?.();
    } catch (e) {
      addToast(e?.response?.data?.detail || "Status update failed", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!lead) return null;
  const convColor = lead.conversion >= 75 ? DS.teal : lead.conversion >= 50 ? DS.gold : DS.rust;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 998, opacity: visible ? 1 : 0, transition: "opacity 0.3s" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh",
        width: "clamp(340px, 420px, 100vw)",
        background: DS.card, zIndex: 999, overflowY: "auto",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        {/* Header — navy */}
        <div style={{ background: DS.navy, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Lead Details</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: DS.textDark, width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          <Avatar name={lead.name} />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: DS.textDark }}>{lead.name}</div>
            <div style={{ fontSize: "12px", color: DS.textMuted, marginTop: "2px" }}>{lead.occupation}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
              <PriorityBadge priority={lead.priority} />
              <LoanBadge icon={lead.loanIcon} loan={lead.loan} />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Score + Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <CircleScore score={lead.aiScore} />
            <div style={{ flex: 1 }}>
              <StatRow label="Conversion" value={`${lead.conversion}%`} color={convColor} />
              <StatRow label="Income" value={`₹${lead.income.toLocaleString("en-IN")}`} color={DS.ink} />
              <StatRow label="CIBIL" value={lead.cibil} color={lead.cibil >= 750 ? DS.teal : lead.cibil >= 650 ? DS.gold : DS.rust} />
              <StatRow label="Top Signal" value={lead.signal} color={DS.ink2} />
            </div>
          </div>

          {/* Signal Bars */}
          <div style={{ background: DS.bg, borderRadius: "6px", padding: "14px", border: `1px solid ${DS.border}` }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: DS.ink, marginBottom: "12px" }}>📊 Signal Analysis</div>
            <SignalBars signals={lead.signals} />
          </div>

          <WhyCard lead={lead} />
          <OutreachCard
            lead={lead}
            message={outreachMessage}
            generating={generatingOutreach}
            onRegenerate={async () => {
              setGeneratingOutreach(true);
              try {
                const data = await apiChat(
                  `Generate a personalized loan outreach message for this customer:\nName: ${lead.name}\nOccupation: ${lead.occupation}\nIncome: ₹${lead.income?.toLocaleString("en-IN")}\nCIBIL Score: ${lead.cibil}\nRecommended Loan: ${lead.loan}\nAI Score: ${lead.aiScore}\nConversion Probability: ${lead.conversion}%\n\nWrite a short, professional, personalized SMS/WhatsApp outreach message in 3-4 lines. Include the loan type and an estimated eligible amount. Do not mention any specific bank name or contact number. No subject line.`,
                  []
                );
                if (data?.reply) {
                  outreachCache.current[lead.id] = data.reply;
                  setOutreachMessage(data.reply);
                }
              } catch { } finally { setGeneratingOutreach(false); }
            }}
            onCopy={() => {}}
          />
          <CustomerRecordCard lead={lead} />

          {/* Initiate Outreach */}
          <button
            onClick={handleInitiateOutreach}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            style={{ width: "100%", padding: "13px", background: DS.gold, color: DS.navy, border: "none", borderRadius: "5px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.02em", boxShadow: "0 4px 14px rgba(199,154,61,0.3)", transition: "opacity 0.2s" }}>
            🚀 Initiate Outreach
          </button>

          {/* Status Update */}
          <div style={{ background: DS.bg, borderRadius: "6px", padding: "12px 14px", border: `1px solid ${DS.border}` }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Update Status</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["New", "Contacted", "Interested", "Applied", "Converted", "Declined"].map(s => {
                const isCurrent = (lead._raw?.status ?? lead.status) === s;
                const isRestricted = (s === "Converted" || s === "Declined");
                const colors = {
                  New:       ["#eff6ff", "#1e40af"],
                  Contacted: ["#fef3c7", "#b45309"],
                  Interested:["#dcfce7", "#15803d"],
                  Applied:   ["#f5f3ff", "#6d28d9"],
                  Converted: [DS.tealSoft, DS.teal],
                  Declined:  [DS.rustSoft, DS.rust],
                };
                const [bg, color] = colors[s] || [DS.bg, DS.ink2];
                return (
                  <button key={s}
                    disabled={statusUpdating || isCurrent}
                    onClick={() => handleStatusChange(s)}
                    style={{
                      padding: "5px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700",
                      border: `1.5px solid ${isCurrent ? color : DS.border}`,
                      background: isCurrent ? bg : "transparent",
                      color: isCurrent ? color : DS.ink2,
                      cursor: statusUpdating || isCurrent ? "default" : "pointer",
                      opacity: statusUpdating ? 0.6 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {isCurrent ? `✓ ${s}` : s}{isRestricted ? " 🔒" : ""}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: "10px", color: DS.ink2, marginTop: "6px" }}>Converted 🔒 and Declined 🔒 require Branch Manager or Admin role.</div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setLogCallOpen(true)} style={{ flex: 1, padding: "10px", background: DS.navy, color: DS.textDark, border: "none", borderRadius: "5px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              📞 Log Call
            </button>
            <button onClick={() => setConfirmRemove(true)} style={{ flex: 1, padding: "10px", background: DS.rustSoft, color: DS.rust, border: `1px solid ${DS.rust}`, borderRadius: "5px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              🗑 Remove
            </button>
          </div>
        </div>
      </div>
      {logCallOpen && (
        <LogCallModal
          lead={lead}
          onClose={() => setLogCallOpen(false)}
          onSaved={() => { setLogCallOpen(false); onRefresh?.(); }}
        />
      )}
      {confirmRemove && (
        <ConfirmRemoveModal
          name={lead.name}
          onConfirm={() => { setConfirmRemove(false); handleDelete(); }}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
    </>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
      <span style={{ fontSize: "11px", color: DS.ink2 }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: "700", color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
    </div>
  );
}
