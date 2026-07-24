import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import LogCallModal from "../components/LogCallModal";
import { apiUpdateCustomer } from "../services/api";
import { T } from "../tokens";

const DS = T;

const STATUS_STYLE = {
  Completed:   { bg: DS.tealSoft, color: DS.teal },
  Pending:     { bg: DS.goldSoft, color: DS.gold },
  Upcoming:    { bg: "#EEF2FF",   color: "#3730A3" },
  Rescheduled: { bg: DS.rustSoft, color: DS.rust },
};

export default function FollowUpsPage() {
  const { darkMode, addToast, customers, refetch } = useApp();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("9:00 AM");
  const [savingId, setSavingId] = useState(null);
  const [logCallLead, setLogCallLead] = useState(null);

  const bg          = darkMode ? DS.bg      : DS.page;
  const cardBg      = darkMode ? DS.bgSoft  : DS.card;
  const border      = darkMode ? "rgba(255,255,255,0.08)" : DS.line;
  const textPrimary = darkMode ? DS.textDark  : DS.ink;
  const textSecondary = darkMode ? DS.textMuted : DS.sub;

  // Derive follow-ups: only customers with followup_date explicitly set
  const followups = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return customers
      .filter(c => c._raw?.followup_date)
      .map(c => {
        const rawDate = c._raw.followup_date;
        const displayDate = rawDate === today ? "Today"
          : rawDate === new Date(Date.now() + 86400000).toISOString().split("T")[0] ? "Tomorrow"
          : new Date(rawDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const followupStatus = c._raw?.status === "Rescheduled" ? "Rescheduled"
          : c._raw?.status === "Contacted" || c._raw?.status === "Converted" ? "Completed"
          : rawDate < today ? "Pending"
          : rawDate === today ? "Pending"
          : "Upcoming";
        return {
          ...c,
          followupDate: displayDate,
          followupTime: c._raw?.followup_time || "9:00 AM",
          followupStatus,
        };
      })
      .sort((a, b) => a._raw.followup_date.localeCompare(b._raw.followup_date));
  }, [customers]);

  const markDone = async (id) => {
    setSavingId(id);
    try {
      await apiUpdateCustomer(id, {
        status: "Contacted",
        last_contact: new Date().toISOString().split("T")[0],
      });
      addToast("Marked as done ✓", "success");
      refetch();
    } catch { addToast("Update failed", "error"); }
    finally { setSavingId(null); }
  };

  const openReschedule = (id) => {
    setRescheduleModal(id);
    setRescheduleDate("");
    setRescheduleTime("9:00 AM");
  };

  const confirmReschedule = async () => {
    if (!rescheduleDate) { addToast("Please pick a date", "error"); return; }
    setSavingId(rescheduleModal);
    try {
      await apiUpdateCustomer(rescheduleModal, {
        followup_date: rescheduleDate,
        followup_time: rescheduleTime,
        status: "Rescheduled",
      });
      const label = new Date(rescheduleDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      addToast(`Rescheduled to ${label} at ${rescheduleTime}`, "success");
      setRescheduleModal(null);
      refetch();
    } catch { addToast("Reschedule failed", "error"); }
    finally { setSavingId(null); }
  };

  const statuses = ["All", "Pending", "Upcoming", "Completed", "Rescheduled"];
  const filtered = filter === "All" ? followups : followups.filter(f => f.followupStatus === filter);
  const todayItems = followups.filter(f => f.followupDate === "Today");
  const pendingCount = followups.filter(f => f.followupStatus === "Pending").length;
  const completedCount = followups.filter(f => f.followupStatus === "Completed").length;

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: textPrimary, margin: 0 }}>Follow-ups</h2>
          <p style={{ fontSize: "12px", color: textSecondary, margin: "4px 0 0", fontFamily: "'IBM Plex Mono', monospace" }}>
            {todayItems.length} calls scheduled for today
          </p>
        </div>
        {/* Honest button — schedule is done via Lead Detail Panel */}
        <button
          onClick={() => addToast("Open a customer's Lead Detail Panel → Log Call to set a follow-up date", "info")}
          style={{ padding: "8px 18px", background: DS.gold, color: DS.bg, border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
          How to Schedule
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Today's Calls", value: todayItems.length,  bg: DS.goldSoft, color: DS.gold },
          { label: "Pending",       value: pendingCount,       bg: DS.goldSoft, color: DS.gold },
          { label: "Completed",     value: completedCount,     bg: DS.tealSoft, color: DS.teal },
          { label: "Total",         value: followups.length,   bg: darkMode ? "rgba(255,255,255,0.06)" : "#EDE9E0", color: textSecondary },
        ].map(({ label, value, bg: sbg, color }) => (
          <div key={label} style={{ flex: "1 1 120px", background: cardBg, borderRadius: "6px", padding: "14px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: sbg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: "16px", fontWeight: "800", color, flexShrink: 0 }}>{value}</div>
            <span style={{ fontSize: "12px", color: textSecondary, fontWeight: "500" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Today's Priority Calls */}
      {todayItems.length > 0 && (
        <div style={{ background: DS.bg, borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: DS.gold, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'IBM Plex Mono', monospace" }}>
            📞 Today's Priority Calls
          </div>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {todayItems.map(f => (
              <div key={f.id} style={{ background: DS.bgSoft, borderRadius: "6px", padding: "12px 14px", border: "1px solid rgba(199,154,61,0.2)", minWidth: "200px", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: DS.textDark }}>{f.name}</div>
                    <div style={{ fontSize: "11px", color: DS.textMuted }}>{f.occupation}</div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: DS.gold, background: "rgba(199,154,61,0.15)", padding: "2px 8px", borderRadius: "3px", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>{f.followupTime}</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <MiniBtn label="📞 Log Call" color={DS.teal} bg={DS.tealSoft} onClick={() => setLogCallLead(f)} />
                  <MiniBtn label="✓ Done" color={DS.teal} bg={DS.tealSoft} onClick={() => markDone(f.id)} disabled={f.followupStatus === "Completed" || savingId === f.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: "5px 14px", borderRadius: "3px", border: "1.5px solid",
              borderColor: filter === s ? DS.gold : border,
              background: filter === s ? DS.gold : "transparent",
              color: filter === s ? DS.bg : textSecondary,
              fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
            }}>{s}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: cardBg, borderRadius: "6px", border: `1px solid ${border}`, overflow: "hidden" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: textPrimary, marginBottom: "6px" }}>
              {filter === "All" ? "No follow-ups scheduled" : `No ${filter.toLowerCase()} follow-ups`}
            </div>
            <div style={{ fontSize: "12px", color: textSecondary }}>
              Open a customer → Log Call → set a follow-up date to schedule calls here.
            </div>
          </div>
        )}
        {filtered.map((f, i) => {
          const st = STATUS_STYLE[f.followupStatus] || { bg: "#f3f4f6", color: DS.sub };
          return (
            <div key={f.id} style={{
              padding: "13px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none",
              display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
              background: selected === f.id ? (darkMode ? "rgba(199,154,61,0.06)" : DS.goldSoft + "55") : "transparent",
              cursor: "pointer", transition: "background 0.15s",
            }} onClick={() => setSelected(selected === f.id ? null : f.id)}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: DS.gold, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
                {f.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{f.name}</div>
                <div style={{ fontSize: "11px", color: textSecondary }}>{f.occupation} · {f.loan}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Mono', monospace" }}>{f.followupDate}</div>
                <div style={{ fontSize: "11px", color: textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>{f.followupTime}</div>
              </div>
              <span style={{ background: st.bg, color: st.color, fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "3px" }}>{f.followupStatus}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <MiniBtn label="📞 Log Call" color={DS.teal} onClick={() => setLogCallLead(f)} />
                <MiniBtn label="✓ Done" color={DS.teal} onClick={() => markDone(f.id)} disabled={f.followupStatus === "Completed" || savingId === f.id} />
                <MiniBtn label="↻ Reschedule" color={DS.rust} onClick={() => openReschedule(f.id)} />
              </div>
            </div>
          );
        })}
      </div>

      {logCallLead && (
        <LogCallModal
          lead={logCallLead}
          onClose={() => setLogCallLead(null)}
          onSaved={() => { setLogCallLead(null); refetch(); }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: cardBg, borderRadius: "8px", padding: "24px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: `1px solid ${border}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: textPrimary }}>↻ Reschedule Follow-up</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>New Date</label>
                <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${border}`, borderRadius: "5px", fontSize: "13px", background: darkMode ? DS.bg : DS.page, color: textPrimary, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "10px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>Time Slot</label>
                <select value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${border}`, borderRadius: "5px", fontSize: "13px", background: darkMode ? DS.bg : DS.page, color: textPrimary, outline: "none" }}>
                  {["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:00 PM"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={() => setRescheduleModal(null)}
                style={{ padding: "8px 16px", borderRadius: "5px", border: `1px solid ${border}`, background: "transparent", color: textSecondary, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmReschedule} disabled={savingId === rescheduleModal}
                style={{ padding: "8px 16px", borderRadius: "5px", border: "none", background: DS.rust, color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                {savingId === rescheduleModal ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniBtn({ label, color, bg, onClick, disabled }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "4px 10px", borderRadius: "3px",
        border: `1px solid ${disabled ? DS.line : color}`,
        background: disabled ? "transparent" : h ? color : (bg || "transparent"),
        color: disabled ? DS.sub : h ? "#fff" : color,
        fontSize: "11px", fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
      }}>
      {label}
    </button>
  );
}
