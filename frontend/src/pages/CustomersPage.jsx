import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { PriorityBadge, LoanBadge } from "../components/Badges";
import DetailPanel from "../components/DetailPanel";

function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1e40af", "#7c3aed", "#0891b2", "#065f46", "#9a3412", "#1d4ed8"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: "700", color: "#fff", flexShrink: 0,
    }}>{initials}</div>
  );
}

const STATUS_OPTIONS = ["All", "New", "Contacted", "Interested", "Applied", "Converted"];

export default function CustomersPage() {
  const { darkMode, addToast, customers, exportCSV } = useApp();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const PAGE_SIZE = 8;

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const rowHoverBg = darkMode ? "#1e3a5f" : "#eff6ff";

  const enriched = useMemo(() => customers.map((l, i) => ({
    ...l,
    status: STATUS_OPTIONS[1 + (i % (STATUS_OPTIONS.length - 1))],
    lastContact: `${(i % 28) + 1} Jun 2025`,
    assignedTo: ["Ankit Sharma", "Priya Mehta", "Ravi Kumar"][i % 3],
  })), [customers]);

  const filtered = useMemo(() => {
    let data = enriched;
    if (priorityFilter !== "All") data = data.filter(l => l.priority === priorityFilter);
    if (statusFilter !== "All") data = data.filter(l => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        l.name.toLowerCase().includes(q) || l.occupation.toLowerCase().includes(q) ||
        l.loan.toLowerCase().includes(q) || l.signal.toLowerCase().includes(q)
      );
    }
    return data;
  }, [enriched, priorityFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleRow = (id) => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
  );
  const toggleAll = () => setSelectedRows(
    selectedRows.length === paginated.length ? [] : paginated.map(l => l.id)
  );

  const th = {
    padding: "11px 14px", fontSize: "11px", fontWeight: "700",
    color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: `2px solid ${border}`, background: darkMode ? "#0f172a" : "#f9fafb",
    whiteSpace: "nowrap",
  };
  const td = { padding: "13px 14px", borderBottom: `1px solid ${border}`, verticalAlign: "middle" };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Customer Management</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>{filtered.length} customers in your portfolio</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {selectedRows.length > 0 && (
            <>
              <ActionBtn label={`Assign (${selectedRows.length})`} color="#7c3aed" onClick={() => { addToast(`${selectedRows.length} customers assigned`, "success"); setSelectedRows([]); }} />
              <ActionBtn label="Export Selected" color="#059669" onClick={() => { addToast("Exporting selected customers...", "info"); setSelectedRows([]); }} />
              <ActionBtn label="Delete" color="#ef4444" onClick={() => { addToast("Customers removed from view", "warning"); setSelectedRows([]); }} />
            </>
          )}
          <ActionBtn label="+ Add Customer" color="#1e40af" onClick={() => addToast("Add customer form coming soon", "info")} primary />
          <ActionBtn label="📤 Export CSV" color="#374151" onClick={() => exportCSV().then(() => addToast("Export downloaded", "success")).catch(() => addToast("Export failed", "error"))} />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total", value: customers.length, color: "#1e40af", bg: "#eff6ff" },
          { label: "High Priority", value: customers.filter(l => l.priority === "High").length, color: "#15803d", bg: "#dcfce7" },
          { label: "Medium Priority", value: customers.filter(l => l.priority === "Medium").length, color: "#b45309", bg: "#fef3c7" },
          { label: "Low Priority", value: customers.filter(l => l.priority === "Low").length, color: "#b91c1c", bg: "#fee2e2" },
        ].map(({ label, value, color, bg: sbg }) => (
          <div key={label} style={{
            flex: "1 1 100px", background: cardBg, borderRadius: "10px",
            padding: "14px 16px", border: `1px solid ${border}`,
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: sbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", color }}>{value}</div>
            <span style={{ fontSize: "12px", color: textSecondary, fontWeight: "500" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, occupation, loan..."
            style={{ width: "100%", padding: "8px 10px 8px 30px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary }}
            onFocus={e => e.target.style.borderColor = "#1e40af"}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>
        <FilterGroup label="Priority" options={["All", "High", "Medium", "Low"]} active={priorityFilter} onChange={v => { setPriorityFilter(v); setPage(1); }} darkMode={darkMode} />
        <FilterGroup label="Status" options={STATUS_OPTIONS} active={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} darkMode={darkMode} />
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
          {["table", "grid"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: "7px 12px", borderRadius: "7px", border: `1.5px solid ${border}`,
              background: viewMode === m ? "#1e40af" : cardBg, color: viewMode === m ? "#fff" : textSecondary,
              fontSize: "12px", cursor: "pointer", fontWeight: "600",
            }}>{m === "table" ? "☰ Table" : "⊞ Grid"}</button>
          ))}
        </div>
      </div>

      {/* Table / Grid */}
      {viewMode === "table" ? (
        <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}><input type="checkbox" checked={selectedRows.length === paginated.length && paginated.length > 0} onChange={toggleAll} style={{ accentColor: "#1e40af" }} /></th>
                  {["Customer", "Income", "CIBIL", "AI Score", "Loan", "Priority", "Status", "Last Contact", "Actions"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(lead => (
                  <CustomerRow key={lead.id} lead={lead} selected={selectedRows.includes(lead.id)}
                    onToggle={() => toggleRow(lead.id)} onView={() => setSelected(lead)}
                    td={td} textPrimary={textPrimary} textSecondary={textSecondary}
                    rowHoverBg={rowHoverBg} darkMode={darkMode} addToast={addToast} />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} darkMode={darkMode} cardBg={cardBg} border={border} textSecondary={textSecondary} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
          {paginated.map(lead => (
            <CustomerCard key={lead.id} lead={lead} onView={() => setSelected(lead)} darkMode={darkMode} cardBg={cardBg} border={border} textPrimary={textPrimary} textSecondary={textSecondary} />
          ))}
        </div>
      )}

      <DetailPanel lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function CustomerRow({ lead, selected, onToggle, onView, td, textPrimary, textSecondary, rowHoverBg, darkMode, addToast }) {
  const [h, setH] = useState(false);
  const statusColors = { New: ["#eff6ff", "#1e40af"], Contacted: ["#fef3c7", "#b45309"], Interested: ["#dcfce7", "#15803d"], Applied: ["#f5f3ff", "#6d28d9"], Converted: ["#dcfce7", "#065f46"] };
  const [sbg, sc] = statusColors[lead.status] || ["#f3f4f6", "#374151"];
  return (
    <tr onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? rowHoverBg : "transparent", transition: "background 0.15s", borderLeft: h ? "3px solid #1e40af" : "3px solid transparent" }}>
      <td style={td}><input type="checkbox" checked={selected} onChange={onToggle} style={{ accentColor: "#1e40af" }} /></td>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={onView}>
          <Avatar name={lead.name} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{lead.name}</div>
            <div style={{ fontSize: "11px", color: textSecondary }}>{lead.occupation}</div>
          </div>
        </div>
      </td>
      <td style={td}><span style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>₹{lead.income.toLocaleString("en-IN")}</span></td>
      <td style={td}>
        <span style={{ background: lead.cibil >= 750 ? "#dcfce7" : lead.cibil >= 650 ? "#fef3c7" : "#fee2e2", color: lead.cibil >= 750 ? "#15803d" : lead.cibil >= 650 ? "#b45309" : "#b91c1c", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", fontWeight: "700" }}>{lead.cibil}</span>
      </td>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "50px", height: "6px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${lead.aiScore}%`, background: lead.aiScore >= 80 ? "#22c55e" : lead.aiScore >= 65 ? "#f59e0b" : "#ef4444", borderRadius: "10px" }} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: lead.aiScore >= 80 ? "#15803d" : lead.aiScore >= 65 ? "#b45309" : "#b91c1c" }}>{lead.aiScore}</span>
        </div>
      </td>
      <td style={td}><LoanBadge icon={lead.loanIcon} loan={lead.loan} /></td>
      <td style={td}><PriorityBadge priority={lead.priority} /></td>
      <td style={td}><span style={{ background: sbg, color: sc, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }}>{lead.status}</span></td>
      <td style={td}><span style={{ fontSize: "12px", color: textSecondary }}>{lead.lastContact}</span></td>
      <td style={td}>
        <div style={{ display: "flex", gap: "4px" }}>
          <MiniBtn label="View" onClick={onView} color="#1e40af" />
          <MiniBtn label="Call" onClick={() => addToast(`Calling ${lead.name}...`, "info")} color="#059669" />
        </div>
      </td>
    </tr>
  );
}

function CustomerCard({ lead, onView, darkMode, cardBg, border, textPrimary, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onView} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: cardBg, borderRadius: "12px", border: `1px solid ${border}`,
        padding: "18px", cursor: "pointer",
        boxShadow: h ? "0 8px 24px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
        transform: h ? "translateY(-3px)" : "none", transition: "all 0.2s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <Avatar name={lead.name} size={44} />
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>{lead.name}</div>
          <div style={{ fontSize: "12px", color: textSecondary }}>{lead.occupation}</div>
        </div>
        <div style={{ marginLeft: "auto" }}><PriorityBadge priority={lead.priority} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        {[["Income", `₹${lead.income.toLocaleString("en-IN")}`], ["CIBIL", lead.cibil], ["AI Score", lead.aiScore], ["Conversion", `${lead.conversion}%`]].map(([k, v]) => (
          <div key={k} style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10px", color: textSecondary, marginBottom: "2px" }}>{k}</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>{v}</div>
          </div>
        ))}
      </div>
      <LoanBadge icon={lead.loanIcon} loan={lead.loan} />
    </div>
  );
}

function FilterGroup({ label, options, active, onChange, darkMode }) {
  const border = darkMode ? "#334155" : "#e5e7eb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "12px", color: darkMode ? "#94a3b8" : "#6b7280", fontWeight: "500", whiteSpace: "nowrap" }}>{label}:</span>
      <select value={active} onChange={e => onChange(e.target.value)}
        style={{ padding: "7px 10px", border: `1.5px solid ${border}`, borderRadius: "7px", fontSize: "12px", background: cardBg, color: darkMode ? "#f1f5f9" : "#111827", outline: "none", cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ActionBtn({ label, color, onClick, primary }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
        cursor: "pointer", transition: "all 0.2s", border: `1.5px solid ${color}`,
        background: primary || h ? color : "transparent",
        color: primary || h ? "#fff" : color,
      }}>{label}</button>
  );
}

function MiniBtn({ label, onClick, color }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
        cursor: "pointer", border: `1px solid ${color}`, transition: "all 0.15s",
        background: h ? color : "transparent", color: h ? "#fff" : color,
      }}>{label}</button>
  );
}

function Pagination({ page, totalPages, total, pageSize, onPage, darkMode, cardBg, border, textSecondary }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ padding: "14px 16px", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: textSecondary }}>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div style={{ display: "flex", gap: "4px" }}>
        {["←", ...Array.from({ length: totalPages }, (_, i) => i + 1), "→"].map((p, i) => {
          const disabled = (p === "←" && page === 1) || (p === "→" && page === totalPages);
          const active = p === page;
          return (
            <button key={i} disabled={disabled}
              onClick={() => { if (!disabled) onPage(p === "←" ? page - 1 : p === "→" ? page + 1 : p); }}
              style={{
                width: "30px", height: "30px", borderRadius: "7px", border: `1.5px solid ${active ? "#1e40af" : border}`,
                background: active ? "#1e40af" : cardBg, color: active ? "#fff" : disabled ? "#d1d5db" : textSecondary,
                fontSize: "12px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer",
              }}>{p}</button>
          );
        })}
      </div>
    </div>
  );
}
