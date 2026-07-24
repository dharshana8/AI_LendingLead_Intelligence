import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import BMDashboardPage from "./pages/BMDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CustomersPage from "./pages/CustomersPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import { AdminBranchesPage, AdminAuditPage } from "./pages/admin/AdminBranchesAuditPage";
import Sidebar from "./components/Sidebar";
import AppHeader from "./components/AppHeader";
import ToastContainer from "./components/Toast";

export const BRAND = "NOVA";

const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #F5F3ED;
    --card: #FFFFFF;
    --border: #E4DFD1;
    --navy: #0E1A2B;
    --navy2: #152540;
    --gold: #C79A3D;
    --gold-soft: #F1E3C3;
    --teal: #2F6E63;
    --teal-soft: #DCEAE6;
    --rust: #B5482F;
    --rust-soft: #F3DDD4;
    --ink: #12181F;
    --ink2: #5C6672;
    --text-dark: #E8ECF2;
    --text-muted: #8CA0BC;
    --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --font-serif: 'Fraunces', Georgia, serif;
  }
  body { font-family: var(--font-sans); background: var(--bg); color: var(--ink); }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #C8C0B0; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #A89880; }
  .mono { font-family: var(--font-mono) !important; }
`;

function SkeletonLoader({ darkMode }) {
  const bg   = darkMode ? "#0E1A2B" : "#F5F3ED";
  const card = darkMode ? "#152540" : "#FFFFFF";
  const sh   = darkMode ? "rgba(255,255,255,0.06)" : "#E4DFD1";
  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "28px" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: "1 1 150px", background: card, borderRadius: "6px", padding: "18px", height: "100px", border: "1px solid #E4DFD1" }}>
            {[36, 22, 12].map((h, j) => (
              <div key={j} style={{ height: h, background: sh, borderRadius: "3px", marginBottom: "8px", width: j === 0 ? "40px" : j === 1 ? "55%" : "75%", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: card, borderRadius: "6px", height: "72px", marginBottom: "16px", animation: "shimmer 1.5s infinite", border: "1px solid #E4DFD1" }} />
      <div style={{ background: card, borderRadius: "6px", height: "380px", animation: "shimmer 1.5s infinite", border: "1px solid #E4DFD1" }} />
      <div style={{ position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "12px", background: card, padding: "12px 24px", borderRadius: "6px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #E4DFD1" }}>
        <div style={{ width: "16px", height: "16px", border: "2px solid #E4DFD1", borderTop: "2px solid #C79A3D", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: "12px", fontWeight: "600", color: darkMode ? "#E8ECF2" : "#12181F", fontFamily: "'IBM Plex Sans', sans-serif" }}>Loading {BRAND} Lead Intelligence...</span>
      </div>
    </div>
  );
}

function AppShell() {
  const { user, darkMode } = useApp();
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 1400);
      return () => clearTimeout(t);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const bg = darkMode ? "#0E1A2B" : "#F5F3ED";
  const font = "'IBM Plex Sans', system-ui, sans-serif";

  const [showLanding, setShowLanding] = useState(true);

  if (!user && showLanding) return <LandingPage onLogin={() => setShowLanding(false)} />;
  if (!user) return <LoginPage />;
  if (loading) return <SkeletonLoader darkMode={darkMode} />;

  // APP SHELL
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: font }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <AppHeader activePage={activePage} onNavigate={setActivePage} />
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <PageRouter activePage={activePage} onNavigate={setActivePage} />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

function PageRouter({ activePage, onNavigate }) {
  const { user } = useApp();

  // Admin-only guard
  const adminOnly = ["admin-users", "admin-branches", "admin-audit"];
  if (adminOnly.includes(activePage) && user?.role !== "admin") {
    return <AccessDenied onBack={() => onNavigate("dashboard")} />;
  }

  switch (activePage) {
    case "dashboard":      return user?.role === "admin" ? <AdminDashboardPage onNavigate={onNavigate} /> : user?.role === "bm" ? <BMDashboardPage onNavigate={onNavigate} /> : <DashboardPage onNavigate={onNavigate} />;
    case "leads":          return user?.role === "admin" ? <AdminDashboardPage onNavigate={onNavigate} /> : user?.role === "bm" ? <BMDashboardPage onNavigate={onNavigate} /> : <DashboardPage onNavigate={onNavigate} />;
    case "customers":      return <CustomersPage />;
    case "ai-assistant":   return <AIAssistantPage />;
    case "analytics":      return <AnalyticsPage />;
    case "reports":        return <ReportsPage />;
    case "followups":      return <FollowUpsPage />;
    case "notifications":  return <NotificationsPage />;
    case "profile":        return <ProfilePage />;
    case "settings":       return <SettingsPage />;
    case "admin-users":    return <AdminUsersPage />;
    case "admin-branches": return <AdminBranchesPage />;
    case "admin-audit":    return <AdminAuditPage />;
    default:               return <DashboardPage onNavigate={onNavigate} />;
  }
}

function AccessDenied({ onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px", textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
      <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#12181F", marginBottom: "8px" }}>Access Denied</h2>
      <p style={{ fontSize: "13px", color: "#5C6672", marginBottom: "24px" }}>You don't have permission to view this page.</p>
      <button onClick={onBack} style={{ padding: "9px 22px", background: "#C79A3D", color: "#0E1A2B", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <style>{GLOBAL_STYLES}</style>
      <AppShell />
    </AppProvider>
  );
}
