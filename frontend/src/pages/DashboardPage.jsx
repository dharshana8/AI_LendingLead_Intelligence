import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useCountUp, useInView } from "../hooks";
import DetailPanel from "../components/DetailPanel";
import AIvsCIBIL from "../components/AIvsCIBIL";
import { apiUpdateCustomer } from "../services/api";
import { T, type as TY } from "../tokens";

// ── Shared helpers ────────────────────────────────────────────────────────────
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

// ── Count-up KPI card ─────────────────────────────────────────────────────────
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

// ── Today's Action List row ───────────────────────────────────────────────────
function ActionRow({ lead, onView, onAction, actionLabel, actionColor, saving }) {
  const [h, setH] = useState(false);
  const priorityColor = lead.priority === "High" ? DS.rust : lead.priority === "Medium" ? DS.gold : DS.teal;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px",
        background: h ? DS.goldSoft : "transparent",
        borderBottom: `1px solid ${DS.line}`, transition: "background 0.15s",
        cursor: "pointer",
      }}
      onClick={() => onView(lead)}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "50%", background: DS.bgSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: "700", color: DS.gold, flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {lead.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: DS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.name}</div>
        <div style={{ fontSize: "11px", color: DS.sub }}>{lead.occupation} · {lead.loan}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", fontWeight: "700", color: priorityColor }}>{lead.aiScore}</div>
        <div style={{ fontSize: "10px", color: DS.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lead.priority}</div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAction(lead); }}
        disabled={saving}
        style={{
          padding: "6px 12px", borderRadius: "4px", border: "none",
          background: saving ? DS.line : actionColor,
          color: saving ? DS.sub : DS.bg,
          fontSize: "11px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
          whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.15s",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
        {saving ? "…" : actionLabel}
      </button>
    </div>
  );
}

