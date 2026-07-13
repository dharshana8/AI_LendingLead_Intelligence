import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { leads } from "../data/mockData";

function AnimatedBar({ value, max, color, label, sublabel, animated }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "13px", fontWeight: "500" }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color }}>{sublabel || value}</span>
      </div>
      <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: animated ? `${pct}%` : "0%", background: color, borderRadius: "10px", transition: "width 1.1s ease" }} />
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, sub, color, bg, darkMode, border }) {
  const [h, setH] = useState(false);
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flex: "1 1 160px", background: cardBg, borderRadius: "12px", padding: "18px",
        border: `1px solid ${border}`,
        boxShadow: h ? "0 10px 24px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
        transform: h ? "translateY(-3px)" : "none", transition: "all 0.2s",
      }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: "26px", fontWeight: "800", color: textPrimary }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary, marginTop: "4px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: textSecondary, marginTop: "3px" }}>{sub}</div>
    </div>
  );
}

const LOAN_DIST = [
  { loan: "Home Loan", count: 9, color: "#1e40af", pct: 45 },
  { loan: "Personal Loan", count: 6, color: "#7c3aed", pct: 30 },
  { loan: "Mortgage Loan", count: 3, color: "#f59e0b", pct: 15 },
  { loan: "Auto Loan", count: 2, color: "#22c55e", pct: 10 },
];

const BRANCHES = [
  { name: "Mumbai Main", leads: 8, conversion: 42, revenue: "₹1.8Cr", rank: 1 },
  { name: "Delhi Central", leads: 6, conversion: 38, revenue: "₹1.4Cr", rank: 2 },
  { name: "Bangalore Tech", leads: 4, conversion: 35, revenue: "₹0.9Cr", rank: 3 },
  { name: "Chennai South", leads: 2, conversion: 28, revenue: "₹0.7Cr", rank: 4 },
];

const MONTHLY = [
  { month: "Jan", leads: 12, converted: 4 },
  { month: "Feb", leads: 15, converted: 5 },
  { month: "Mar", leads: 18, converted: 7 },
  { month: "Apr", leads: 14, converted: 6 },
  { month: "May", leads: 20, converted: 8 },
  { month: "Jun", leads: 22, converted: 9 },
];

const FUNNEL = [
  { stage: "Total Leads", count: 20, color: "#1e40af" },
  { stage: "AI Qualified", count: 14, color: "#7c3aed" },
  { stage: "Contacted", count: 11, color: "#0891b2" },
  { stage: "Interested", count: 8, color: "#f59e0b" },
  { stage: "Applied", count: 5, color: "#22c55e" },
  { stage: "Converted", count: 3, color: "#15803d" },
];

