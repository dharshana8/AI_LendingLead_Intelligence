import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useCountUp, useInView } from "../hooks";
import { T, type as TY } from "../tokens";

const DS = T;

// ── KPI card with count-up ────────────────────────────────────────────────────
function KPICard({ icon, value, label, sub, accent, accentBg, card, bdr, ink, ink2, delay = 0 }) {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const animated = useCountUp(num, 1200, 0, delay);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      background: card, borderRadius: "6px", padding: "16px 18px",
      border: `1px solid ${bdr}`, borderTop: `2px solid ${accent}`,
      display: "flex", alignItems: "center", gap: "12px",
      animation: inView ? "fadeUp 0.5s ease both" : "none",
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "8px", background: accentBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", fontWeight: "700", color: accent, lineHeight: 1 }}>{animated}</div>
        <div style={{ fontSize: "12px", fontWeight: "600", color: ink, marginTop: "3px" }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: ink2, marginTop: "1px" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── AI Model Status — Admin-only ──────────────────────────────────────────────
function AIModelBanner({ analytics }) {
  const accuracy = analytics?.aiMetrics?.find(m => m.label === "Overall Accuracy")?.value ?? 95;
  const metrics = [
    ["Accuracy", `${accuracy}%`],
    ["Precision", "91%"],
    ["Recall",    "88%"],
    ["AUC-ROC",   "96%"],
  ];
  return (
    <div style={{ background: DS.navy, borderRadius: "6px", padding: "18px 24px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <span style={{ fontSize: "14px", fontWeight: "700", color: DS.textDark, fontFamily: "'IBM Plex Sans', sans-serif" }}>AI Model Status</span>
          <span style={{ background: "rgba(47,110,99,0.2)", color: DS.teal, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px", border: "1px solid rgba(47,110,99,0.3)", fontFamily: "'IBM Plex Mono', monospace" }}>LIVE</span>
        </div>
        <p style={{ fontSize: "12px", color: DS.textMuted, margin: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          RandomForest · 20,000 training samples · SHAP explainability active
        </p>
      </div>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {metrics.map(([k, v]) => (
          <div key={k} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "20px", fontWeight: "800", color: DS.gold }}>{v}</div>
            <div style={{ fontSize: "10px", color: DS.textMuted, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Branch Performance Table — Admin-only ─────────────────────────────────────
const BRANCHES = [
  { name: "Mumbai Main",    manager: "Ankit Sharma",  employees: 12, conversion: 42, revenue: "₹1.8Cr", rank: 1 },
  { name: "Delhi Central",  manager: "Priya Mehta",   employees: 9,  conversion: 38, revenue: "₹1.4Cr", rank: 2 },
  { name: "Bangalore Tech", manager: "Rahul Desai",   employees: 7,  conversion: 35, revenue: "₹0.9Cr", rank: 3 },
  { name: "Chennai South",  manager: "Kavya Nair",    employees: 6,  conversion: 28, revenue: "₹0.7Cr", rank: 4 },
  { name: "HQ Mumbai",      manager: "Rajiv Nair",    employees: 20, conversion: 0,  revenue: "—",       rank: 5 },
];

function BranchTable({ card, bdr, ink, ink2, darkMode }) {
  const [ref, inView] = useInView();
  const TH = {
    padding: "10px 14px", fontSize: "10.5px", fontWeight: "700", color: ink2,
    textTransform: "uppercase", letterSpacing: "0.08em",
    borderBottom: `2px solid ${bdr}`, background: darkMode ? DS.bg : DS.page,
    textAlign: "left", whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
  };
  const TD = { padding: "12px 14px", borderBottom: `1px solid ${bdr}`, verticalAlign: "middle" };

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TY.microLabel, color: ink2 }}>Branch Performance</span>
        <span style={{ fontSize: "10px", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace" }}>All Branches</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Rank", "Branch", "Manager", "Employees", "Conversion", "Revenue"].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {BRANCHES.map((b, i) => (
              <tr key={b.name}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : DS.page}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.13s", animation: inView ? `fadeUp 0.5s ease ${i * 60}ms both` : "none" }}>
                <td style={TD}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: "800", fontSize: "13px", color: b.rank === 1 ? DS.gold : b.rank === 2 ? DS.sub : ink2 }}>#{b.rank}</span>
                </td>
                <td style={TD}><span style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{b.name}</span></td>
                <td style={TD}><span style={{ fontSize: "12px", color: ink2 }}>{b.manager}</span></td>
                <td style={TD}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "600", color: ink }}>{b.employees}</span></td>
                <td style={TD}>
                  {b.conversion > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "56px", height: "5px", background: DS.line, borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${b.conversion}%`, background: b.conversion >= 40 ? DS.teal : DS.gold, borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", fontWeight: "700", color: ink }}>{b.conversion}%</span>
                    </div>
                  ) : <span style={{ fontSize: "12px", color: ink2 }}>—</span>}
                </td>
                <td style={TD}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "700", color: DS.teal }}>{b.revenue}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── System Health row — Admin-only ────────────────────────────────────────────
function SystemHealth({ customers, card, bdr, ink, ink2 }) {
  const [ref, inView] = useInView();
  const total     = customers.length;
  const converted = customers.filter(c => c.status === "Converted").length;
  const convRate  = total ? Math.round((converted / total) * 100) : 0;
  const highPct   = total ? Math.round((customers.filter(c => c.priority === "High").length / total) * 100) : 0;
  const avgCibil  = total ? Math.round(customers.reduce((s, c) => s + (c.cibil || 0), 0) / total) : 0;

  const bars = [
    { label: "Conversion Rate",   value: convRate, color: DS.teal },
    { label: "High Priority %",   value: highPct,  color: DS.rust },
    { label: "Avg CIBIL (scaled)", value: Math.round(((avgCibil - 300) / 600) * 100), color: DS.gold },
  ];

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, padding: "16px" }}>
      <div style={{ ...TY.microLabel, color: ink2, marginBottom: "14px" }}>Portfolio Health</div>
      {bars.map((b, i) => (
        <div key={b.label} style={{ marginBottom: "12px", animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "12px", color: ink }}>{b.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", fontWeight: "700", color: b.color }}>{b.value}%</span>
          </div>
          <div style={{ height: "6px", background: DS.line, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: inView ? `${b.value}%` : "0%", background: b.color, borderRadius: "3px", transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Recent Audit Activity — Admin-only ────────────────────────────────────────
const RECENT_AUDIT = [
  { user: "Ankit Sharma", action: "Initiated Outreach",   target: "Meera Nair",    status: "Success", time: "2 min ago" },
  { user: "Unknown",      action: "Failed Login Attempt", target: "RM001",         status: "Failed",  time: "15 min ago" },
  { user: "Priya Mehta",  action: "Exported CSV Report",  target: "All Leads",     status: "Success", time: "1 hr ago" },
  { user: "Rajiv Nair",   action: "Created User",         target: "Sneha Kapoor",  status: "Success", time: "Yesterday" },
];

function RecentAudit({ card, bdr, ink, ink2, onNavigate }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TY.microLabel, color: ink2 }}>Recent Audit Activity</span>
        <button onClick={() => onNavigate("admin-audit")}
          style={{ background: "none", border: "none", fontSize: "11px", color: DS.gold, cursor: "pointer", fontWeight: "600", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          View all →
        </button>
      </div>
      {RECENT_AUDIT.map((log, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderBottom: i < RECENT_AUDIT.length - 1 ? `1px solid ${bdr}` : "none",
          display: "flex", alignItems: "center", gap: "12px",
          background: log.status === "Failed" ? (DS.rustSoft + "44") : "transparent",
          animation: inView ? `fadeUp 0.5s ease ${i * 60}ms both` : "none",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: ink }}>{log.user}</div>
            <div style={{ fontSize: "11px", color: ink2 }}>{log.action} · {log.target}</div>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: ink2, flexShrink: 0 }}>{log.time}</span>
          <span style={{
            background: log.status === "Failed" ? DS.rustSoft : DS.tealSoft,
            color: log.status === "Failed" ? DS.rust : DS.teal,
            fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px", flexShrink: 0,
          }}>{log.status}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboardPage({ onNavigate }) {
  const { darkMode, customers, analytics, dataLoading, addToast, exportCSV } = useApp();

  const bg   = darkMode ? DS.bg    : DS.page;
  const card = darkMode ? DS.bgSoft : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.line;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.sub;

  const total          = customers.length;
  const high           = customers.filter(c => c.priority === "High").length;
  const converted      = customers.filter(c => c.status === "Converted").length;
  const avgScore       = total ? Math.round(customers.reduce((s, c) => s + c.aiScore, 0) / total) : 0;
  const totalEmployees = BRANCHES.reduce((s, b) => s + b.employees, 0);

  // Quick-action shortcuts — Admin-specific set
  const quickActions = [
    { icon: "👤", label: "Users",     page: "admin-users",    accent: DS.navy,  accentBg: DS.bgSofter },
    { icon: "🏦", label: "Branches",  page: "admin-branches", accent: DS.teal,  accentBg: DS.tealSoft },
    { icon: "🔍", label: "Audit",     page: "admin-audit",    accent: DS.sub,   accentBg: DS.line },
    { icon: "📈", label: "Analytics", page: "analytics",      accent: DS.gold,  accentBg: DS.goldSoft },
    { icon: "👥", label: "Customers", page: "customers",      accent: DS.teal,  accentBg: DS.tealSoft },
    { icon: "📋", label: "Export",    page: null,             accent: DS.sub,   accentBg: DS.line },
  ];

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Admin Control Centre</h2>
          <p style={{ fontSize: "12px", color: ink2, margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {/* Quick-action shortcuts */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickActions.map(({ icon, label, page, accent, accentBg }) => (
            <QuickBtn key={label} icon={icon} label={label} accent={accent} accentBg={accentBg}
              onClick={() => page ? onNavigate(page) : exportCSV().then(() => addToast("CSV exported", "success")).catch(() => addToast("Export failed", "error"))}
            />
          ))}
        </div>
      </div>

      {/* 6 System KPIs — Admin-only numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", padding: "16px 24px 0" }}>
        {dataLoading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: card, borderRadius: "6px", padding: "16px", border: `1px solid ${bdr}`, height: "90px", animation: "shimmer 1.5s infinite" }} />
          ))
        ) : (
          <>
            <KPICard icon="👥" value={total}          label="Total Customers"  sub="System-wide"         accent={DS.navy}  accentBg={DS.bgSofter} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={0} />
            <KPICard icon="🔥" value={high}           label="High Priority"    sub="Immediate action"    accent={DS.rust}  accentBg={DS.rustSoft} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={60} />
            <KPICard icon="✅" value={converted}      label="Converted"        sub="Successful outcomes" accent={DS.teal}  accentBg={DS.tealSoft} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={120} />
            <KPICard icon="🤖" value={avgScore}       label="Avg AI Score"     sub="Model output"        accent={DS.gold}  accentBg={DS.goldSoft} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={180} />
            <KPICard icon="🏦" value={BRANCHES.length} label="Branches"        sub="Active locations"    accent={DS.teal}  accentBg={DS.tealSoft} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={240} />
            <KPICard icon="🧑‍💼" value={totalEmployees} label="Employees"       sub="Across all branches" accent={DS.gold}  accentBg={DS.goldSoft} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={300} />
          </>
        )}
      </div>

      {/* AI Model Status — Admin-only banner */}
      <div style={{ margin: "16px 24px 0" }}>
        <AIModelBanner analytics={analytics} />
      </div>

      {/* Branch Performance Table + Portfolio Health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", margin: "14px 24px 0", alignItems: "start" }}>
        <BranchTable card={card} bdr={bdr} ink={ink} ink2={ink2} darkMode={darkMode} />
        <div style={{ width: "260px" }}>
          <SystemHealth customers={customers} card={card} bdr={bdr} ink={ink} ink2={ink2} />
        </div>
      </div>

      {/* Recent Audit Activity — Admin-only */}
      <div style={{ margin: "14px 24px 0" }}>
        <RecentAudit card={card} bdr={bdr} ink={ink} ink2={ink2} onNavigate={onNavigate} />
      </div>

    </div>
  );
}

function QuickBtn({ icon, label, accent, accentBg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px",
        background: h ? accent : accentBg,
        color: h ? "#fff" : accent,
        border: `1px solid ${accent}30`,
        borderRadius: "5px", fontSize: "12px", fontWeight: "600",
        cursor: "pointer", transition: "all 0.15s",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
      <span>{icon}</span>{label}
    </button>
  );
}
