import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const RM_MENU = [
  { id: "dashboard",    icon: "LayoutDashboard", label: "Dashboard" },
  { id: "leads",        icon: "Target",          label: "Lead Intelligence" },
  { id: "customers",    icon: "Users",           label: "Customers" },
  { id: "ai-assistant", icon: "Bot",             label: "AI Assistant" },
  { id: "analytics",    icon: "BarChart2",       label: "Analytics" },
  { id: "followups",    icon: "CalendarCheck",   label: "Follow-ups" },
  { id: "reports",      icon: "FileText",        label: "Reports" },
];

const BM_MENU = [
  { id: "dashboard",    icon: "LayoutDashboard", label: "Dashboard" },
  { id: "leads",        icon: "Target",          label: "Lead Intelligence" },
  { id: "customers",    icon: "Users",           label: "Customers" },
  { id: "analytics",    icon: "BarChart2",       label: "Analytics" },
  { id: "reports",      icon: "FileText",        label: "Reports" },
  { id: "followups",    icon: "CalendarCheck",   label: "Follow-ups" },
];

const ADMIN_MENU = [
  { id: "dashboard",       icon: "LayoutDashboard", label: "Dashboard" },
  { id: "leads",           icon: "Target",          label: "Lead Intelligence" },
  { id: "customers",       icon: "Users",           label: "Customers" },
  { id: "admin-users",     icon: "UserCog",         label: "User Management" },
  { id: "admin-branches",  icon: "Building2",       label: "Branch Management" },
  { id: "analytics",       icon: "BarChart2",       label: "Analytics" },
  { id: "reports",         icon: "FileText",        label: "Reports" },
  { id: "admin-audit",     icon: "ShieldCheck",     label: "Audit Logs" },
  { id: "ai-assistant",    icon: "Bot",             label: "AI Assistant" },
];

const BOTTOM_MENU = [
  { id: "notifications", icon: "Bell",    label: "Notifications" },
  { id: "settings",      icon: "Settings",label: "Settings" },
  { id: "profile",       icon: "User",    label: "Profile" },
];

// Minimal SVG icons — no external dependency
const ICONS = {
  LayoutDashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Target: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Users: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Bot: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  BarChart2: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  CalendarCheck: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  FileText: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  UserCog: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="19" cy="19" r="2"/><path d="M19 15v2m0 4v2m-3-5h2m4 0h2"/></svg>,
  Building2: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  ShieldCheck: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Bell: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  User: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

const ROLE_LABEL = { admin: "Administrator", bm: "Branch Manager", rm: "Relationship Manager" };

export default function Sidebar({ activePage, onNavigate }) {
  const { user, sidebarCollapsed, setSidebarCollapsed, unreadCount } = useApp();
  const [hovered, setHovered] = useState(null);

  const menu = user?.role === "admin" ? ADMIN_MENU : user?.role === "bm" ? BM_MENU : RM_MENU;
  const w = sidebarCollapsed ? "60px" : "216px";

  return (
    <aside style={{
      width: w, minHeight: "100vh", background: "#0E1A2B",
      display: "flex", flexDirection: "column",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      flexShrink: 0, position: "relative", zIndex: 50,
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo row */}
      <div style={{
        height: "64px", display: "flex", alignItems: "center",
        padding: sidebarCollapsed ? "0 0 0 18px" : "0 14px 0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        justifyContent: sidebarCollapsed ? "center" : "space-between",
        overflow: "hidden",
      }}>
        {!sidebarCollapsed && (
          <div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "20px", fontWeight: "700", color: "#C79A3D", letterSpacing: "-0.5px", lineHeight: 1 }}>IDBI</div>
            <div style={{ fontSize: "9px", fontWeight: "500", color: "#8CA0BC", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" }}>Lending Intelligence</div>
          </div>
        )}
        <button onClick={() => setSidebarCollapsed(c => !c)} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
          color: "#8CA0BC", width: "26px", height: "26px", borderRadius: "5px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        >
          {sidebarCollapsed ? <ICONS.ChevronRight /> : <ICONS.ChevronLeft />}
        </button>
      </div>

      {/* User badge */}
      {!sidebarCollapsed && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
              background: "#C79A3D", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#0E1A2B",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>{user?.avatar}</div>
            <div style={{ overflow: "hidden", minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#E8ECF2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: "10px", color: "#8CA0BC", marginTop: "1px" }}>{ROLE_LABEL[user?.role] || "User"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {!sidebarCollapsed && (
          <div style={{ fontSize: "9px", fontWeight: "700", color: "rgba(140,160,188,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 6px", marginBottom: "2px" }}>
            Navigation
          </div>
        )}
        {menu.map(item => (
          <NavItem key={item.id} item={item}
            active={activePage === item.id}
            collapsed={sidebarCollapsed}
            hovered={hovered === item.id}
            onHover={setHovered}
            onClick={() => onNavigate(item.id)}
            badge={item.id === "notifications" ? unreadCount : 0}
          />
        ))}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "10px 4px" }} />
        {!sidebarCollapsed && (
          <div style={{ fontSize: "9px", fontWeight: "700", color: "rgba(140,160,188,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 6px", marginBottom: "2px" }}>
            Account
          </div>
        )}
        {BOTTOM_MENU.map(item => (
          <NavItem key={item.id} item={item}
            active={activePage === item.id}
            collapsed={sidebarCollapsed}
            hovered={hovered === item.id}
            onHover={setHovered}
            onClick={() => onNavigate(item.id)}
            badge={item.id === "notifications" ? unreadCount : 0}
          />
        ))}
      </nav>

      {/* Branch footer */}
      {!sidebarCollapsed && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: "9px", color: "#8CA0BC", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Branch</div>
          <div style={{ fontSize: "12px", color: "#E8ECF2", fontWeight: "500" }}>{user?.branch}</div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ item, active, collapsed, hovered, onHover, onClick, badge }) {
  const Icon = ICONS[item.icon] || ICONS.FileText;
  const isActive = active;
  const isHovered = hovered;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      title={collapsed ? item.label : ""}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: collapsed ? 0 : "10px",
        padding: collapsed ? "9px 0" : "8px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? "rgba(199,154,61,0.12)" : isHovered ? "rgba(255,255,255,0.05)" : "transparent",
        border: "none",
        borderLeft: isActive ? "2px solid #C79A3D" : "2px solid transparent",
        borderRadius: isActive ? "0 5px 5px 0" : "5px",
        cursor: "pointer", marginBottom: "1px",
        transition: "all 0.15s", position: "relative",
        color: isActive ? "#C79A3D" : isHovered ? "#E8ECF2" : "#8CA0BC",
      }}
    >
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}><Icon /></span>
      {!collapsed && (
        <span style={{
          fontSize: "12.5px", fontWeight: isActive ? "600" : "400",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {item.label}
        </span>
      )}
      {badge > 0 && (
        <span style={{
          position: collapsed ? "absolute" : "relative",
          top: collapsed ? "5px" : "auto", right: collapsed ? "5px" : "auto",
          marginLeft: collapsed ? 0 : "auto",
          background: "#B5482F", color: "#fff", borderRadius: "10px",
          fontSize: "9px", fontWeight: "700", padding: "1px 5px",
          minWidth: "16px", textAlign: "center",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>{badge}</span>
      )}
    </button>
  );
}
