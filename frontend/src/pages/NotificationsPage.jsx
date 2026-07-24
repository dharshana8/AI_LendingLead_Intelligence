import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const DS = {
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const TYPE_META = {
  lead:     { icon: "🎯", bg: DS.goldSoft,  color: DS.gold,  label: "Lead" },
  approval: { icon: "✅", bg: DS.tealSoft,  color: DS.teal,  label: "Approval" },
  reminder: { icon: "⏰", bg: DS.goldSoft,  color: DS.gold,  label: "Reminder" },
  assigned: { icon: "👤", bg: "#EDE9E0",    color: DS.ink2,  label: "Assigned" },
  info:     { icon: "ℹ️", bg: "#EDE9E0",    color: DS.ink2,  label: "Info" },
};

export default function NotificationsPage() {
  const { darkMode, notifications, markAllRead } = useApp();
  const [filter, setFilter] = useState("All");

  const bg    = darkMode ? DS.navy  : DS.bg;
  const card  = darkMode ? DS.navy2 : DS.card;
  const bdr   = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink   = darkMode ? DS.textDark  : DS.ink;
  const ink2  = darkMode ? DS.textMuted : DS.ink2;

  const types = ["All", "lead", "approval", "reminder", "assigned", "info"];
  const filtered = filter === "All" ? notifications : notifications.filter(n => n.type === filter);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Notifications</h2>
          <p style={{ fontSize: "13px", color: ink2, margin: "4px 0 0" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: DS.gold }}>{unread}</span> unread
          </p>
        </div>
        <button onClick={markAllRead} style={{
          padding: "8px 16px", borderRadius: "6px",
          border: `1px solid ${DS.border}`, background: "transparent",
          color: DS.gold, fontSize: "12px", fontWeight: "600", cursor: "pointer",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          ✓ Mark All Read
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
        {types.map(t => {
          const meta = TYPE_META[t];
          const active = filter === t;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "5px 14px", borderRadius: "20px",
              border: `1px solid ${active ? DS.gold : bdr}`,
              background: active ? DS.goldSoft : "transparent",
              color: active ? DS.gold : ink2,
              fontSize: "12px", fontWeight: active ? "600" : "400",
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'IBM Plex Sans', sans-serif",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {meta && <span style={{ fontSize: "11px" }}>{meta.icon}</span>}
              {t === "All" ? "All" : meta?.label || t}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔔</div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: ink, marginBottom: "6px" }}>No notifications</div>
            <div style={{ fontSize: "13px", color: ink2 }}>You're all caught up.</div>
          </div>
        ) : filtered.map((n, i) => {
          const meta = TYPE_META[n.type] || TYPE_META.info;
          return (
            <div key={n.id} style={{
              padding: "14px 18px",
              borderBottom: i < filtered.length - 1 ? `1px solid ${bdr}` : "none",
              background: n.read ? "transparent" : (darkMode ? "rgba(199,154,61,0.05)" : "#FDFAF4"),
              borderLeft: n.read ? "3px solid transparent" : `3px solid ${DS.gold}`,
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "6px",
                background: meta.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "15px", flexShrink: 0,
              }}>
                {meta.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{n.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: ink2, fontFamily: "'IBM Plex Mono', monospace" }}>{n.time}</span>
                    {!n.read && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: DS.gold }} />}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: ink2, marginTop: "3px", lineHeight: 1.55 }}>{n.message}</div>
                <span style={{
                  display: "inline-block", marginTop: "7px",
                  background: meta.bg, color: meta.color,
                  fontSize: "10px", fontWeight: "600", padding: "2px 8px",
                  borderRadius: "3px", letterSpacing: "0.04em",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>
                  {meta.label.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