export default function AnalyticsPage() {
  const { darkMode } = useApp();
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const highCount = leads.filter(l => l.priority === "High").length;
  const avgScore = Math.round(leads.reduce((s, l) => s + l.aiScore, 0) / leads.length);
  const avgConv = Math.round(leads.reduce((s, l) => s + l.conversion, 0) / leads.length);

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Analytics & Insights</h2>
        <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>AI-powered performance metrics for your lending portfolio</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard icon="👥" value={leads.length} label="Total Leads" sub="Active pipeline" color="#1e40af" bg="#eff6ff" darkMode={darkMode} border={border} />
        <StatCard icon="🔥" value={highCount} label="High Priority" sub="Immediate action" color="#22c55e" bg="#dcfce7" darkMode={darkMode} border={border} />
        <StatCard icon="🤖" value={avgScore} label="Avg AI Score" sub="Above benchmark" color="#f59e0b" bg="#fef3c7" darkMode={darkMode} border={border} />
        <StatCard icon="📈" value={`${avgConv}%`} label="Avg Conversion" sub="vs 15% industry" color="#7c3aed" bg="#f5f3ff" darkMode={darkMode} border={border} />
        <StatCard icon="💰" value="₹4.8Cr" label="Potential Revenue" sub="This month" color="#ef4444" bg="#fee2e2" darkMode={darkMode} border={border} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "16px", marginBottom: "16px" }}>
        {/* Lead Funnel */}
        <Section title="Lead Conversion Funnel" icon="🔽" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          {FUNNEL.map(({ stage, count, color }) => (
            <div key={stage} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: textSecondary }}>{stage}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color }}>{count} leads</span>
              </div>
              <div style={{ height: "28px", background: darkMode ? "#0f172a" : "#f3f4f6", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: color, borderRadius: "6px",
                  width: animated ? `${(count / 20) * 100}%` : "0%",
                  transition: "width 1s ease", display: "flex", alignItems: "center", paddingLeft: "10px",
                }}>
                  {animated && <span style={{ fontSize: "11px", color: "#fff", fontWeight: "700" }}>{Math.round((count / 20) * 100)}%</span>}
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* Loan Distribution */}
        <Section title="Loan Type Distribution" icon="🏦" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            {LOAN_DIST.map(({ loan, count, color, pct }) => (
              <div key={loan} style={{ flex: "1 1 100px", textAlign: "center", padding: "12px", background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color }}>{count}</div>
                <div style={{ fontSize: "10px", color: textSecondary, marginTop: "2px" }}>{loan}</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color, marginTop: "2px" }}>{pct}%</div>
              </div>
            ))}
          </div>
          {LOAN_DIST.map(({ loan, pct, color }) => (
            <AnimatedBar key={loan} value={pct} max={100} color={color} label={loan} sublabel={`${pct}%`} animated={animated} />
          ))}
        </Section>

        {/* Monthly Growth */}
        <Section title="Monthly Lead Growth" icon="📅" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", marginBottom: "8px" }}>
            {MONTHLY.map(({ month, leads: l, converted }) => (
              <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2px", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", height: animated ? `${(converted / 22) * 120}px` : "0px", background: "#22c55e", borderRadius: "4px 4px 0 0", transition: "height 1s ease", minHeight: "4px" }} />
                  <div style={{ width: "100%", height: animated ? `${((l - converted) / 22) * 120}px` : "0px", background: "#1e40af", borderRadius: "4px 4px 0 0", transition: "height 1.1s ease", minHeight: "4px" }} />
                </div>
                <span style={{ fontSize: "10px", color: textSecondary, marginTop: "4px" }}>{month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <LegendDot color="#1e40af" label="Total Leads" />
            <LegendDot color="#22c55e" label="Converted" />
          </div>
        </Section>

        {/* Branch Performance */}
        <Section title="Branch Performance" icon="🏦" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          {BRANCHES.map(({ name, leads: l, conversion, revenue, rank }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                background: rank === 1 ? "#fef3c7" : rank === 2 ? "#f3f4f6" : "#fff7ed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "800", color: rank === 1 ? "#b45309" : "#6b7280",
              }}>#{rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{name}</div>
                <div style={{ fontSize: "11px", color: textSecondary }}>{l} leads · {conversion}% conversion</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#22c55e" }}>{revenue}</div>
                <div style={{ width: "60px", height: "5px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden", marginTop: "4px" }}>
                  <div style={{ height: "100%", width: animated ? `${conversion}%` : "0%", background: "#1e40af", borderRadius: "10px", transition: "width 1s ease" }} />
                </div>
              </div>
            </div>
          ))}
        </Section>

        {/* AI Accuracy */}
        <Section title="AI Model Performance" icon="🤖" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          {[
            { label: "Overall Accuracy", value: 94, color: "#22c55e" },
            { label: "Precision", value: 91, color: "#1e40af" },
            { label: "Recall", value: 88, color: "#7c3aed" },
            { label: "F1 Score", value: 89, color: "#f59e0b" },
            { label: "AUC-ROC", value: 96, color: "#0891b2" },
          ].map(({ label, value, color }) => (
            <AnimatedBar key={label} value={value} max={100} color={color} label={label} sublabel={`${value}%`} animated={animated} />
          ))}
        </Section>

        {/* Priority Distribution */}
        <Section title="Priority Distribution" icon="🎯" cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary}>
          {[
            { label: "High Priority", value: highCount, color: "#22c55e", bg: "#dcfce7" },
            { label: "Medium Priority", value: leads.filter(l => l.priority === "Medium").length, color: "#f59e0b", bg: "#fef3c7" },
            { label: "Low Priority", value: leads.filter(l => l.priority === "Low").length, color: "#ef4444", bg: "#fee2e2" },
          ].map(({ label, value, color, bg: pbg }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: pbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", color, flexShrink: 0 }}>{value}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: textSecondary, marginBottom: "4px" }}>{label}</div>
                <div style={{ height: "8px", background: darkMode ? "#0f172a" : "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: animated ? `${(value / leads.length) * 100}%` : "0%", background: color, borderRadius: "10px", transition: "width 1s ease" }} />
                </div>
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color }}>{Math.round((value / leads.length) * 100)}%</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon, children, cardBg, border, textPrimary, textSecondary }) {
  return (
    <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: color }} />
      <span style={{ fontSize: "11px", color: "#6b7280" }}>{label}</span>
    </div>
  );
}