// ── AI Insights card ──────────────────────────────────────────────────────────
function InsightsCard({ insights, card, bdr, ink, ink2 }) {
  const [ref, inView] = useInView();
  if (!insights?.length) return null;
  return (
    <div ref={ref} style={{ margin: "16px 24px 0", background: DS.navy, borderRadius: "6px", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: DS.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontFamily: "'IBM Plex Mono', monospace" }}>
        🤖 AI Insights
      </div>
      {insights.slice(0, 3).map((insight, i) => (
        <div key={i} style={{
          display: "flex", gap: "10px", marginBottom: "8px",
          animation: inView ? `fadeUp 0.5s ease ${i * 80}ms both` : "none",
        }}>
          <span style={{ color: DS.gold, fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>●</span>
          <span style={{ fontSize: "12px", color: DS.textMuted, lineHeight: 1.55 }}>{insight}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main RM Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage({ onNavigate }) {
  const { darkMode, addToast, customers, analytics, dataLoading, dataError, refetch, loadSample, exportCSV, user } = useApp();
  const { bg, card, bdr, ink, ink2 } = useTheme(darkMode);
  const [selected, setSelected] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [localCustomers, setLocalCustomers] = useState(null);

  const displayCustomers = localCustomers ?? customers;

  // RM-scoped KPIs
  const myLeads     = displayCustomers.length;
  const myHigh      = displayCustomers.filter(c => c.priority === "High").length;
  const myScore     = myLeads ? Math.round(displayCustomers.reduce((s, c) => s + c.aiScore, 0) / myLeads) : 0;
  const myConverted = displayCustomers.filter(c => c.status === "Converted").length;
  const myConvRate  = myLeads ? Math.round((myConverted / myLeads) * 100) : 0;

  // Today's Action List — 3 buckets in priority order
  const actionList = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const overdue = displayCustomers.filter(c =>
      c._raw?.followup_date && c._raw.followup_date < today && c.status !== "Converted"
    );
    const untouched = displayCustomers.filter(c =>
      c.priority === "High" && c.status === "New" && !c._raw?.followup_date
    );
    const pending = displayCustomers.filter(c => c.status === "Applied");
    // Merge, deduplicate, cap at 8
    const seen = new Set();
    const merged = [...overdue, ...untouched, ...pending].filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    // Fallback: if no structured data, show top high-priority leads
    if (merged.length === 0) {
      return displayCustomers
        .filter(c => c.priority === "High" && c.status !== "Converted")
        .slice(0, 8);
    }
    return merged.slice(0, 8);
  }, [displayCustomers]);

  const getActionConfig = (lead) => {
    const today = new Date().toISOString().split("T")[0];
    if (lead._raw?.followup_date && lead._raw.followup_date < today) {
      return { label: "Log Call", color: DS.rust, action: "log" };
    }
    if (lead.status === "Applied") {
      return { label: "Follow Up", color: DS.teal, action: "followup" };
    }
    return { label: "Initiate Outreach", color: DS.gold, action: "outreach" };
  };

  const handleAction = async (lead) => {
    const { action } = getActionConfig(lead);
    setSavingId(lead.id);
    try {
      if (action === "outreach") {
        await apiUpdateCustomer(lead.id, {
          status: "Contacted",
          assigned_to: user?.name || "",
          last_contact: new Date().toISOString().split("T")[0],
        });
        addToast(`Outreach initiated for ${lead.name}`, "success");
      } else if (action === "followup" || action === "log") {
        await apiUpdateCustomer(lead.id, {
          last_contact: new Date().toISOString().split("T")[0],
        });
        addToast(`${lead.name} — contact logged`, "success");
      }
      refetch();
    } catch { addToast("Update failed", "error"); }
    finally { setSavingId(null); }
  };

  const handleOptimisticRemove = (id) => {
    setLocalCustomers(prev => (prev ?? customers).filter(c => c.id !== id));
  };

  const handleExport = async () => {
    try { await exportCSV(); addToast("CSV exported", "success"); }
    catch { addToast("Export failed", "error"); }
  };

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Quick Actions */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ ...TY.microLabel, color: ink2 }}>Quick Actions</span>
          <span style={{ fontSize: "10px", color: ink2, fontFamily: "'IBM Plex Mono', monospace" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { label: "Add Customer",  action: () => onNavigate("customers"), accent: DS.gold },
            { label: "AI Report",     action: () => onNavigate("reports"),   accent: DS.navy },
            { label: "Analytics",     action: () => onNavigate("analytics"), accent: DS.teal },
            { label: "AI Assistant",  action: () => onNavigate("ai-assistant"), accent: DS.teal },
            { label: "Export CSV",    action: handleExport,                  accent: DS.sub },
          ].map(({ label, action, accent }) => (
            <QABtn key={label} label={label} accent={accent} darkMode={darkMode} onClick={action} />
          ))}
        </div>
      </div>

      {/* Personal KPI Row */}
      <div style={{ display: "flex", gap: "12px", padding: "16px 24px 0", flexWrap: "wrap" }}>
        {dataLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} style={{ flex: "1 1 150px", background: card, borderRadius: "6px", padding: "18px", border: `1px solid ${bdr}`, height: "100px", animation: "shimmer 1.5s infinite" }} />
          ))
        ) : (
          <>
            <KPICard value={myLeads}     label="My Leads"       sub="Active pipeline"    accent={DS.navy}  card={card} bdr={bdr} ink={ink} ink2={ink2} delay={0} />
            <KPICard value={myHigh}      label="High Priority"  sub="Immediate action"   accent={DS.gold}  card={card} bdr={bdr} ink={ink} ink2={ink2} delay={80} />
            <KPICard value={myScore}     label="My Avg Score"   sub="AI lead score"      accent={DS.teal}  card={card} bdr={bdr} ink={ink} ink2={ink2} delay={160} />
            <KPICard value={`${myConvRate}%`} label="My Conversion" sub="vs 15% industry" accent={DS.gold} card={card} bdr={bdr} ink={ink} ink2={ink2} delay={240} isText />
          </>
        )}
      </div>

      {/* AI Insights */}
      <InsightsCard insights={analytics?.insights} card={card} bdr={bdr} ink={ink} ink2={ink2} />

      {/* Today's Action List */}
      <div style={{ margin: "16px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ ...TY.microLabel, color: ink2 }}>Today's Action List</span>
          <span style={{ fontSize: "11px", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace" }}>
            {actionList.length} leads need attention
          </span>
        </div>

        {dataError ? (
          <div style={{ background: card, borderRadius: "6px", border: "1px solid #D4896E", padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: DS.rust, marginBottom: "6px" }}>Backend Connection Error</div>
            <div style={{ fontSize: "12px", color: ink2, marginBottom: "16px" }}>{dataError}</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <ActionBtn label="Retry" onClick={refetch} primary />
              <ActionBtn label="Load Sample Data" onClick={async () => { try { await loadSample(); addToast("Sample data loaded", "success"); } catch { addToast("Failed", "error"); } }} />
            </div>
          </div>
        ) : dataLoading ? (
          <div style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${bdr}`, display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: bdr, animation: "shimmer 1.5s infinite", flexShrink: 0 }} />
                {[120, 80, 60, 80].map((w, j) => (
                  <div key={j} style={{ height: "10px", width: w, background: bdr, borderRadius: "2px", animation: "shimmer 1.5s infinite" }} />
                ))}
              </div>
            ))}
          </div>
        ) : actionList.length === 0 ? (
          <div style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "10px" }}>✅</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: ink, marginBottom: "6px" }}>All caught up!</div>
            <div style={{ fontSize: "12px", color: ink2, marginBottom: "16px" }}>No pending actions. Load sample data to get started.</div>
            <ActionBtn label="Load Sample Data" onClick={async () => { try { await loadSample(); addToast("Sample data loaded", "success"); } catch { addToast("Failed", "error"); } }} primary />
          </div>
        ) : (
          <div style={{ background: card, borderRadius: "6px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
            {actionList.map((lead, i) => {
              const { label, color } = getActionConfig(lead);
              return (
                <ActionRow
                  key={lead.id}
                  lead={lead}
                  onView={setSelected}
                  onAction={handleAction}
                  actionLabel={label}
                  actionColor={color}
                  saving={savingId === lead.id}
                />
              );
            })}
            {displayCustomers.length > 8 && (
              <div style={{ padding: "10px 16px", textAlign: "center", borderTop: `1px solid ${bdr}` }}>
                <button onClick={() => onNavigate("customers")}
                  style={{ background: "none", border: "none", color: DS.gold, fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  View all {displayCustomers.length} customers →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI vs CIBIL chart — RM-specific tool */}
      <AIvsCIBIL />

      <DetailPanel
        lead={selected}
        onClose={() => setSelected(null)}
        onRefresh={refetch}
        onOptimisticRemove={handleOptimisticRemove}
      />
    </div>
  );
}

function QABtn({ label, accent, darkMode, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "7px 14px", borderRadius: "4px", fontSize: "11px", fontWeight: "600",
        cursor: "pointer", border: `1px solid ${h ? accent : (darkMode ? "rgba(255,255,255,0.1)" : DS.line)}`,
        background: h ? accent : "transparent",
        color: h ? (accent === DS.navy || accent === DS.sub ? DS.textDark : DS.navy) : (darkMode ? DS.textMuted : DS.sub),
        transition: "all 0.15s", fontFamily: "'IBM Plex Sans', sans-serif",
      }}>{label}</button>
  );
}

function ActionBtn({ label, onClick, primary }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "8px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: "600",
        cursor: "pointer", border: `1px solid ${primary ? DS.gold : DS.line}`,
        background: primary ? (h ? "#B8892E" : DS.gold) : "transparent",
        color: primary ? DS.navy : DS.sub,
        transition: "all 0.15s", fontFamily: "'IBM Plex Sans', sans-serif",
      }}>{label}</button>
  );
}
