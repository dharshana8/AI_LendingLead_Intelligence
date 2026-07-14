import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

const PAGE_LABELS = {
  dashboard: "Dashboard", leads: "Lead Intelligence", customers: "Customers",
  "ai-assistant": "AI Assistant", analytics: "Analytics", reports: "Reports",
  followups: "Follow-ups", notifications: "Notifications", settings: "Settings",
  profile: "Profile", "admin-users": "User Management",
  "admin-branches": "Branch Management", "admin-audit": "Audit Logs",
};

const DS = {
  navy: "#0E1A2B", gold: "#C79A3D", goldSoft: "#F1E3C3",
  ink: "#12181F", ink2: "#5C6672", bg: "#F5F3ED",
  card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
  teal: "#2F6E63", rust: "#B5482F",
};

export default function AppHeader({ activePage, onNavigate }) {
  const { user, darkMode, setDarkMode, notifications, markAllRead, unreadCount, logout, addToast } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  const bg = darkMode ? DS.navy : DS.card;
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const textPrimary = darkMode ? DS.textDark : DS.ink;
  const textSecondary = darkMode ? DS.textMuted : DS.ink2;

  return (
    <header style={{
      height: "64px", background: bg,
      borderBottom: `1px solid ${borderColor}`,
      display: "flex", alignItems: "center", padding: "0 24px",
      justifyContent: "space-between", gap: "16px",
      position: "sticky", top: 0, zIndex: 40,
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      {/* LEFT: breadcrumb + page title */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "10px", color: textSecondary, fontWeight: "500", letterSpacing: "0.04em" }}>IDBI Bank</span>
          <span style={{ fontSize: "10px", color: textSecondary }}>›</span>
          <span style={{ fontSize: "10px", color: DS.gold, fontWeight: "600", letterSpacing: "0.04em" }}>{PAGE_LABELS[activePage] || "Dashboard"}</span>
        </div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: textPrimary, lineHeight: 1.2, marginTop: "1px" }}>
          {PAGE_LABELS[activePage] || "Dashboard"}
        </div>
      </div>

      {/* RIGHT: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>

        {/* Add Customer */}
        <HeaderBtn
          onClick={() => { onNavigate("customers"); }}
          style={{ background: DS.gold, color: DS.navy, border: "none", padding: "7px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap" }}
          label="+ Add Customer"
        />

        {/* Dark mode */}
        <IconBtn onClick={() => setDarkMode(d => !d)} darkMode={darkMode} title={darkMode ? "Light Mode" : "Dark Mode"}>
          {darkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </IconBtn>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <IconBtn onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} darkMode={darkMode} active={notifOpen}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: "-5px", right: "-5px",
                  background: DS.rust, color: "#fff", borderRadius: "10px",
                  fontSize: "8px", fontWeight: "700", padding: "1px 4px",
                  minWidth: "14px", textAlign: "center",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>{unreadCount}</span>
              )}
            </span>
          </IconBtn>
          {notifOpen && (
            <NotifDropdown
              notifications={notifications} onMarkAll={markAllRead}
              darkMode={darkMode} onClose={() => setNotifOpen(false)}
              onNavigate={onNavigate}
            />
          )}
        </div>

        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          background: darkMode ? "rgba(47,110,99,0.15)" : DS.tealSoft || "#DCEAE6",
          border: `1px solid rgba(47,110,99,0.3)`,
          borderRadius: "20px", padding: "4px 10px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: DS.teal, animation: "pulse 1.8s infinite" }} />
          <span style={{ fontSize: "10px", color: DS.teal, fontWeight: "600", fontFamily: "'IBM Plex Mono', monospace" }}>LIVE</span>
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
              padding: "5px 8px", borderRadius: "6px", border: `1px solid ${profileOpen ? DS.gold : "transparent"}`,
              background: profileOpen ? (darkMode ? "rgba(199,154,61,0.1)" : DS.goldSoft) : "transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.06)" : DS.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = profileOpen ? (darkMode ? "rgba(199,154,61,0.1)" : DS.goldSoft) : "transparent"; }}
          >
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: DS.gold, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px", fontWeight: "700",
              color: DS.navy, fontFamily: "'IBM Plex Mono', monospace",
            }}>{user?.avatar}</div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {profileOpen && (
            <ProfileDropdown user={user} darkMode={darkMode}
              onProfile={() => { onNavigate("profile"); setProfileOpen(false); }}
              onSettings={() => { onNavigate("settings"); setProfileOpen(false); }}
              onLogout={() => { logout(); addToast("Logged out successfully", "info"); }}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}`}</style>
    </header>
  );
}

function HeaderBtn({ onClick, style, label }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...style, opacity: h ? 0.88 : 1, transition: "opacity 0.15s" }}>
      {label}
    </button>
  );
}

function IconBtn({ children, onClick, darkMode, title, active }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: "34px", height: "34px", borderRadius: "5px", border: "none",
        background: active || h ? (darkMode ? "rgba(255,255,255,0.1)" : "#EDE9E0") : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        color: darkMode ? "#8CA0BC" : "#5C6672", transition: "background 0.15s",
      }}>{children}</button>
  );
}

function NotifDropdown({ notifications, onMarkAll, darkMode, onClose, onNavigate }) {
  const bg = darkMode ? "#152540" : "#FFFFFF";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E4DFD1";
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";

  const typeColors = {
    lead: "#C79A3D", approval: "#2F6E63", reminder: "#C79A3D",
    assigned: "#5C6672", info: "#5C6672",
  };

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: "340px", background: bg, borderRadius: "6px",
      border: `1px solid ${border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>Notifications</span>
        <button onClick={onMarkAll} style={{ background: "none", border: "none", fontSize: "11px", color: "#C79A3D", cursor: "pointer", fontWeight: "600", fontFamily: "'IBM Plex Sans', sans-serif" }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            padding: "11px 16px", borderBottom: `1px solid ${border}`,
            background: n.read ? "transparent" : (darkMode ? "rgba(199,154,61,0.06)" : "#FDFAF4"),
            borderLeft: n.read ? "2px solid transparent" : `2px solid #C79A3D`,
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: typeColors[n.type] || "#5C6672", marginTop: "5px", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>{n.title}</div>
                <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px", lineHeight: 1.45 }}>{n.message}</div>
                <div style={{ fontSize: "10px", color: textSecondary, marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace" }}>{n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${border}`, textAlign: "center" }}>
        <button onClick={() => { onNavigate("notifications"); onClose(); }}
          style={{ background: "none", border: "none", fontSize: "11px", color: "#C79A3D", cursor: "pointer", fontWeight: "600", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          View all notifications →
        </button>
      </div>
    </div>
  );
}

function ProfileDropdown({ user, darkMode, onProfile, onSettings, onLogout }) {
  const bg = darkMode ? "#152540" : "#FFFFFF";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E4DFD1";
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";
  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "bm" ? "Branch Manager" : "Relationship Manager";

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: "210px", background: bg, borderRadius: "6px",
      border: `1px solid ${border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      zIndex: 200, overflow: "hidden",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>{user?.name}</div>
        <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>{roleLabel}</div>
        <div style={{ display: "inline-block", marginTop: "6px", background: "#F1E3C3", color: "#C79A3D", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "3px", fontFamily: "'IBM Plex Mono', monospace" }}>{user?.employeeId}</div>
      </div>
      {[
        { label: "My Profile", action: onProfile },
        { label: "Settings", action: onSettings },
      ].map(({ label, action }) => (
        <DropItem key={label} label={label} onClick={action} darkMode={darkMode} textPrimary={textPrimary} />
      ))}
      <div style={{ borderTop: `1px solid ${border}` }}>
        <DropItem label="Sign Out" onClick={onLogout} darkMode={darkMode} textPrimary="#B5482F" />
      </div>
    </div>
  );
}

function DropItem({ label, onClick, darkMode, textPrimary }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: "100%", padding: "9px 16px",
        background: h ? (darkMode ? "rgba(255,255,255,0.05)" : "#F5F3ED") : "transparent",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center",
        fontSize: "12px", color: textPrimary, fontWeight: "500",
        transition: "background 0.13s", fontFamily: "'IBM Plex Sans', sans-serif",
        textAlign: "left",
      }}>{label}</button>
  );
}
