import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

const DS = {
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const BRANCHES = [
  { id: 1, name: "Mumbai Main",    manager: "Ankit Sharma", employees: 12, customers: 8, conversion: 42, revenue: "₹1.8Cr", rank: 1 },
  { id: 2, name: "Delhi Central",  manager: "Priya Mehta",  employees: 9,  customers: 6, conversion: 38, revenue: "₹1.4Cr", rank: 2 },
  { id: 3, name: "Bangalore Tech", manager: "Rahul Desai",  employees: 7,  customers: 4, conversion: 35, revenue: "₹0.9Cr", rank: 3 },
  { id: 4, name: "Chennai South",  manager: "Kavya Nair",   employees: 6,  customers: 2, conversion: 28, revenue: "₹0.7Cr", rank: 4 },
  { id: 5, name: "HQ Mumbai",      manager: "Rajiv Nair",   employees: 20, customers: 0, conversion: 0,  revenue: "—",      rank: 5 },
];

export function AdminBranchesPage() {
  const { darkMode, addToast, customers } = useApp();

  // Enrich static branch data with real customer counts
  const enrichedBranches = BRANCHES.map(b => ({
    ...b,
    customers: customers.filter(c =>
      (c._raw?.assigned_to || "").toLowerCase().includes(b.manager.split(" ")[0].toLowerCase())
    ).length || b.customers,
  }));
  const bg   = darkMode ? DS.navy  : DS.bg;
  const card = darkMode ? DS.navy2 : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.ink2;

  const statCards = [
    { label: "Total Branches",   value: enrichedBranches.length,                                                color: DS.gold },
    { label: "Total Employees",  value: enrichedBranches.reduce((s, b) => s + b.employees, 0),                 color: DS.teal },
    { label: "Total Customers",  value: enrichedBranches.reduce((s, b) => s + b.customers, 0),                 color: DS.gold },
    { label: "Avg Conversion",   value: `${Math.round(enrichedBranches.filter(b => b.conversion > 0).reduce((s, b) => s + b.conversion, 0) / 4)}%`, color: DS.teal },
  ];

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Branch Management</h2>
          <p style={{ fontSize: "13px", color: ink2, margin: "4px 0 0" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: DS.gold }}>{BRANCHES.length}</span> branches across India
          </p>
        </div>
        <button onClick={() => addToast("Branch management requires backend integration — coming soon", "info")} style={{
          padding: "9px 18px", background: DS.gold, color: DS.navy,
          border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          + Add Branch
        </button>
      </div>

      {/* Stat row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 120px", background: card, borderRadius: "6px", padding: "14px 16px", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", fontWeight: "700", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: ink2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "14px" }}>
        {enrichedBranches.map(branch => (
          <BranchCard key={branch.id} branch={branch} darkMode={darkMode} card={card} bdr={bdr} ink={ink} ink2={ink2} addToast={addToast} />
        ))}
      </div>
    </div>
  );
}

function BranchCard({ branch, darkMode, card, bdr, ink, ink2, addToast }) {
  const [h, setH] = useState(false);
  const rankColors = ["#C79A3D", "#8CA0BC", "#B5482F", DS.ink2, DS.ink2];
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: card, borderRadius: "8px", border: `1px solid ${h ? DS.gold : bdr}`, padding: "18px", transition: "all 0.18s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: ink }}>{branch.name}</div>
          <div style={{ fontSize: "12px", color: ink2, marginTop: "2px" }}>Manager: {branch.manager}</div>
        </div>
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%",
          background: DS.goldSoft, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "12px", fontWeight: "800",
          color: rankColors[branch.rank - 1] || DS.ink2,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>#{branch.rank}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {[["Employees", branch.employees], ["Customers", branch.customers], ["Conversion", branch.conversion > 0 ? `${branch.conversion}%` : "—"], ["Revenue", branch.revenue]].map(([label, value]) => (
          <div key={label} style={{ background: darkMode ? DS.navy : DS.bg, borderRadius: "5px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10px", color: ink2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "14px", fontWeight: "700", color: ink, marginTop: "2px" }}>{value}</div>
          </div>
        ))}
      </div>

      {branch.conversion > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: ink2 }}>Conversion Rate</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: DS.gold }}>{branch.conversion}%</span>
          </div>
          <div style={{ height: "5px", background: DS.border, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${branch.conversion}%`, background: DS.gold, borderRadius: "3px", transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => addToast(`${branch.name} — detailed view requires backend integration`, "info")}
          style={{ flex: 1, padding: "7px", background: DS.goldSoft, color: DS.gold, border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          View Details
        </button>
        <button onClick={() => addToast(`${branch.name} — edit requires backend integration`, "info")}
          style={{ flex: 1, padding: "7px", background: "transparent", color: ink2, border: `1px solid ${bdr}`, borderRadius: "5px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
          Edit
        </button>
      </div>
    </div>
  );
}

/* ── Audit Logs ── */

const AUDIT_LOGS = [
  { id: 1,  user: "Ankit Sharma", action: "Viewed Lead Profile",      target: "Rajesh Kumar",              time: "Today 9:15 AM",      status: "Success", ip: "192.168.1.10" },
  { id: 2,  user: "Priya Mehta",  action: "Exported CSV Report",      target: "All Leads",                 time: "Today 9:00 AM",      status: "Success", ip: "192.168.1.22" },
  { id: 3,  user: "Rajiv Nair",   action: "Created User",             target: "Sneha Kapoor (RM002)",      time: "Yesterday 5:30 PM",  status: "Success", ip: "10.0.0.1" },
  { id: 4,  user: "Ankit Sharma", action: "Initiated Outreach",       target: "Meera Nair",                time: "Yesterday 4:30 PM",  status: "Success", ip: "192.168.1.10" },
  { id: 5,  user: "Unknown",      action: "Failed Login Attempt",     target: "RM001",                     time: "Yesterday 2:15 PM",  status: "Failed",  ip: "203.0.113.45" },
  { id: 6,  user: "Rajiv Nair",   action: "Updated Branch Settings",  target: "Mumbai Main",               time: "Yesterday 11:00 AM", status: "Success", ip: "10.0.0.1" },
  { id: 7,  user: "Priya Mehta",  action: "Assigned Lead",            target: "Arjun Mehta → Ankit Sharma",time: "Jun 27 3:00 PM",     status: "Success", ip: "192.168.1.22" },
  { id: 8,  user: "Ankit Sharma", action: "Generated AI Report",      target: "Lead Intelligence Report",  time: "Jun 27 10:00 AM",    status: "Success", ip: "192.168.1.10" },
  { id: 9,  user: "Unknown",      action: "Failed Login Attempt",     target: "ADM001",                    time: "Jun 26 8:45 PM",     status: "Failed",  ip: "198.51.100.23" },
  { id: 10, user: "Rajiv Nair",   action: "Deleted User",             target: "Temp User (TMP001)",        time: "Jun 26 2:00 PM",     status: "Success", ip: "10.0.0.1" },
];

export function AdminAuditPage() {
  const { darkMode } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [liveLogs, setLiveLogs] = useState(null);

  React.useEffect(() => {
    let cancelled = false;
    import("../../services/api").then(({ apiGetAuditLogs }) =>
      apiGetAuditLogs({ limit: 100 })
        .then(data => {
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setLiveLogs(data.map((l, i) => ({
              id: l.id ?? i,
              user: l.user ?? "System",
              action: l.action ?? "—",
              target: l.target ?? "—",
              time: l.timestamp
                ? new Date(l.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : "—",
              status: l.status ?? "Success",
              ip: l.ip ?? "—",
            })));
          }
        })
        .catch(() => {})
    );
    return () => { cancelled = true; };
  }, []);

  const allLogs = liveLogs ?? AUDIT_LOGS;
  const bg   = darkMode ? DS.navy  : DS.bg;
  const card = darkMode ? DS.navy2 : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.ink2;

  const filtered = allLogs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.target.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const TH = { padding: "10px 14px", fontSize: "10.5px", fontWeight: "700", color: ink2, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${bdr}`, whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif" };
  const TD = (failed) => ({ padding: "11px 14px", borderBottom: `1px solid ${bdr}`, verticalAlign: "middle", background: failed ? (darkMode ? "rgba(181,72,47,0.08)" : DS.rustSoft) : "transparent" });

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Audit Logs</h2>
        <p style={{ fontSize: "13px", color: ink2, margin: "4px 0 0" }}>Complete activity trail for compliance and security</p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: ink2 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1px solid ${bdr}`, borderRadius: "6px", fontSize: "13px", outline: "none", background: card, color: ink, fontFamily: "'IBM Plex Sans', sans-serif" }}
            onFocus={e => e.target.style.borderColor = DS.gold} onBlur={e => e.target.style.borderColor = bdr} />
        </div>
        {["All", "Success", "Failed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "8px 16px", borderRadius: "6px",
            border: `1px solid ${statusFilter === s ? (s === "Failed" ? DS.rust : DS.gold) : bdr}`,
            background: statusFilter === s ? (s === "Failed" ? DS.rustSoft : DS.goldSoft) : "transparent",
            color: statusFilter === s ? (s === "Failed" ? DS.rust : DS.gold) : ink2,
            fontSize: "12px", fontWeight: "600", cursor: "pointer",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: darkMode ? DS.navy : DS.bg }}>
                {["User", "Action", "Target", "Time", "Status", "IP Address"].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const failed = log.status === "Failed";
                const tdStyle = TD(failed);
                return (
                  <tr key={log.id}
                    onMouseEnter={e => { if (!failed) e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = darkMode ? "rgba(255,255,255,0.03)" : DS.bg); }}
                    onMouseLeave={e => { if (!failed) e.currentTarget.querySelectorAll("td").forEach(td => td.style.background = "transparent"); }}>
                    <td style={tdStyle}><span style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{log.user}</span></td>
                    <td style={tdStyle}><span style={{ fontSize: "12px", color: ink }}>{log.action}</span></td>
                    <td style={tdStyle}><span style={{ fontSize: "12px", color: ink2 }}>{log.target}</span></td>
                    <td style={tdStyle}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: ink2 }}>{log.time}</span></td>
                    <td style={tdStyle}>
                      <span style={{
                        background: failed ? DS.rustSoft : DS.tealSoft,
                        color: failed ? DS.rust : DS.teal,
                        fontSize: "10px", fontWeight: "700", padding: "3px 9px",
                        borderRadius: "3px", letterSpacing: "0.05em",
                      }}>{log.status.toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: ink2 }}>{log.ip}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
