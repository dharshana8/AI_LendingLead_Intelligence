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

const ROLE_PILL = {
  admin: { bg: DS.rustSoft,  color: DS.rust,  label: "Administrator" },
  bm:    { bg: DS.goldSoft,  color: DS.gold,  label: "Branch Manager" },
  rm:    { bg: DS.tealSoft,  color: DS.teal,  label: "Relationship Manager" },
};

export default function ProfilePage() {
  const { user, darkMode, addToast, customers } = useApp();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  const bg   = darkMode ? DS.navy  : DS.bg;
  const card = darkMode ? DS.navy2 : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.ink2;

  const role = ROLE_PILL[user?.role] || ROLE_PILL.rm;

  const totalLeads  = customers.length;
  const converted   = customers.filter(c => c.status === "Converted").length;
  const highPri     = customers.filter(c => c.priority === "High").length;
  const avgScore    = totalLeads ? Math.round(customers.reduce((s, c) => s + c.aiScore, 0) / totalLeads) : 0;
  const potRev      = customers.reduce((s, c) => s + c.income * 48, 0);
  const revenueStr  = potRev >= 10000000 ? `₹${(potRev / 10000000).toFixed(1)}Cr` : `₹${(potRev / 100000).toFixed(0)}L`;

  const kpis = [
    { label: "Total Leads",   value: totalLeads, color: DS.gold },
    { label: "High Priority", value: highPri,    color: DS.rust },
    { label: "Avg AI Score",  value: avgScore,   color: DS.teal },
    { label: "Converted",     value: converted,  color: DS.gold },
  ];

  const achievements = [
    { icon: "🏆", title: "Top Performer",  desc: "Q1 2025 — Best conversion rate in branch", unlocked: converted >= 5 },
    { icon: "⭐", title: "AI Champion",    desc: "First to use AI scoring for 100+ leads",   unlocked: totalLeads >= 10 },
    { icon: "💰", title: "Revenue Star",   desc: `${revenueStr} business potential identified`, unlocked: potRev > 0 },
    { icon: "🎯", title: "Accuracy Award", desc: `${avgScore} avg AI score across portfolio`,  unlocked: avgScore >= 60 },
  ];

  const inputBase = {
    width: "100%", padding: "9px 12px",
    border: `1px solid ${bdr}`, borderRadius: "6px",
    fontSize: "13px", background: darkMode ? DS.navy : "#FDFCFA",
    color: ink, outline: "none",
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "18px", alignItems: "start" }}>

        {/* ── Left: Profile card ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
            {/* Solid navy header strip */}
            <div style={{ background: DS.navy, padding: "28px 20px", textAlign: "center" }}>
              <div style={{
                width: "68px", height: "68px", borderRadius: "50%",
                margin: "0 auto 12px",
                background: DS.gold,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", fontWeight: "700", color: DS.navy,
                fontFamily: "'IBM Plex Mono', monospace",
                border: "3px solid rgba(255,255,255,0.15)",
              }}>
                {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: DS.textDark }}>{user?.name}</div>
              <div style={{ fontSize: "12px", color: DS.textMuted, marginTop: "3px" }}>{user?.branch}</div>
              <span style={{
                display: "inline-block", marginTop: "10px",
                background: role.bg, color: role.color,
                fontSize: "10px", fontWeight: "700",
                padding: "3px 10px", borderRadius: "3px",
                letterSpacing: "0.05em",
              }}>
                {role.label.toUpperCase()}
              </span>
            </div>

            {/* Details */}
            <div style={{ padding: "14px 16px" }}>
              {[
                ["📧", "Email",       user?.email       || "—"],
                ["📱", "Phone",       user?.phone       || "—"],
                ["🏦", "Branch",      user?.branch      || "—"],
                ["📅", "Joined",      user?.joined      || "—"],
                ["🆔", "Employee ID", user?.employeeId  || "—"],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${bdr}` }}>
                  <span style={{ fontSize: "13px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: "10px", color: ink2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: ink, marginTop: "1px", fontFamily: label === "Employee ID" ? "'IBM Plex Mono', monospace" : "inherit" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI stats */}
          <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: ink2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Portfolio Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {kpis.map(({ label, value, color }) => (
                <div key={label} style={{ background: darkMode ? DS.navy : DS.bg, borderRadius: "6px", padding: "12px", border: `1px solid ${bdr}` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", fontWeight: "700", color }}>{value}</div>
                  <div style={{ fontSize: "11px", color: ink2, marginTop: "3px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Edit profile */}
          <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: ink }}>Edit Profile</div>
              <button
                onClick={() => { if (editing) addToast("Contact details saved locally", "success"); setEditing(e => !e); }}
                style={{
                  padding: "7px 16px", borderRadius: "6px",
                  border: `1px solid ${DS.gold}`,
                  background: editing ? DS.gold : "transparent",
                  color: editing ? DS.navy : DS.gold,
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>
                {editing ? "Save Changes" : "Edit"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Full Name",    value: user?.name        || "", disabled: true },
                { label: "Employee ID",  value: user?.employeeId  || "", disabled: true },
                { label: "Branch",       value: user?.branch      || "", disabled: true },
                { label: "Role",         value: role.label,              disabled: true },
              ].map(({ label, value, disabled }) => (
                <div key={label}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
                  <input value={value} disabled style={{ ...inputBase, opacity: 0.6 }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} disabled={!editing}
                  style={{ ...inputBase, borderColor: editing ? DS.gold : bdr }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} disabled={!editing}
                  style={{ ...inputBase, borderColor: editing ? DS.gold : bdr }} />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, padding: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: ink2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Achievements</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "10px" }}>
              {achievements.map(({ icon, title, desc, unlocked }) => (
                <div key={title} style={{
                  background: unlocked ? (darkMode ? DS.navy : DS.bg) : (darkMode ? "rgba(255,255,255,0.03)" : "#F9F8F5"),
                  borderRadius: "6px", padding: "14px",
                  border: `1px solid ${unlocked ? DS.gold : bdr}`,
                  opacity: unlocked ? 1 : 0.5,
                }}>
                  <div style={{ fontSize: "22px", marginBottom: "8px", filter: unlocked ? "none" : "grayscale(1)" }}>{icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: unlocked ? ink : ink2 }}>{title}</div>
                  <div style={{ fontSize: "11px", color: ink2, marginTop: "4px", lineHeight: 1.5 }}>{desc}</div>
                  {unlocked && (
                    <span style={{ display: "inline-block", marginTop: "8px", background: DS.goldSoft, color: DS.gold, fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "3px", letterSpacing: "0.05em" }}>UNLOCKED</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
