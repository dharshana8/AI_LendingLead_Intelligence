import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useCountUp, useInView } from "../hooks";
import DetailPanel from "../components/DetailPanel";
import { apiUpdateCustomer } from "../services/api";
import { T, type as TY } from "../tokens";

const DS = T;

function useTheme(darkMode) {
  return {
    bg:   darkMode ? DS.bg    : DS.page,
    card: darkMode ? DS.bgSoft : DS.card,
    bdr:  darkMode ? "rgba(255,255,255,0.08)" : DS.line,
    ink:  darkMode ? DS.textDark  : DS.ink,
    ink2: darkMode ? DS.textMuted : DS.sub,
  };
}

function KPICard({ value, label, sub, accent, card, bdr, ink, ink2, delay = 0, isText = false }) {
  const num = isText ? 0 : (parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0);
  const animated = useCountUp(num, 1200, 0, delay);
  const display = isText ? value : (String(value).includes("%") ? `${animated}%` : animated);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      flex: "1 1 150px", background: card, borderRadius: "6px",
      padding: "18px 20px", border: `1px solid ${bdr}`,
      borderTop: `2px solid ${accent}`,
      animation: inView ? "fadeUp 0.5s ease both" : "none",
    }}>
      <div style={{ ...TY.bigNumber, fontSize: 26, color: ink, lineHeight: 1 }}>{display}</div>
      <div style={{ ...TY.cardTitle, color: ink, marginTop: 8 }}>{label}</div>
      <div style={{ ...TY.body, color: ink2, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ── RM Leaderboard — derived from real customers ─────────────────────────────
function buildLeaderboard(customers) {
  const map = {};
  customers.forEach(c => {
    const rm = c.assignedTo || c._raw?.assigned_to || "";
    if (!rm) return;
    if (!map[rm]) map[rm] = { name: rm, leads: 0, converted: 0 };
    map[rm].leads++;
    if (c.status === "Converted") map[rm].converted++;
  });
  return Object.values(map)
    .filter(r => r.name && r.name !== "Unassigned")
    .map(r => ({
      ...r,
      avatar: r.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      performance: r.leads > 0 ? Math.round((r.converted / r.leads) * 100 + r.leads * 2) : 0,
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5);
}

function RMLeaderboard({ card, bdr, ink, ink2, darkMode, customers }) {
  const [ref, inView] = useInView();
  const derived = buildLeaderboard(customers);
  // Fallback to static if no assigned data
  const sorted = derived.length > 0 ? derived : [
    { name: "Ankit Sharma", avatar: "AS", leads: 8,  converted: 4, performance: 92 },
    { name: "Sneha Kapoor", avatar: "SK", leads: 6,  converted: 2, performance: 85 },
    { name: "Rahul Desai",  avatar: "RD", leads: 5,  converted: 2, performance: 78 },
  ];
  const rankColors = [DS.gold, DS.sub, DS.rust];

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TY.microLabel, color: ink2 }}>RM Leaderboard</span>
        <span style={{ fontSize: "10px", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace" }}>This Month</span>
      </div>
      {sorted.map((rm, i) => (
        <div key={rm.name} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px",
          borderBottom: i < sorted.length - 1 ? `1px solid ${bdr}` : "none",
          animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
            background: i < 3 ? rankColors[i] + "22" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", fontWeight: "800",
            color: i < 3 ? rankColors[i] : ink2,
          }}>#{i + 1}</div>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", background: DS.gold,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: "700", color: DS.navy, flexShrink: 0,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>{rm.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{rm.name}</div>
            <div style={{ fontSize: "11px", color: ink2 }}>{rm.leads} leads · {rm.converted} converted</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: "700", color: rm.performance >= 85 ? DS.teal : DS.gold }}>{rm.performance}</div>
            <div style={{ height: "4px", width: "60px", background: DS.line, borderRadius: "2px", overflow: "hidden", marginTop: "4px" }}>
              <div style={{ height: "100%", width: `${rm.performance}%`, background: rm.performance >= 85 ? DS.teal : DS.gold, borderRadius: "2px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Escalation Queue ──────────────────────────────────────────────────────────
function EscalationQueue({ leads, onReassign, card, bdr, ink, ink2 }) {
  const [ref, inView] = useInView();
  const stale = leads.filter(c =>
    c.priority === "High" && c.status !== "Converted" && c.status !== "Applied"
  ).slice(0, 6);

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TY.microLabel, color: ink2 }}>Escalation Queue</span>
        <span style={{ fontSize: "10px", color: DS.rust, fontFamily: "'IBM Plex Mono', monospace" }}>{stale.length} high-priority</span>
      </div>
      {stale.length === 0 ? (
        <div style={{ padding: "28px 16px", textAlign: "center", color: ink2, fontSize: "12px" }}>No escalations — all high-priority leads are being worked</div>
      ) : stale.map((lead, i) => (
        <div key={lead.id} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px",
          borderBottom: i < stale.length - 1 ? `1px solid ${bdr}` : "none",
          animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{lead.name}</div>
            <div style={{ fontSize: "11px", color: ink2 }}>{lead.occupation} · Score {lead.aiScore}</div>
          </div>
          <span style={{ background: DS.rustSoft, color: DS.rust, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px", flexShrink: 0 }}>
            {lead.status}
          </span>
          {/* BM-only: Reassign */}
          <button onClick={() => onReassign(lead)}
            style={{ padding: "5px 10px", borderRadius: "4px", border: `1px solid ${DS.gold}`, background: "transparent", color: DS.gold, fontSize: "11px", fontWeight: "600", cursor: "pointer", flexShrink: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Reassign
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Pending Approvals ─────────────────────────────────────────────────────────
function PendingApprovals({ leads, onApprove, onReject, card, bdr, ink, ink2, savingId }) {
  const [ref, inView] = useInView();
  const applied = leads.filter(c => c.status === "Applied").slice(0, 5);

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TY.microLabel, color: ink2 }}>Pending Approvals</span>
        <span style={{ fontSize: "10px", color: DS.teal, fontFamily: "'IBM Plex Mono', monospace" }}>{applied.length} awaiting</span>
      </div>
      {applied.length === 0 ? (
        <div style={{ padding: "28px 16px", textAlign: "center", color: ink2, fontSize: "12px" }}>No pending approvals</div>
      ) : applied.map((lead, i) => (
        <div key={lead.id} style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px",
          borderBottom: i < applied.length - 1 ? `1px solid ${bdr}` : "none",
          animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{lead.name}</div>
            <div style={{ fontSize: "11px", color: ink2 }}>{lead.loan} · ₹{lead.income.toLocaleString("en-IN")}/mo</div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            {/* BM-only: Approve/Reject */}
            <button onClick={() => onApprove(lead)} disabled={savingId === lead.id}
              style={{ padding: "5px 10px", borderRadius: "4px", border: "none", background: DS.teal, color: "#fff", fontSize: "11px", fontWeight: "700", cursor: savingId === lead.id ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {savingId === lead.id ? "…" : "Approve"}
            </button>
            <button onClick={() => onReject(lead)} disabled={savingId === lead.id}
              style={{ padding: "5px 10px", borderRadius: "4px", border: `1px solid ${DS.rust}`, background: "transparent", color: DS.rust, fontSize: "11px", fontWeight: "600", cursor: savingId === lead.id ? "not-allowed" : "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Branch Funnel Comparison ──────────────────────────────────────────────────
function BranchFunnelComparison({ customers, card, bdr, ink, ink2, darkMode }) {
  const [ref, inView] = useInView();

  // Build real data from customer branch field
  const branchMap = {};
  customers.forEach(c => {
    const b = c.branch || c._raw?.branch || "";
    if (!b) return;
    if (!branchMap[b]) branchMap[b] = { total: 0, converted: 0 };
    branchMap[b].total++;
    if (c.status === "Converted") branchMap[b].converted++;
  });

  const data = Object.entries(branchMap)
    .map(([name, v]) => ({ name, ...v, rate: Math.round((v.converted / Math.max(1, v.total)) * 100) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div ref={ref} style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, padding: "16px" }}>
      <div style={{ ...TY.microLabel, color: ink2, marginBottom: "14px" }}>Branch Funnel Comparison</div>
      {data.map((b, i) => (
        <div key={b.name} style={{ marginBottom: "12px", animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: ink }}>{b.name}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: DS.gold }}>{b.rate}% conv</span>
          </div>
          <div style={{ height: "8px", background: DS.line, borderRadius: "4px", overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: inView ? `${(b.total / maxTotal) * 100}%` : "0%", background: DS.bgSoft, borderRadius: "4px", transition: `width 0.85s ease ${i * 80}ms`, position: "absolute" }} />
            <div style={{ height: "100%", width: inView ? `${(b.converted / maxTotal) * 100}%` : "0%", background: DS.teal, borderRadius: "4px", transition: `width 0.85s ease ${i * 80 + 200}ms`, position: "absolute" }} />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "3px" }}>
            <span style={{ fontSize: "10px", color: ink2 }}>{b.total} leads</span>
            <span style={{ fontSize: "10px", color: DS.teal }}>{b.converted} converted</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reassign Modal ────────────────────────────────────────────────────────────
const STATIC_RMS = ["Ankit Sharma (RM001)", "Sneha Kapoor (RM002)", "Rahul Desai (RM003)", "Arjun Pillai (RM004)"];

function ReassignModal({ lead, onConfirm, onCancel, card, bdr, ink, ink2 }) {
  const [assignTo, setAssignTo] = useState(STATIC_RMS[0]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,26,43,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: card, borderRadius: "8px", padding: "24px", width: "100%", maxWidth: "360px", border: `1px solid ${bdr}` }}>
        <div style={{ fontSize: "15px", fontWeight: "600", color: ink, marginBottom: "6px" }}>Reassign Lead</div>
        <div style={{ fontSize: "12px", color: ink2, marginBottom: "16px" }}>Reassign <strong>{lead.name}</strong> to:</div>
        <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${bdr}`, borderRadius: "6px", fontSize: "13px", color: ink, background: card, outline: "none", marginBottom: "16px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {STATIC_RMS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
        </select>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", border: `1px solid ${DS.line}`, borderRadius: "6px", background: "transparent", color: ink2, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(assignTo)} style={{ flex: 1, padding: "9px", background: DS.gold, color: DS.navy, border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Reassign</button>
        </div>
      </div>
    </div>
  );
}

// ── Main BM Dashboard ─────────────────────────────────────────────────────────
export default function BMDashboardPage({ onNavigate }) {
  const { darkMode, customers, dataLoading, refetch, addToast, exportCSV } = useApp();
  const { bg, card, bdr, ink, ink2 } = useTheme(darkMode);
  const [selected, setSelected] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [reassignLead, setReassignLead] = useState(null);
  const [localCustomers, setLocalCustomers] = useState(null);

  const displayCustomers = localCustomers ?? customers;

  // Branch KPIs
  const converted   = displayCustomers.filter(c => c.status === "Converted").length;
  const convRate    = displayCustomers.length ? Math.round((converted / displayCustomers.length) * 100) : 0;
  const escalations = displayCustomers.filter(c => c.priority === "High" && c.status !== "Converted").length;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const agingLeads  = displayCustomers.filter(c => {
    const lc = c._raw?.last_contact || c.lastContact || "";
    return lc && lc < sevenDaysAgo && c.status !== "Converted";
  }).length;
  const pendingApprovals = displayCustomers.filter(c => c.status === "Applied").length;

  const handleApprove = async (lead) => {
    setSavingId(lead.id);
    try {
      await apiUpdateCustomer(lead.id, { status: "Converted" });
      addToast(`${lead.name} approved — marked as Converted`, "success");
      refetch();
    } catch { addToast("Update failed", "error"); }
    finally { setSavingId(null); }
  };

  const handleReject = async (lead) => {
    setSavingId(lead.id);
    try {
      await apiUpdateCustomer(lead.id, { status: "New" });
      addToast(`${lead.name} application returned to New`, "info");
      refetch();
    } catch { addToast("Update failed", "error"); }
    finally { setSavingId(null); }
  };

  const handleReassign = async (assignTo) => {
    if (!reassignLead) return;
    setSavingId(reassignLead.id);
    try {
      await apiUpdateCustomer(reassignLead.id, { assigned_to: assignTo });
      addToast(`${reassignLead.name} reassigned to ${assignTo}`, "success");
      setReassignLead(null);
      refetch();
    } catch { addToast("Reassign failed", "error"); }
    finally { setSavingId(null); }
  };

  const handleOptimisticRemove = (id) => {
    setLocalCustomers(prev => (prev ?? customers).filter(c => c.id !== id));
  };

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Branch Manager Dashboard</h2>
          <p style={{ fontSize: "12px", color: ink2, margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <QuickBtn icon="📈" label="Analytics"  color={DS.teal}  onClick={() => onNavigate("analytics")} />
          <QuickBtn icon="📋" label="Export CSV" color={DS.gold}  onClick={() => exportCSV().then(() => addToast("CSV exported", "success")).catch(() => addToast("Export failed", "error"))} />
        </div>
      </div>

      {/* Branch KPI Row — 4 BM-specific KPIs */}
      <div style={{ display: "flex", gap: "12px", padding: "16px 24px 0", flexWrap: "wrap" }}>
        {dataLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} style={{ flex: "1 1 150px", background: card, borderRadius: "6px", padding: "18px", border: `1px solid ${bdr}`, height: "100px", animation: "shimmer 1.5s infinite" }} />
          ))
        ) : (
          <>
            <KPICard value={`${convRate}%`} label="Team Conversion"    sub="Branch conversion rate"  accent={DS.teal} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={0}   isText />
            <KPICard value={escalations}    label="Escalations Open"   sub="High-priority unworked"  accent={DS.rust} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={80} />
            <KPICard value={agingLeads}     label="Leads Aging >7d"    sub="No contact in 7+ days"   accent={DS.gold} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={160} />
            <KPICard value={pendingApprovals} label="Approvals Pending" sub="Applications awaiting"  accent={DS.teal} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={240} />
          </>
        )}
      </div>

      {/* Main grid: Leaderboard + Escalation Queue */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "14px", margin: "16px 24px 0" }}>
        <RMLeaderboard card={card} bdr={bdr} ink={ink} ink2={ink2} darkMode={darkMode} customers={displayCustomers} />
        <EscalationQueue
          leads={displayCustomers}
          onReassign={setReassignLead}
          card={card} bdr={bdr} ink={ink} ink2={ink2}
        />
      </div>

      {/* Pending Approvals + Branch Funnel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "14px", margin: "14px 24px 0" }}>
        <PendingApprovals
          leads={displayCustomers}
          onApprove={handleApprove}
          onReject={handleReject}
          card={card} bdr={bdr} ink={ink} ink2={ink2}
          savingId={savingId}
        />
        <BranchFunnelComparison
          customers={displayCustomers}
          card={card} bdr={bdr} ink={ink} ink2={ink2}
          darkMode={darkMode}
        />
      </div>

      <DetailPanel
        lead={selected}
        onClose={() => setSelected(null)}
        onRefresh={refetch}
        onOptimisticRemove={handleOptimisticRemove}
      />

      {reassignLead && (
        <ReassignModal
          lead={reassignLead}
          onConfirm={handleReassign}
          onCancel={() => setReassignLead(null)}
          card={card} bdr={bdr} ink={ink} ink2={ink2}
        />
      )}
    </div>
  );
}

function QuickBtn({ icon, label, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: h ? color : "transparent", color: h ? "#fff" : color, border: `1px solid ${color}`, borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <span>{icon}</span>{label}
    </button>
  );
}
