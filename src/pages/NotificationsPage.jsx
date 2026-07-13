import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const TYPE_ICON = { lead: "🎯", approval: "✅", reminder: "⏰", assigned: "👤", info: "ℹ️" };
const TYPE_COLOR = {
  lead: ["#eff6ff", "#1e40af"], approval: ["#dcfce7", "#15803d"],
  reminder: ["#fef3c7", "#b45309"], assigned: ["#f5f3ff", "#6d28d9"], info: ["#f3f4f6", "#374151"],
};

export default function NotificationsPage() {
  const { darkMode, notifications, markAllRead } = useApp();
  const [filter, setFilter] = useState("All");

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const types = ["All", "lead", "approval", "reminder", "assigned", "info"];
  const filtered = filter === "All" ? notifications : notifications.filter(n => n.type === filter);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Notifications</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>{unread} unread notifications</p>
        </div>
        <button onClick={markAllRead} style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #1e40af", background: "transparent", color: "#1e40af", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          ✓ Mark All Read
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {types.map(t => (
          <FilterPill key={t} label={t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            active={filter === t} onClick={() => setFilter(t)} darkMode={darkMode} />
        ))}
      </div>

      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: textPrimary }}>No notifications</div>
          </div>
        ) : filtered.map((n, i) => {
          const [nbg, nc] = TYPE_COLOR[n.type] || ["#f3f4f6", "#374151"];
          return (
            <div key={n.id} style={{
              padding: "14px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none",
              background: n.read ? "transparent" : (darkMode ? "rgba(30,64,175,0.08)" : "#eff6ff"),
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: nbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                {TYPE_ICON[n.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{n.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: textSecondary }}>{n.time}</span>
                    {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1e40af" }} />}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: textSecondary, marginTop: "3px", lineHeight: 1.5 }}>{n.message}</div>
                <span style={{ display: "inline-block", marginTop: "6px", background: nbg, color: nc, fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>
                  {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick, darkMode }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: "20px", border: "1.5px solid",
      borderColor: active ? "#1e40af" : (darkMode ? "#334155" : "#e5e7eb"),
      background: active ? "#1e40af" : "transparent",
      color: active ? "#fff" : (darkMode ? "#94a3b8" : "#6b7280"),
      fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );
}
