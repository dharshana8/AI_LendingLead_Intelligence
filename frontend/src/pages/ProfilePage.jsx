import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ProfilePage() {
  const { user, darkMode, addToast, customers } = useApp();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "bm" ? "Branch Manager" : "Relationship Manager";
  const roleColor = user?.role === "admin" ? "#b91c1c" : user?.role === "bm" ? "#6d28d9" : "#1e40af";
  const roleBg = user?.role === "admin" ? "#fee2e2" : user?.role === "bm" ? "#f5f3ff" : "#eff6ff";

  const totalLeads = customers.length;
  const converted = customers.filter(c => c.status === "Converted").length;
  const highPriority = customers.filter(c => c.priority === "High").length;
  const avgScore = totalLeads ? Math.round(customers.reduce((s, c) => s + c.aiScore, 0) / totalLeads) : 0;
  const potentialRevenue = customers.reduce((s, c) => s + c.income * 48, 0);
  const revenueStr = potentialRevenue >= 10000000 ? `₹${(potentialRevenue / 10000000).toFixed(1)}Cr` : `₹${(potentialRevenue / 100000).toFixed(0)}L`;

  const achievements = [
    { icon: "🏆", title: "Top Performer", desc: "Q1 2025 — Best conversion rate in branch" },
    { icon: "⭐", title: "AI Champion", desc: "First to use AI scoring for 100% leads" },
    { icon: "💰", title: "Revenue Star", desc: `${revenueStr} business potential identified` },
    { icon: "🎯", title: "Accuracy Award", desc: `${avgScore} avg AI score across portfolio` },
  ];

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "16px", alignItems: "start" }}>

        {/* Left: Profile Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: cardBg, borderRadius: "14px", border: `1px solid ${border}`, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1e40af)", padding: "28px 20px", textAlign: "center" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%", margin: "0 auto 12px",
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", fontWeight: "800", color: "#fff",
                border: "3px solid rgba(255,255,255,0.4)",
              }}>{user?.avatar || user?.name?.slice(0,2).toUpperCase()}</div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: "#fff" }}>{user?.name}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{user?.branch}</div>
              <span style={{ display: "inline-block", marginTop: "10px", background: roleBg, color: roleColor, fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>{roleLabel}</span>
            </div>
            <div style={{ padding: "16px" }}>
              {[
                ["📧", "Email", user?.email || "—"],
                ["📱", "Phone", user?.phone || "—"],
                ["🏦", "Branch", user?.branch || "—"],
                ["📅", "Joined", user?.joined || "—"],
                ["🆔", "Employee ID", user?.employeeId || "—"],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: "10px", color: textSecondary }}>{label}</div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: textPrimary, marginBottom: "14px" }}>📊 Portfolio Stats</div>
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "42px", fontWeight: "800", color: "#22c55e" }}>{user?.performance || avgScore}</div>
              <div style={{ fontSize: "12px", color: textSecondary }}>Performance Score</div>
            </div>
            {[["Total Leads", totalLeads, "#1e40af"], ["High Priority", highPriority, "#22c55e"], ["Avg AI Score", avgScore, "#f59e0b"], ["Converted", converted, "#7c3aed"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ fontSize: "12px", color: textSecondary }}>{l}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Edit Profile */}
          <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>✏️ Edit Profile</span>
              <button onClick={() => { if (editing) addToast("Profile updated successfully", "success"); setEditing(e => !e); }}
                style={{ padding: "7px 16px", borderRadius: "8px", border: "1.5px solid #1e40af", background: editing ? "#1e40af" : "transparent", color: editing ? "#fff" : "#1e40af", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                {editing ? "Save Changes" : "Edit"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Full Name", value: user?.name || "", disabled: true },
                { label: "Employee ID", value: user?.employeeId || "", disabled: true },
                { label: "Branch", value: user?.branch || "", disabled: true },
                { label: "Role", value: roleLabel, disabled: true },
              ].map(({ label, value, disabled }) => (
                <div key={label}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>{label}</label>
                  <input value={value} disabled style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", background: darkMode ? "#0f172a" : "#f9fafb", color: textSecondary, outline: "none" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} disabled={!editing}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${editing ? "#1e40af" : border}`, borderRadius: "8px", fontSize: "13px", background: editing ? (darkMode ? "#1e293b" : "#fff") : (darkMode ? "#0f172a" : "#f9fafb"), color: textPrimary, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} disabled={!editing}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${editing ? "#1e40af" : border}`, borderRadius: "8px", fontSize: "13px", background: editing ? (darkMode ? "#1e293b" : "#fff") : (darkMode ? "#0f172a" : "#f9fafb"), color: textPrimary, outline: "none" }} />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary, marginBottom: "14px" }}>🏆 Achievements</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "10px" }}>
              {achievements.map(({ icon, title, desc }) => (
                <div key={title} style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px", padding: "14px", border: `1px solid ${border}` }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: textPrimary }}>{title}</div>
                  <div style={{ fontSize: "11px", color: textSecondary, marginTop: "4px", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
