import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiGetCustomers, apiGetAnalytics, apiLoadSample, apiExport, normalizeAnalytics } from "../services/api";

const AppContext = createContext(null);

export const MOCK_USERS = [
  { id: 1, employeeId: "RM001", password: "password123", name: "Ankit Sharma", role: "rm", branch: "Mumbai Main", email: "ankit.sharma@idbi.co.in", phone: "+91 98765 43210", avatar: "AS", joined: "Jan 2022", performance: 92 },
  { id: 2, employeeId: "BM001", password: "password123", name: "Priya Mehta", role: "bm", branch: "Delhi Central", email: "priya.mehta@idbi.co.in", phone: "+91 98765 43211", avatar: "PM", joined: "Mar 2019", performance: 88 },
  { id: 3, employeeId: "ADM001", password: "admin123", name: "Rajiv Nair", role: "admin", branch: "HQ Mumbai", email: "rajiv.nair@idbi.co.in", phone: "+91 98765 43212", avatar: "RN", joined: "Jun 2015", performance: 96 },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "lead", title: "New High Priority Lead", message: "Rajesh Kumar scored 92 — immediate outreach recommended", time: "2 min ago", read: false },
  { id: 2, type: "approval", title: "Loan Approved", message: "Priya Sharma's Home Loan application approved ₹72L", time: "15 min ago", read: false },
  { id: 3, type: "reminder", title: "Follow-up Reminder", message: "Call Vikram Singh at 3:00 PM today", time: "1 hr ago", read: false },
  { id: 4, type: "assigned", title: "Lead Assigned", message: "Arjun Mehta assigned to your portfolio", time: "2 hr ago", read: true },
  { id: 5, type: "info", title: "AI Model Updated", message: "Lead scoring model retrained with latest data", time: "Yesterday", read: true },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Shared data store ──────────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const list = await apiGetCustomers();
      setCustomers(list);
      try {
        const raw = await apiGetAnalytics();
        setAnalytics(normalizeAnalytics(raw, list));
      } catch {
        setAnalytics(normalizeAnalytics(null, list));
      }
    } catch (e) {
      setDataError(e?.response?.data?.detail || e.message || "Failed to connect to backend");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const loadSample = useCallback(async () => {
    await apiLoadSample();
    await fetchCustomers();
  }, [fetchCustomers]);

  const exportCSV = useCallback(async () => {
    const blob = await apiExport();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "idbi_leads_export.csv"; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const login = useCallback((employeeId, password) => {
    const found = MOCK_USERS.find(u => u.employeeId === employeeId && u.password === password);
    if (found) { setUser(found); return { success: true }; }
    return { success: false, error: "Invalid Employee ID or Password" };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, login, logout,
      darkMode, setDarkMode,
      notifications, markAllRead, unreadCount,
      toasts, addToast,
      sidebarCollapsed, setSidebarCollapsed,
      customers, analytics, dataLoading, dataError,
      refetch: fetchCustomers, loadSample, exportCSV,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
