import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { leads } from "../data/mockData";

const FOLLOWUPS = leads.slice(0, 12).map((l, i) => ({
  ...l,
  followupDate: i < 4 ? "Today" : i < 7 ? "Tomorrow" : `Jun ${28 + i}`,
  followupTime: ["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM", "4:00 PM"][i % 6],
  status: i < 2 ? "Completed" : i < 5 ? "Pending" : i < 8 ? "Upcoming" : "Rescheduled",
  notes: i === 0 ? "Discussed Home Loan options. Customer interested." : i === 1 ? "Sent loan brochure via email." : "",
}));

const STATUS_COLORS = {
  Completed: ["#dcfce7", "#15803d"],
  Pending: ["#fef3c7", "#b45309"],
  Upcoming: ["#eff6ff", "#1e40af"],
  Rescheduled: ["#fee2e2", "#b91c1c"],
};

export default function FollowUpsPage() {
  const { darkMode, addToast } = useApp();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const statuses = ["All", "Pending", "Upcoming", "Completed", "Rescheduled"];
  const filtered = filter === "All" ? FOLLOWUPS : FOLLOWUPS.filter(f => f.status === filter);
  const todayItems = FOLLOWUPS.filter(f => f.followupDate === "Today");
  const pendingCount = FOLLOWUPS.filter(f => f.status === "Pending").length;
  const completedCount = FOLLOWUPS.filter(f => f.status === "Completed").length;

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Follow-ups</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>{todayItems.length} calls scheduled for today</p>
        </div>
        <button onClick={() => addToast("Follow-up scheduled", "success")}
          style={{ padding: "9px 18px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          + Schedule Follow-up
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Today's Calls", value: todayItems.length, color: "#1e40af", bg: "#eff6ff", icon: "📅" },
          { label: "Pending", value: pendingCount, color: "#b45309", bg: "#fef3c7", icon: "⏳" },
          { label: "Completed", value: completedCount, color: "#15803d", bg: "#dcfce7", icon: "✅" },
          { label: "Total", value: FOLLOWUPS.length, color: "#6b7280", bg: "#f3f4f6", icon: "📋" },
        ].map(({ label, value, color, bg: sbg, icon }) => (
          <div key={label} style={{ flex: "1 1 120px", background: cardBg, borderRadius: "10px", padding: "14px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: sbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{icon}</div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
              <div style={{ fontSize: "11px", color: textSecondary }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Priority Calls */}
      {todayItems.length > 0 && (
        <div style={{ background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", marginBottom: "12px" }}>📞 Today's Priority Calls</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {todayItems.map(f => (
              <div key={f.id} style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "1px solid #bfdbfe", flex: "1 1 200px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{f.name}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{f.occupation}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#1e40af", background: "#eff6ff", padding: "2px 8px", borderRadius: "20px" }}>{f.followupTime}</span>
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                  <button onClick={() => addToast(`Calling ${f.name}...`, "info")}
                    style={{ flex: 1, padding: "6px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>📞 Call</button>
                  <button onClick={() => addToast("Marked as completed", "success")}
                    style={{ flex: 1, padding: "6px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>✓ Done</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: "6px 14px", borderRadius: "20px", border: "1.5px solid",
              borderColor: filter === s ? "#1e40af" : border,
              background: filter === s ? "#1e40af" : "transparent",
              color: filter === s ? "#fff" : textSecondary,
              fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
            }}>{s}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
        {filtered.map((f, i) => {
          const [sbg, sc] = STATUS_COLORS[f.status] || ["#f3f4f6", "#374151"];
          return (
            <div key={f.id} style={{
              padding: "14px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none",
              display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap",
              background: selected === f.id ? (darkMode ? "rgba(30,64,175,0.1)" : "#eff6ff") : "transparent",
              cursor: "pointer", transition: "background 0.15s",
            }} onClick={() => setSelected(selected === f.id ? null : f.id)}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                {f.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{f.name}</div>
                <div style={{ fontSize: "11px", color: textSecondary }}>{f.occupation} · {f.loan}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary }}>{f.followupDate}</div>
                <div style={{ fontSize: "11px", color: textSecondary }}>{f.followupTime}</div>
              </div>
              <span style={{ background: sbg, color: sc, fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>{f.status}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <MiniBtn label="📞 Call" color="#1e40af" onClick={() => addToast(`Calling ${f.name}...`, "info")} />
                <MiniBtn label="✓ Done" color="#15803d" onClick={() => addToast("Marked complete", "success")} />
                <MiniBtn label="↻ Reschedule" color="#b45309" onClick={() => addToast("Rescheduled", "warning")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniBtn({ label, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${color}`, background: h ? color : "transparent", color: h ? "#fff" : color, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}
