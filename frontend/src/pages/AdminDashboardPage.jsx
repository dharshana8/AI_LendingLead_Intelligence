import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import LeadTable from "../components/LeadTable";
import DetailPanel from "../components/DetailPanel";
import FilterBar from "../components/FilterBar";

const BRANCHES = [
  { name: "Mumbai Main",    manager: "Ankit Sharma",  employees: 12, conversion: 42, revenue: "₹1.8Cr", rank: 1 },
  { name: "Delhi Central",  manager: "Priya Mehta",   employees: 9,  conversion: 38, revenue: "₹1.4Cr", rank: 2 },
  { name: "Bangalore Tech", manager: "Rahul Desai",   employees: 7,  conversion: 35, revenue: "₹0.9Cr", rank: 3 },
  { name: "Chennai South",  manager: "Kavya Nair",    employees: 6,  conversion: 28, revenue: "₹0.7Cr", rank: 4 },
  { name: "HQ Mumbai",      manager: "Rajiv Nair",    employees: 20, conversion: 0,  revenue: "—",       rank: 5 },
];

export default function AdminDashboardPage({ onNavigate }) {
  const { darkMode, customers, dataLoading, refetch, addToast, exportCSV } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const bg            = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg        = darkMode ? "#1e293b" : "#fff";
  const border        = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary   = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

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

  const total     = customers.length;
  const high      = customers.filter(c => c.priority === "High").length;
  const converted = customers.filter(c => c.status === "Converted").length;
  const avgScore  = total ? Math.round(customers.reduce((s, c) => s + c.aiScore, 0) / total) : 0;
  const totalEmployees = BRANCHES.reduce((s, b) => s + b.employees, 0);

  return (
    <div style={{ background: bg, minHeight: "100%", paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Admin Control Centre</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <QuickBtn icon="👤" label="Users"     color="#1e40af" bg="#eff6ff" onClick={() => onNavigate("admin-users")} />
          <QuickBtn icon="🏦" label="Branches"  color="#7c3aed" bg="#f5f3ff" onClick={() => onNavigate("admin-branches")} />
          <QuickBtn icon="🔍" label="Audit"     color="#0891b2" bg="#ecfeff" onClick={() => onNavigate("admin-audit")} />
          <QuickBtn icon="📈" label="Analytics" color="#059669" bg="#ecfdf5" onClick={() => onNavigate("analytics")} />
          <QuickBtn icon="📋" label="Export"    color="#b45309" bg="#fef3c7" onClick={() => exportCSV().then(() => addToast("CSV exported", "success")).catch(() => addToast("Export failed", "error"))} />
        </div>
      </div>

      {/* System KPIs */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
        {[
          { icon: "👥", label: "Total Customers",  value: total,            color: "#1e40af", bg: "#eff6ff" },
          { icon: "🔥", label: "High Priority",    value: high,             color: "#15803d", bg: "#dcfce7" },
          { icon: "🤖", label: "Avg AI Score",     value: avgScore,         color: "#f59e0b", bg: "#fef3c7" },
          { icon: "✅", label: "Converted",        value: converted,        color: "#7c3aed", bg: "#f5f3ff" },
          { icon: "🏦", label: "Branches",         value: BRANCHES.length,  color: "#0891b2", bg: "#ecfeff" },
          { icon: "🧑‍💼", label: "Total Employees", value: totalEmployees,   color: "#ef4444", bg: "#fee2e2" },
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

      {/* AI Model Status */}
      <div style={{ margin: "20px 24px 0", background: "linear-gradient(135deg,#1e40af,#1e3a8a)", borderRadius: "14px", padding: "20px 24px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <span style={{ fontSize: "15px", fontWeight: "700" }}>AI Model Status</span>
              <span style={{ background: "#22c55e", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>LIVE</span>
            </div>
            <p style={{ fontSize: "13px", opacity: 0.8, margin: 0 }}>RandomForest · 20,000 training samples · 95.95% accuracy · SHAP explainability active</p>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            {[["Precision", "91%"], ["Recall", "88%"], ["AUC-ROC", "96%"]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "800" }}>{v}</div>
                <div style={{ fontSize: "11px", opacity: 0.7 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div style={{ margin: "20px 24px 0" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>🏦 Branch Performance</div>
        <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Rank", "Branch", "Manager", "Employees", "Conversion Rate", "Revenue"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `2px solid ${border}`, background: darkMode ? "#0f172a" : "#f9fafb", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BRANCHES.map(b => (
                <tr key={b.name}
                  onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#1e3a5f" : "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{ transition: "background 0.15s" }}>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontWeight: "800", color: b.rank === 1 ? "#f59e0b" : textSecondary }}>#{b.rank}</span>
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, fontSize: "13px", fontWeight: "600", color: textPrimary }}>{b.name}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, fontSize: "12px", color: textSecondary }}>{b.manager}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, fontSize: "13px", fontWeight: "600", color: textPrimary }}>{b.employees}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}` }}>
                    {b.conversion > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "6px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${b.conversion}%`, background: b.conversion >= 40 ? "#22c55e" : "#f59e0b", borderRadius: "10px" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: textPrimary }}>{b.conversion}%</span>
                      </div>
                    ) : <span style={{ fontSize: "12px", color: textSecondary }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${border}`, fontSize: "13px", fontWeight: "700", color: "#15803d" }}>{b.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Lead Portfolio */}
      <div style={{ margin: "20px 24px 0" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>🎯 Full Lead Portfolio</div>
      </div>
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
