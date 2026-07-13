import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import KPICards from "../components/KPICards";
import InsightsCard from "../components/InsightsCard";
import FilterBar from "../components/FilterBar";
import LeadTable from "../components/LeadTable";
import DetailPanel from "../components/DetailPanel";
import AIvsCIBIL from "../components/AIvsCIBIL";
import Footer from "../components/Footer";
import { leads as allLeads } from "../data/mockData";

const QUICK_ACTIONS = [
  { icon: "➕", label: "Add Customer", color: "#1e40af", bg: "#eff6ff", page: "customers" },
  { icon: "🤖", label: "AI Report", color: "#7c3aed", bg: "#f5f3ff", page: "reports" },
  { icon: "📊", label: "Analytics", color: "#0891b2", bg: "#ecfeff", page: "analytics" },
  { icon: "🤖", label: "AI Assistant", color: "#059669", bg: "#ecfdf5", page: "ai-assistant" },
  { icon: "📋", label: "Export CSV", color: "#b45309", bg: "#fef3c7", page: null },
];

export default function DashboardPage({ onNavigate }) {
  const { darkMode, addToast } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const filtered = useMemo(() => {
    let data = allLeads;
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
  }, [filter, search]);

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
              onClick={() => {
                if (page) onNavigate(page);
                else { addToast("Exporting CSV...", "info"); }
              }}
            />
          ))}
        </div>
      </div>

      <KPICards darkMode={darkMode} />
      <InsightsCard darkMode={darkMode} />
      <FilterBar active={filter} onFilter={setFilter} search={search} onSearch={setSearch} darkMode={darkMode} />

      {filtered.length === 0 ? (
        <EmptyState onReset={() => { setFilter("All"); setSearch(""); }} darkMode={darkMode} />
      ) : (
        <LeadTable leads={filtered} onSelect={setSelected} darkMode={darkMode} />
      )}

      <AIvsCIBIL darkMode={darkMode} />
      <Footer darkMode={darkMode} />
      <DetailPanel lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function QuickActionBtn({ icon, label, color, bg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "10px 16px", background: h ? color : bg,
        color: h ? "#fff" : color, border: `1.5px solid ${color}20`,
        borderRadius: "10px", fontSize: "13px", fontWeight: "600",
        cursor: "pointer", transition: "all 0.2s",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? `0 6px 16px ${color}30` : "none",
      }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>{label}
    </button>
  );
}

function EmptyState({ onReset, darkMode }) {
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  return (
    <div style={{
      margin: "20px 24px", background: cardBg, borderRadius: "14px",
      border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
      padding: "60px 20px", textAlign: "center",
    }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: textPrimary, marginBottom: "8px" }}>No Leads Available</div>
      <div style={{ fontSize: "13px", color: textSecondary, marginBottom: "20px" }}>No customers match your current filters.</div>
      <button onClick={onReset} style={{
        padding: "10px 24px", background: "#1e40af", color: "#fff",
        border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
      }}>Load All Customers</button>
    </div>
  );
}
