import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import KPICards from "../components/KPICards";
import InsightsCard from "../components/InsightsCard";
import FilterBar from "../components/FilterBar";
import LeadTable from "../components/LeadTable";
import DetailPanel from "../components/DetailPanel";
import AIvsCIBIL from "../components/AIvsCIBIL";
import Footer from "../components/Footer";

const QUICK_ACTIONS = [
  { icon: "➕", label: "Add Customer",  color: "#1e40af", bg: "#eff6ff", page: "customers" },
  { icon: "🤖", label: "AI Report",     color: "#7c3aed", bg: "#f5f3ff", page: "reports"   },
  { icon: "📊", label: "Analytics",     color: "#0891b2", bg: "#ecfeff", page: "analytics" },
  { icon: "🤖", label: "AI Assistant",  color: "#059669", bg: "#ecfdf5", page: "ai-assistant" },
  { icon: "📋", label: "Export CSV",    color: "#b45309", bg: "#fef3c7", page: null         },
];

export default function DashboardPage({ onNavigate }) {
  const { darkMode, addToast, customers, dataLoading, dataError, refetch, loadSample, exportCSV } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const filtered = useMemo(() => {
    let data = customers;
    if (filter !== "All") data = data.filter(l => l.priority === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        l.name.toLowerCase().includes(q) || l.loan.toLowerCase().includes(q) ||
        l.priority.toLowerCase().includes(q) || l.signal.toLowerCase().includes(q) ||
        l.occupation.toLowerCase().includes(q)
      );
    }
    return data;
  }, [customers, filter, search]);

  const handleExport = async () => {
    try {
      await exportCSV();
      addToast("CSV exported successfully", "success");
    } catch {
      addToast("Export failed", "error");
    }
  };

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px" }}>
      {/* Quick Actions */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Actions</span>
          <span style={{ fontSize: "11px", color: textSecondary }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {QUICK_ACTIONS.map(({ icon, label, color, bg: qbg, page }) => (
            <QuickActionBtn key={label} icon={icon} label={label} color={color} bg={qbg}
              onClick={() => { if (page) onNavigate(page); else handleExport(); }}
            />
          ))}
        </div>
      </div>

      <KPICards />
      <InsightsCard />
      <FilterBar active={filter} onFilter={setFilter} search={search} onSearch={setSearch} darkMode={darkMode} />

      {dataError ? (
        <ErrorState error={dataError} onRetry={refetch} onLoadSample={async () => { try { await loadSample(); addToast("Sample data loaded", "success"); } catch { addToast("Failed to load sample", "error"); } }} darkMode={darkMode} />
      ) : dataLoading ? (
        <TableSkeleton darkMode={darkMode} />
      ) : filtered.length === 0 ? (
        <EmptyState onReset={() => { setFilter("All"); setSearch(""); }} onLoadSample={async () => { try { await loadSample(); addToast("Sample data loaded", "success"); } catch { addToast("Failed to load sample", "error"); } }} darkMode={darkMode} hasData={customers.length > 0} />
      ) : (
        <LeadTable leads={filtered} onSelect={setSelected} darkMode={darkMode} />
      )}

      <AIvsCIBIL />
      <Footer darkMode={darkMode} />
      <DetailPanel lead={selected} onClose={() => setSelected(null)} onRefresh={refetch} />
    </div>
  );
}

function QuickActionBtn({ icon, label, color, bg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: h ? color : bg, color: h ? "#fff" : color, border: `1.5px solid ${color}20`, borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", transform: h ? "translateY(-2px)" : "none", boxShadow: h ? `0 6px 16px ${color}30` : "none" }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>{label}
    </button>
  );
}

function TableSkeleton({ darkMode }) {
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  return (
    <div style={{ margin: "20px 24px 0", background: cardBg, borderRadius: "14px", border: `1px solid ${border}`, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
        <div style={{ height: "16px", width: "200px", background: darkMode ? "#334155" : "#f3f4f6", borderRadius: "8px", animation: "shimmer 1.5s infinite" }} />
      </div>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`, display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: darkMode ? "#334155" : "#f3f4f6", animation: "shimmer 1.5s infinite", flexShrink: 0 }} />
          {[120, 80, 60, 100, 70, 80, 60].map((w, j) => (
            <div key={j} style={{ height: "12px", width: w, background: darkMode ? "#334155" : "#f3f4f6", borderRadius: "6px", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset, onLoadSample, darkMode, hasData }) {
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  return (
    <div style={{ margin: "20px 24px", background: cardBg, borderRadius: "14px", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{hasData ? "🔍" : "📭"}</div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: textPrimary, marginBottom: "8px" }}>{hasData ? "No Leads Match Filters" : "No Customers Found"}</div>
      <div style={{ fontSize: "13px", color: textSecondary, marginBottom: "20px" }}>{hasData ? "Try adjusting your filters or search." : "Load sample data to get started."}</div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        {hasData && <button onClick={onReset} style={{ padding: "10px 24px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Clear Filters</button>}
        <button onClick={onLoadSample} style={{ padding: "10px 24px", background: hasData ? "transparent" : "#1e40af", color: hasData ? "#1e40af" : "#fff", border: "1.5px solid #1e40af", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Load Sample Data</button>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry, onLoadSample, darkMode }) {
  const cardBg = darkMode ? "#1e293b" : "#fff";
  return (
    <div style={{ margin: "20px 24px", background: cardBg, borderRadius: "14px", border: "1px solid #fecaca", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
      <div style={{ fontSize: "16px", fontWeight: "700", color: "#b91c1c", marginBottom: "8px" }}>Backend Connection Error</div>
      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>{error}</div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={onRetry} style={{ padding: "10px 24px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>🔄 Retry</button>
        <button onClick={onLoadSample} style={{ padding: "10px 24px", background: "transparent", color: "#1e40af", border: "1.5px solid #1e40af", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Load Sample Data</button>
      </div>
    </div>
  );
}
