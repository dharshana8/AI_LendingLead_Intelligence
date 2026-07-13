import { useState, useEffect, useCallback } from "react";
import {
  apiGetCustomers, apiGetAnalytics, apiCreateCustomer,
  apiUpdateCustomer, apiDeleteCustomer, apiLoadSample,
  apiExport, normalizeAnalytics,
} from "../services/api";

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetCustomers();
      setCustomers(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const raw = await apiGetAnalytics();
      setAnalytics(prev => normalizeAnalytics(raw, customers));
    } catch {
      // analytics endpoint optional — derive from customers
      setAnalytics(normalizeAnalytics(null, customers));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [customers]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { if (!loading) fetchAnalytics(); }, [loading, fetchAnalytics]);

  const createCustomer = useCallback(async (payload) => {
    const created = await apiCreateCustomer(payload);
    await fetchCustomers();
    return created;
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id, payload) => {
    const updated = await apiUpdateCustomer(id, payload);
    await fetchCustomers();
    return updated;
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id) => {
    await apiDeleteCustomer(id);
    await fetchCustomers();
  }, [fetchCustomers]);

  const loadSample = useCallback(async () => {
    await apiLoadSample();
    await fetchCustomers();
  }, [fetchCustomers]);

  const exportCSV = useCallback(async () => {
    const blob = await apiExport();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "idbi_leads_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    customers, analytics,
    loading, analyticsLoading, error,
    refetch: fetchCustomers,
    createCustomer, updateCustomer, deleteCustomer,
    loadSample, exportCSV,
  };
}
