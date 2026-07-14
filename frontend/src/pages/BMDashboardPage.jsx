import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import KPICards from "../components/KPICards";
import InsightsCard from "../components/InsightsCard";
import LeadTable from "../components/LeadTable";
import DetailPanel from "../components/DetailPanel";
import FilterBar from "../components/FilterBar";

const BRANCH_TEAM = [
  { name: "Ankit Sharma",  id: "RM001", avatar: "AS", leads: 8,  converted: 4, performance: 92 },
  { name: "Sneha Kapoor",  id: "RM002", avatar: "SK", leads: 6,  converted: 2, performance: 85 },
  { name: "Rahul Desai",   id: "RM003", avatar: "RD", leads: 5,  converted: 2, performance: 78 },
  { name: "Arjun Pillai",  id: "RM004", avatar: "AP", leads: 3,  converted: 1, performance: 72 },
];

export default function BMDashboardPage({ onNavigate }) {
  const { darkMode, customers, dataLoading, refetch, addToast, exportCSV } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const bg          = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg      = darkMode ? "#1e293b" : "#fff";
  const border      = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const inputBg     = darkMode ? "#0f172a" : "#f9fafb";

  const filtered = useMemo(() => {
    let data = customers;
    if (filter !== "All") data = data.filter(l => l.priority === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        l.name.toLowerCase().includes(q) || l.loan.toLowerCase().includes(q) ||
        l.priority.toLowerCase().includes(q) || l.occupation.toLowerCase().includes(q)
      );
    }
    return data;
  }, [customers, filter, search]);

  const high   = customers.filter(c => c.priority === "High").length;
  const medium = customers.filter(c => c.priority === "Medium").length;
  const converted = customers.filter(c => c.status === "Converted").length;
  const convRate = customers.length ? Math.round((converted / customers.length) * 100) : 0;

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Branch Manager Dashboard</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <QuickBtn icon="👥" label="Customers" color="#1e40af" bg="#eff6ff" onClick={() => onNavigate("customers")} />
          <QuickBtn icon="📈" label="Analytics"  color="#7c3aed" bg="#f5f3ff" onClick={() => onNavigate("analytics")} />
          <QuickBtn icon="📋" label="Export CSV" color="#b45309" bg="#fef3c7" onClick={() => exportCSV().then(() => addToast("CSV exported", "success")).catch(() => addToast("Export failed", "error"))} />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Branch Summary */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
        {[
          { icon: "🔥", label: "High Priority",   value: high,      color: "#15803d", bg: "#dcfce7" },
          { icon: "⚡", label: "Medium Priority",  value: medium,    color: "#b45309", bg: "#fef3c7" },
          { icon: "✅", label: "Converted",        value: converted, color: "#1e40af", bg: "#eff6ff" },
          { icon: "📊", label: "Conversion Rate",  value: `${convRate}%`, color: "#7c3aed", bg: "#f5f3ff" },
        ].map(({ icon, label, value, color, bg: sbg }) => (
          <div key={label} style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: sbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
              <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <InsightsCard />

      {/* Team Performance */}
      <div style={{ margin: "20px 24px 0" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>👥 Team Performance</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "12px" }}>
          {BRANCH_TEAM.map(rm => (
            <div key={rm.id} style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff" }}>{rm.avatar}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{rm.name}</div>
                  <div style={{ fontSize: "11px", color: textSecondary }}>{rm.id}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "800", color: rm.performance >= 85 ? "#15803d" : "#b45309" }}>{rm.performance}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: textSecondary, marginBottom: "6px" }}>
                <span>Leads: <b style={{ color: textPrimary }}>{rm.leads}</b></span>
                <span>Converted: <b style={{ color: "#15803d" }}>{rm.converted}</b></span>
              </div>
              <div style={{ height: "5px", background: inputBg, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${rm.performance}%`, background: rm.performance >= 85 ? "#22c55e" : "#f59e0b", borderRadius: "10px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Table */}
      <FilterBar active={filter} onFilter={setFilter} search={search} onSearch={setSearch} darkMode={darkMode} />
      {!dataLoading && <LeadTable leads={filtered} onSelect={setSelected} darkMode={darkMode} />}
      <DetailPanel lead={selected} onClose={() => setSelected(null)} onRefresh={refetch} />
    </div>
  );
}

function QuickBtn({ icon, label, color, bg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: h ? color : bg, color: h ? "#fff" : color, border: `1.5px solid ${color}20`, borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
      <span>{icon}</span>{label}
    </button>
  );
}
