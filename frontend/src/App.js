import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./pages/LoginPage";
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

const GLOBAL_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

function SkeletonLoader({ darkMode }) {
  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const card = darkMode ? "#1e293b" : "#fff";
  const shimmer = darkMode ? "#334155" : "#f3f4f6";
  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "28px" }}>
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: "1 1 160px", background: card, borderRadius: "14px", padding: "20px", height: "110px" }}>
            {[44, 28, 14, 11].map((h, j) => (
              <div key={j} style={{ height: h, background: shimmer, borderRadius: "8px", marginBottom: "8px", width: j === 0 ? "44px" : j === 1 ? "60%" : "80%", animation: "shimmer 1.5s infinite" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: card, borderRadius: "14px", height: "80px", marginBottom: "20px", animation: "shimmer 1.5s infinite" }} />
      <div style={{ background: card, borderRadius: "14px", height: "400px", animation: "shimmer 1.5s infinite" }} />
      <div style={{ position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "12px", background: card, padding: "14px 24px", borderRadius: "40px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
        <div style={{ width: "20px", height: "20px", border: "3px solid #e5e7eb", borderTop: "3px solid #1e40af", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: "13px", fontWeight: "600", color: darkMode ? "#f1f5f9" : "#374151" }}>Loading AI Lead Intelligence...</span>
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

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const font = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px", textAlign: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔒</div>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Access Denied</h2>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>You don't have permission to view this page.</p>
      <button onClick={onBack} style={{ padding: "10px 24px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
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
