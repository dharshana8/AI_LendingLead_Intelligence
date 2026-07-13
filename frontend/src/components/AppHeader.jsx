import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

const PAGE_LABELS = {
  dashboard: "Dashboard", leads: "Lead Intelligence", customers: "Customers",
  "ai-assistant": "AI Assistant", analytics: "Analytics", reports: "Reports",
  followups: "Follow-ups", notifications: "Notifications", settings: "Settings",
  profile: "Profile", "admin-users": "User Management", "admin-branches": "Branch Management",
  "admin-audit": "Audit Logs",
};

export default function AppHeader({ activePage, onNavigate }) {
  const { user, darkMode, setDarkMode, notifications, markAllRead, unreadCount, logout, addToast } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg = darkMode ? "#1e293b" : "#fff";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const border = darkMode ? "#334155" : "#e5e7eb";

  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <header style={{
      height: "70px", background: bg, borderBottom: `1px solid ${border}`,
      display: "flex", alignItems: "center", padding: "0 24px",
      justifyContent: "space-between", gap: "16px",
      boxShadow: darkMode ? "0 1px 0 #334155" : "0 1px 0 #e5e7eb",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      {/* LEFT: Breadcrumb */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: textSecondary }}>IDBI Bank</span>
          <span style={{ fontSize: "11px", color: textSecondary }}>›</span>
          <span style={{ fontSize: "11px", color: "#1e40af", fontWeight: "600" }}>{PAGE_LABELS[activePage] || "Dashboard"}</span>
        </div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: textPrimary, lineHeight: 1.2 }}>
          {PAGE_LABELS[activePage] || "Dashboard"}
        </div>
      </div>

      {/* CENTER: Search */}
      <div style={{ flex: 1, maxWidth: "360px", position: "relative" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: textSecondary }}>🔍</span>
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder="Search customers, leads, loans..."
          style={{
            width: "100%", padding: "8px 12px 8px 34px",
            border: `1.5px solid ${border}`, borderRadius: "8px",
            fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb",
            color: textPrimary, transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#1e40af"}
          onBlur={e => e.target.style.borderColor = border}
        />
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Date */}
        <span style={{ fontSize: "11px", color: textSecondary, display: "none", whiteSpace: "nowrap" }}
          className="hide-mobile">{today}</span>

        {/* Quick Add */}
        <QuickAddBtn darkMode={darkMode} onNavigate={onNavigate} addToast={addToast} />

        {/* Dark Mode */}
        <IconBtn onClick={() => setDarkMode(d => !d)} title={darkMode ? "Light Mode" : "Dark Mode"} darkMode={darkMode}>
          {darkMode ? "☀️" : "🌙"}
        </IconBtn>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <IconBtn onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} darkMode={darkMode}>
            <span style={{ position: "relative", display: "inline-block" }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: "-4px", right: "-4px",
                  background: "#ef4444", color: "#fff", borderRadius: "10px",
                  fontSize: "9px", fontWeight: "700", padding: "1px 4px", minWidth: "16px", textAlign: "center",
                }}>{unreadCount}</span>
              )}
            </span>
          </IconBtn>
          {notifOpen && <NotifDropdown notifications={notifications} onMarkAll={markAllRead} darkMode={darkMode} onClose={() => setNotifOpen(false)} onNavigate={onNavigate} />}
        </div>

        {/* Live Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "20px", padding: "4px 10px",
        }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600" }}>Live</span>
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }} style={{
            display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
            padding: "4px 8px", borderRadius: "8px", transition: "background 0.2s",
            background: profileOpen ? (darkMode ? "rgba(255,255,255,0.1)" : "#f3f4f6") : "transparent",
          }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.08)" : "#f3f4f6"}
            onMouseLeave={e => e.currentTarget.style.background = profileOpen ? (darkMode ? "rgba(255,255,255,0.1)" : "#f3f4f6") : "transparent"}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700", color: "#fff",
            }}>{user?.avatar}</div>
            <div style={{ display: "none" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary }}>{user?.name}</div>
              <div style={{ fontSize: "10px", color: textSecondary }}>{user?.branch}</div>
            </div>
            <span style={{ fontSize: "10px", color: textSecondary }}>▼</span>
          </div>
          {profileOpen && (
            <ProfileDropdown user={user} darkMode={darkMode}
              onProfile={() => { onNavigate("profile"); setProfileOpen(false); }}
              onSettings={() => { onNavigate("settings"); setProfileOpen(false); }}
              onLogout={() => { logout(); addToast("Logged out successfully", "info"); }}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>
    </header>
  );
}

function IconBtn({ children, onClick, darkMode, title }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: "36px", height: "36px", borderRadius: "8px", border: "none",
        background: h ? (darkMode ? "rgba(255,255,255,0.1)" : "#f3f4f6") : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", transition: "background 0.2s",
      }}>{children}</button>
  );
}

function QuickAddBtn({ darkMode, onNavigate, addToast }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => { onNavigate("customers"); addToast("Opening customer module", "info"); }}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "7px 14px", borderRadius: "8px", border: "none",
        background: h ? "#1e3a8a" : "#1e40af", color: "#fff",
        fontSize: "12px", fontWeight: "600", cursor: "pointer",
        transition: "background 0.2s", whiteSpace: "nowrap",
      }}>+ Add Customer</button>
  );
}

function NotifDropdown({ notifications, onMarkAll, darkMode, onClose, onNavigate }) {
  const bg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const typeIcon = { lead: "🎯", approval: "✅", reminder: "⏰", assigned: "👤", info: "ℹ️" };

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: "340px", background: bg, borderRadius: "12px",
      border: `1px solid ${border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>Notifications</span>
        <button onClick={onMarkAll} style={{ background: "none", border: "none", fontSize: "12px", color: "#1e40af", cursor: "pointer", fontWeight: "600" }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            padding: "12px 16px", borderBottom: `1px solid ${border}`,
            background: n.read ? "transparent" : (darkMode ? "rgba(30,64,175,0.1)" : "#eff6ff"),
            cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.05)" : "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : (darkMode ? "rgba(30,64,175,0.1)" : "#eff6ff")}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{typeIcon[n.type] || "ℹ️"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{n.title}</div>
                <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px", lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ fontSize: "11px", color: textSecondary, marginTop: "4px" }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1e40af", flexShrink: 0, marginTop: "4px" }} />}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${border}`, textAlign: "center" }}>
        <button onClick={() => { onNavigate("notifications"); onClose(); }} style={{ background: "none", border: "none", fontSize: "12px", color: "#1e40af", cursor: "pointer", fontWeight: "600" }}>
          View All Notifications →
        </button>
      </div>
    </div>
  );
}

function ProfileDropdown({ user, darkMode, onProfile, onSettings, onLogout }) {
  const bg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "bm" ? "Branch Manager" : "Relationship Manager";

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: "220px", background: bg, borderRadius: "12px",
      border: `1px solid ${border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: textPrimary }}>{user?.name}</div>
        <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>{roleLabel}</div>
        <div style={{ fontSize: "11px", color: textSecondary }}>{user?.branch}</div>
      </div>
      {[
        { icon: "👤", label: "My Profile", action: onProfile },
        { icon: "⚙️", label: "Settings", action: onSettings },
      ].map(({ icon, label, action }) => (
        <DropItem key={label} icon={icon} label={label} onClick={action} darkMode={darkMode} textPrimary={textPrimary} />
      ))}
      <div style={{ borderTop: `1px solid ${border}` }}>
        <DropItem icon="🚪" label="Sign Out" onClick={onLogout} darkMode={darkMode} textPrimary="#ef4444" danger />
      </div>
    </div>
  );
}

function DropItem({ icon, label, onClick, darkMode, textPrimary, danger }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: "100%", padding: "10px 16px", background: h ? (darkMode ? "rgba(255,255,255,0.06)" : "#f9fafb") : "transparent",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
        fontSize: "13px", color: textPrimary, fontWeight: "500", transition: "background 0.15s",
      }}>
      <span>{icon}</span>{label}
    </button>
  );
}
