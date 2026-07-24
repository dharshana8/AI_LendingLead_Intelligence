import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { apiGetCustomers, apiGetAnalytics, apiLoadSample, apiExport, normalizeAnalytics, apiCreateCustomer, apiImportCSV, apiUpdateCustomer } from "../services/api";
import api from "../services/api";

const LS_TOKEN    = "nova_token";
const LS_SEEN     = "nova_seen_ids";
const LS_STATUSES = "nova_seen_statuses";
const LS_NOTIF_SETTINGS = "nova_notif_settings";
const LS_LANG_SETTINGS  = "nova_lang_settings";
const LS_ACCESS_SETTINGS = "nova_access_settings";

const AppContext = createContext(null);

export const MOCK_USERS = [
  { id: 1, employeeId: "RM001", password: "password123", name: "Karthikeyan Murugan", role: "rm", branch: "Chennai South", email: "karthikeyan.m@example.com", phone: "+91 98765 43210", avatar: "KM", joined: "Jan 2022", performance: 92 },
  { id: 2, employeeId: "BM001", password: "password123", name: "Meenakshi Sundaram", role: "bm", branch: "Coimbatore Central", email: "meenakshi.s@example.com", phone: "+91 98765 43211", avatar: "MS", joined: "Mar 2019", performance: 88 },
  { id: 3, employeeId: "ADM001", password: "admin123", name: "Thiruvenkatam Pillai", role: "admin", branch: "HQ Chennai", email: "thiruvenkatam.p@example.com", phone: "+91 98765 43212", avatar: "TP", joined: "Jun 2015", performance: 96 },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "lead", title: "New High Priority Lead", message: "Selvakumar Rajan scored 92 — immediate outreach recommended", time: "2 min ago", read: false },
  { id: 2, type: "approval", title: "Loan Approved", message: "Kavitha Annamalai's Home Loan application approved ₹72L", time: "15 min ago", read: false },
  { id: 3, type: "reminder", title: "Follow-up Reminder", message: "Call Murugesan Natarajan at 3:00 PM today", time: "1 hr ago", read: false },
  { id: 4, type: "assigned", title: "Lead Assigned", message: "Padmavathi Subramaniam assigned to your portfolio", time: "2 hr ago", read: true },
  { id: 5, type: "info", title: "AI Model Updated", message: "Lead scoring model retrained with latest data", time: "Yesterday", read: true },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifIdRef = useRef(100); // auto-increment ID for generated notifications
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

      // ── Diff-based notification generation ──────────────────────────────
      if (list.length > 0) {
        const seenIds     = JSON.parse(localStorage.getItem(LS_SEEN)     || "[]");
        const seenStatuses= JSON.parse(localStorage.getItem(LS_STATUSES) || "{}");
        const newNotifs   = [];
        const now         = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        list.forEach(c => {
          const id = String(c.id);
          // New high-priority lead not seen before
          if (!seenIds.includes(id) && c.priority === "High") {
            newNotifs.push({
              id: ++notifIdRef.current, type: "lead",
              title: "New High-Priority Lead",
              message: `${c.name} scored ${c.aiScore} — immediate outreach recommended`,
              time: now, read: false,
            });
          }
          // Status changed since last seen
          if (seenStatuses[id] && seenStatuses[id] !== c.status) {
            newNotifs.push({
              id: ++notifIdRef.current, type: "approval",
              title: "Lead Status Changed",
              message: `${c.name} moved from ${seenStatuses[id]} → ${c.status}`,
              time: now, read: false,
            });
          }
        });

        // Persist new last-seen snapshot
        localStorage.setItem(LS_SEEN,     JSON.stringify(list.map(c => String(c.id))));
        localStorage.setItem(LS_STATUSES, JSON.stringify(Object.fromEntries(list.map(c => [String(c.id), c.status]))));

        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
        } else if (seenIds.length === 0) {
          // First ever load — seed with a portfolio summary notification
          setNotifications(prev => [
            { id: ++notifIdRef.current, type: "info", title: "AI Model Active", message: "Lead scoring model running at 95.95% accuracy", time: now, read: true },
            { id: ++notifIdRef.current, type: "reminder", title: "Follow-up Reminder", message: `You have ${list.filter(c => c.status === "Contacted").length} leads in Contacted status`, time: now, read: false },
            { id: ++notifIdRef.current, type: "approval", title: "Portfolio Loaded", message: `${list.length} customers — ${list.filter(c => c.priority === "High").length} high priority`, time: now, read: true },
            ...prev.filter(n => n.id > 50), // keep any manually added
          ].slice(0, 50));
        }
      }
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

  const createCustomer = useCallback(async (payload) => {
    const created = await apiCreateCustomer(payload);
    await fetchCustomers();
    return created;
  }, [fetchCustomers]);

  const importCSV = useCallback(async (file) => {
    const result = await apiImportCSV(file);
    await fetchCustomers();
    return result;
  }, [fetchCustomers]);

  const loadSample = useCallback(async () => {
    await apiLoadSample();
    await fetchCustomers();
  }, [fetchCustomers]);

  const exportCSV = useCallback(async () => {
    const blob = await apiExport();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads_export.csv"; a.click();
    URL.revokeObjectURL(url);
  }, []);

  // In-memory store for users registered while backend is offline
  const [localUsers, setLocalUsers] = useState([]);

  const login = useCallback(async (employeeId, password) => {
    try {
      const res = await api.post("/login", { employeeId, password });
      // Store JWT if backend returns one
      if (res.data?.token || res.data?.access_token) {
        localStorage.setItem(LS_TOKEN, res.data.token ?? res.data.access_token);
      }
      setUser(res.data);
      // Load server-side settings and apply dark mode preference
      try {
        const { apiGetUserSettings } = await import("../services/api");
        const settingsRes = await apiGetUserSettings(res.data.employeeId);
        const serverSettings = settingsRes?.settings || {};
        if (serverSettings.dark_mode !== undefined) {
          setDarkMode(serverSettings.dark_mode);
        }
      } catch { /* server settings unavailable — localStorage fallback stays */ }
      return { success: true };
    } catch (e) {
      // Backend down — check mock users + locally registered users
      const allLocal = [...MOCK_USERS, ...localUsers];
      const found = allLocal.find(
        u => (u.employeeId === employeeId || u.email === employeeId) && u.password === password
      );
      if (found) { setUser(found); return { success: true }; }
      // If backend returned a real 401, show that error
      if (e?.response?.status === 401) {
        return { success: false, error: e.response.data?.detail || "Invalid Employee ID or Password" };
      }
      // Backend unreachable — generic message
      return { success: false, error: "Cannot reach server. Check that the backend is running on port 8000." };
    }
  }, [localUsers]);

  const register = useCallback(async (payload) => {
    try {
      const res = await api.post("/register", payload);
      // Also save locally so login works even if backend goes down mid-session
      const newUser = {
        ...res.data,
        password: payload.password,
        avatar: res.data.avatar || payload.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      };
      setLocalUsers(prev => [...prev, newUser]);
      return { success: true, data: res.data };
    } catch (e) {
      // If backend is down, register locally so the user can still use the app
      if (!e?.response) {
        const existing = [...MOCK_USERS, ...localUsers].find(u => u.employeeId === payload.employeeId);
        if (existing) return { success: false, error: "Employee ID already exists" };
        const newUser = {
          id: Date.now(), employeeId: payload.employeeId, password: payload.password,
          name: payload.name, role: payload.role || "rm", branch: payload.branch || "Chennai South",
          email: payload.email || "", phone: payload.phone || "",
          avatar: payload.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          joined: new Date().getFullYear().toString(), performance: 75,
        };
        setLocalUsers(prev => [...prev, newUser]);
        return { success: true, data: newUser };
      }
      const msg = e?.response?.data?.detail || "Registration failed";
      return { success: false, error: msg };
    }
  }, [localUsers]);

  const updateCustomer = useCallback(async (id, patch) => {
    const updated = await apiUpdateCustomer(id, patch);
    setCustomers(prev => prev.map(c => {
      const cid = updated.customer_id ?? updated.id;
      return (c.id === cid || c.id === id) ? { ...c, ...patch } : c;
    }));
    return updated;
  }, []);

  const logout = useCallback(() => {
    api.post("/logout").catch(() => {});
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_SEEN);
    localStorage.removeItem(LS_STATUSES);
    setUser(null);
  }, []);

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
      user, login, logout, register,
      darkMode, setDarkMode,
      notifications, markAllRead, unreadCount,
      toasts, addToast,
      sidebarCollapsed, setSidebarCollapsed,
      customers, analytics, dataLoading, dataError,
      refetch: fetchCustomers, createCustomer, updateCustomer, importCSV, loadSample, exportCSV,
      // localStorage keys exposed so SettingsPage can read/write without re-importing
      LS_NOTIF_SETTINGS, LS_LANG_SETTINGS, LS_ACCESS_SETTINGS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
