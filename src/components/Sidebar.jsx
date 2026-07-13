import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const RM_MENU = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "leads", icon: "🎯", label: "Lead Intelligence" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "ai-assistant", icon: "🤖", label: "AI Assistant" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "followups", icon: "📅", label: "Follow-ups" },
  { id: "reports", icon: "📋", label: "Reports" },
];

const BM_MENU = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "leads", icon: "🎯", label: "Lead Intelligence" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "reports", icon: "📋", label: "Reports" },
  { id: "followups", icon: "📅", label: "Follow-ups" },
];

const ADMIN_MENU = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "leads", icon: "🎯", label: "Lead Intelligence" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "admin-users", icon: "👤", label: "User Management" },
  { id: "admin-branches", icon: "🏦", label: "Branch Management" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "reports", icon: "📋", label: "Reports" },
  { id: "admin-audit", icon: "🔍", label: "Audit Logs" },
  { id: "ai-assistant", icon: "🤖", label: "AI Assistant" },
];

const BOTTOM_MENU = [
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "settings", icon: "⚙️", label: "Settings" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, sidebarCollapsed, setSidebarCollapsed, unreadCount, darkMode } = useApp();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = user?.role === "admin" ? ADMIN_MENU : user?.role === "bm" ? BM_MENU : RM_MENU;

  const bg = darkMode ? "#0f172a" : "#1e3a8a";
  const activeBg = darkMode ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.18)";
  const hoverBg = darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)";
  const w = sidebarCollapsed ? "64px" : "220px";

  return (
    <aside style={{
      width: w, minHeight: "100vh", background: bg,
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      flexShrink: 0, position: "relative", zIndex: 50,
      boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
    }}>
      {/* Logo */}
      <div style={{
        height: "70px", display: "flex", alignItems: "center",
        padding: sidebarCollapsed ? "0 14px" : "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        justifyContent: sidebarCollapsed ? "center" : "space-between",
        overflow: "hidden",
      }}>
        {!sidebarCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
              background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "800", color: "#fff",
            }}>IB</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>IDBI Bank</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Lead Intelligence</div>
            </div>
          </div>
        )}
        <button onClick={() => setSidebarCollapsed(c => !c)} style={{
          background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
          width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", flexShrink: 0, transition: "background 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        >{sidebarCollapsed ? "→" : "←"}</button>
      </div>

      {/* Role Badge */}
      {!sidebarCollapsed && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{
            background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "700", color: "#fff", flexShrink: 0,
            }}>{user?.avatar}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                {user?.role === "admin" ? "Administrator" : user?.role === "bm" ? "Branch Manager" : "Relationship Manager"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {!sidebarCollapsed && (
          <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 8px 4px", marginBottom: "2px" }}>
            Main Menu
          </div>
        )}
        {menuItems.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id}
            collapsed={sidebarCollapsed} hovered={hoveredItem === item.id}
            onHover={setHoveredItem} onClick={() => onNavigate(item.id)}
            activeBg={activeBg} hoverBg={hoverBg}
            badge={item.id === "notifications" ? unreadCount : 0}
          />
        ))}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 4px" }} />
        {!sidebarCollapsed && (
          <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 8px 4px", marginBottom: "2px" }}>
            Account
          </div>
        )}
        {BOTTOM_MENU.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id}
            collapsed={sidebarCollapsed} hovered={hoveredItem === item.id}
            onHover={setHoveredItem} onClick={() => onNavigate(item.id)}
            activeBg={activeBg} hoverBg={hoverBg}
            badge={item.id === "notifications" ? unreadCount : 0}
          />
        ))}
      </nav>

      {/* Branch info */}
      {!sidebarCollapsed && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>Current Branch</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>{user?.branch}</div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ item, active, collapsed, hovered, onHover, onClick, activeBg, hoverBg, badge }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      title={collapsed ? item.label : ""}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: collapsed ? 0 : "10px", padding: collapsed ? "10px 0" : "9px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? activeBg : hovered ? hoverBg : "transparent",
        border: "none", borderRadius: "8px", cursor: "pointer",
        marginBottom: "2px", transition: "background 0.15s",
        borderLeft: active ? "3px solid rgba(255,255,255,0.8)" : "3px solid transparent",
        position: "relative",
      }}
    >
      <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && (
        <span style={{ fontSize: "13px", fontWeight: active ? "600" : "500", color: active ? "#fff" : "rgba(255,255,255,0.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.label}
        </span>
      )}
      {badge > 0 && (
        <span style={{
          position: collapsed ? "absolute" : "relative",
          top: collapsed ? "6px" : "auto", right: collapsed ? "6px" : "auto",
          marginLeft: collapsed ? 0 : "auto",
          background: "#ef4444", color: "#fff", borderRadius: "10px",
          fontSize: "10px", fontWeight: "700", padding: "1px 6px", minWidth: "18px", textAlign: "center",
        }}>{badge}</span>
      )}
    </button>
  );
}
