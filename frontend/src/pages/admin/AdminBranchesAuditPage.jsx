import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

const BRANCHES = [
  { id: 1, name: "Mumbai Main", manager: "Ankit Sharma", employees: 12, customers: 8, conversion: 42, revenue: "₹1.8Cr", rank: 1, status: "Active" },
  { id: 2, name: "Delhi Central", manager: "Priya Mehta", employees: 9, customers: 6, conversion: 38, revenue: "₹1.4Cr", rank: 2, status: "Active" },
  { id: 3, name: "Bangalore Tech", manager: "Rahul Desai", employees: 7, customers: 4, conversion: 35, revenue: "₹0.9Cr", rank: 3, status: "Active" },
  { id: 4, name: "Chennai South", manager: "Kavya Nair", employees: 6, customers: 2, conversion: 28, revenue: "₹0.7Cr", rank: 4, status: "Active" },
  { id: 5, name: "HQ Mumbai", manager: "Rajiv Nair", employees: 20, customers: 0, conversion: 0, revenue: "—", rank: 5, status: "Active" },
];

export function AdminBranchesPage() {
  const { darkMode, addToast } = useApp();
  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Branch Management</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>{BRANCHES.length} branches across India</p>
        </div>
        <button onClick={() => addToast("Add branch form coming soon", "info")}
          style={{ padding: "9px 18px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          + Add Branch
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Branches", value: BRANCHES.length, color: "#1e40af", bg: "#eff6ff" },
          { label: "Total Employees", value: BRANCHES.reduce((s, b) => s + b.employees, 0), color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Total Customers", value: BRANCHES.reduce((s, b) => s + b.customers, 0), color: "#22c55e", bg: "#dcfce7" },
          { label: "Avg Conversion", value: `${Math.round(BRANCHES.filter(b => b.conversion > 0).reduce((s, b) => s + b.conversion, 0) / 4)}%`, color: "#f59e0b", bg: "#fef3c7" },
        ].map(({ label, value, color, bg: sbg }) => (
          <div key={label} style={{ flex: "1 1 120px", background: cardBg, borderRadius: "10px", padding: "14px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: textSecondary }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "14px" }}>
        {BRANCHES.map(branch => (
          <BranchCard key={branch.id} branch={branch} darkMode={darkMode} cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary} addToast={addToast} />
        ))}
      </div>
    </div>
  );
}

function BranchCard({ branch, darkMode, cardBg, border, textPrimary, textSecondary, addToast }) {
  const [h, setH] = useState(false);
  const rankColors = ["#fef3c7", "#f3f4f6", "#fff7ed", "#f9fafb", "#f9fafb"];
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "18px", boxShadow: h ? "0 8px 24px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)", transform: h ? "translateY(-3px)" : "none", transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: textPrimary }}>{branch.name}</div>
          <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>Manager: {branch.manager}</div>
        </div>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: rankColors[branch.rank - 1], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#b45309" }}>#{branch.rank}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {[["👥 Employees", branch.employees], ["🎯 Customers", branch.customers], ["📈 Conversion", branch.conversion > 0 ? `${branch.conversion}%` : "—"], ["💰 Revenue", branch.revenue]].map(([label, value]) => (
          <div key={label} style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10px", color: textSecondary }}>{label}</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary, marginTop: "2px" }}>{value}</div>
          </div>
        ))}
      </div>
      {branch.conversion > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: textSecondary, marginBottom: "4px" }}>Conversion Rate</div>
          <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${branch.conversion}%`, background: "#1e40af", borderRadius: "10px" }} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={() => addToast(`Viewing ${branch.name} details`, "info")} style={{ flex: 1, padding: "7px", background: "#eff6ff", color: "#1e40af", border: "none", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>View Details</button>
        <button onClick={() => addToast(`Editing ${branch.name}`, "info")} style={{ flex: 1, padding: "7px", background: "transparent", color: textSecondary, border: `1px solid ${border}`, borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Edit</button>
      </div>
    </div>
  );
}

const AUDIT_LOGS = [
  { id: 1, user: "Ankit Sharma", action: "Viewed Lead Profile", target: "Rajesh Kumar", time: "Today 9:15 AM", status: "Success", ip: "192.168.1.10" },
  { id: 2, user: "Priya Mehta", action: "Exported CSV Report", target: "All Leads", time: "Today 9:00 AM", status: "Success", ip: "192.168.1.22" },
  { id: 3, user: "Rajiv Nair", action: "Created User", target: "Sneha Kapoor (RM002)", time: "Yesterday 5:30 PM", status: "Success", ip: "10.0.0.1" },
  { id: 4, user: "Ankit Sharma", action: "Initiated Outreach", target: "Meera Nair", time: "Yesterday 4:30 PM", status: "Success", ip: "192.168.1.10" },
  { id: 5, user: "Unknown", action: "Failed Login Attempt", target: "RM001", time: "Yesterday 2:15 PM", status: "Failed", ip: "203.0.113.45" },
  { id: 6, user: "Rajiv Nair", action: "Updated Branch Settings", target: "Mumbai Main", time: "Yesterday 11:00 AM", status: "Success", ip: "10.0.0.1" },
  { id: 7, user: "Priya Mehta", action: "Assigned Lead", target: "Arjun Mehta → Ankit Sharma", time: "Jun 27 3:00 PM", status: "Success", ip: "192.168.1.22" },
  { id: 8, user: "Ankit Sharma", action: "Generated AI Report", target: "Lead Intelligence Report", time: "Jun 27 10:00 AM", status: "Success", ip: "192.168.1.10" },
  { id: 9, user: "Unknown", action: "Failed Login Attempt", target: "ADM001", time: "Jun 26 8:45 PM", status: "Failed", ip: "198.51.100.23" },
  { id: 10, user: "Rajiv Nair", action: "Deleted User", target: "Temp User (TMP001)", time: "Jun 26 2:00 PM", status: "Success", ip: "10.0.0.1" },
];

export function AdminAuditPage() {
  const { darkMode } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const filtered = AUDIT_LOGS.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const th = { padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `2px solid ${border}`, background: darkMode ? "#0f172a" : "#f9fafb", whiteSpace: "nowrap" };
  const td = { padding: "12px 14px", borderBottom: `1px solid ${border}`, verticalAlign: "middle" };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Audit Logs</h2>
        <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>Complete activity trail for compliance and security</p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: cardBg, color: textPrimary }}
            onFocus={e => e.target.style.borderColor = "#1e40af"} onBlur={e => e.target.style.borderColor = border} />
        </div>
        {["All", "Success", "Failed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid", borderColor: statusFilter === s ? "#1e40af" : border, background: statusFilter === s ? "#1e40af" : "transparent", color: statusFilter === s ? "#fff" : textSecondary, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{s}</button>
        ))}
      </div>

      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["User", "Action", "Target", "Time", "Status", "IP Address"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id} onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#1e3a5f" : "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.15s" }}>
                  <td style={td}><span style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{log.user}</span></td>
                  <td style={td}><span style={{ fontSize: "12px", color: textPrimary }}>{log.action}</span></td>
                  <td style={td}><span style={{ fontSize: "12px", color: textSecondary }}>{log.target}</span></td>
                  <td style={td}><span style={{ fontSize: "11px", color: textSecondary }}>{log.time}</span></td>
                  <td style={td}><span style={{ background: log.status === "Success" ? "#dcfce7" : "#fee2e2", color: log.status === "Success" ? "#15803d" : "#b91c1c", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>{log.status}</span></td>
                  <td style={td}><span style={{ fontSize: "11px", fontFamily: "monospace", color: textSecondary }}>{log.ip}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
