import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { PriorityBadge, LoanBadge } from "../components/Badges";
import DetailPanel from "../components/DetailPanel";
import LogCallModal from "../components/LogCallModal";

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
  const { darkMode, addToast, customers, exportCSV, refetch, createCustomer, user } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [logCallLead, setLogCallLead] = useState(null);
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

  const filtered = useMemo(() => {
    let data = customers;
    if (priorityFilter !== "All") data = data.filter(l => l.priority === priorityFilter);
    if (statusFilter !== "All") data = data.filter(l => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(l =>
        (l.name || "").toLowerCase().includes(q) ||
        (l.occupation || "").toLowerCase().includes(q) ||
        (l.loan || "").toLowerCase().includes(q) ||
        (l.signal || "").toLowerCase().includes(q) ||
        String(l.cibil || "").includes(q) ||
        String(l.aiScore || "").includes(q)
      );
    }
    return data;
  }, [customers, priorityFilter, statusFilter, search]);

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
              <ActionBtn label={`Export Selected (${selectedRows.length})`} color="#059669" onClick={async () => {
                try {
                  const rows = customers.filter(c => selectedRows.includes(c.id));
                  const XLSX = await import("xlsx");
                  const ws = XLSX.utils.json_to_sheet(rows.map(c => ({ Name: c.name, Occupation: c.occupation, Income: c.income, CIBIL: c.cibil, "AI Score": c.aiScore, Priority: c.priority, Loan: c.loan, Status: c.status })));
                  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Selected");
                  XLSX.writeFile(wb, `Selected_${selectedRows.length}.xlsx`);
                  addToast(`${selectedRows.length} customers exported`, "success");
                } catch { addToast("Export failed", "error"); }
                setSelectedRows([]);
              }} />
              <ActionBtn label={`Delete (${selectedRows.length})`} color="#ef4444" onClick={async () => {
                if (!window.confirm(`Delete ${selectedRows.length} customer(s)? This cannot be undone.`)) return;
                const { apiDeleteCustomer } = await import("../services/api");
                let failed = 0;
                for (const id of selectedRows) { try { await apiDeleteCustomer(id); } catch { failed++; } }
                addToast(failed === 0 ? `${selectedRows.length} customers deleted` : `${selectedRows.length - failed} deleted, ${failed} failed`, failed === 0 ? "success" : "error");
                setSelectedRows([]); refetch();
              }} />
            </>
          )}
          <ActionBtn label="+ Add Customer" color="#1e40af" onClick={() => setShowAddModal(true)} primary />
          <ActionBtn label="📥 Import" color="#059669" onClick={() => setShowImportModal(true)} />
          <ActionBtn label="🗑 Clear All" color="#B5482F" onClick={() => setShowClearConfirm(true)} />
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
                    onLogCall={() => setLogCallLead(lead)}
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

      <DetailPanel lead={selected} onClose={() => setSelected(null)} onRefresh={refetch} onOptimisticRemove={(id) => { /* customers list re-fetches on close */ refetch(); }} />
      {logCallLead && (
        <LogCallModal
          lead={logCallLead}
          onClose={() => setLogCallLead(null)}
          onSaved={() => { setLogCallLead(null); refetch(); }}
        />
      )}
      {showImportModal && (
        <ImportModal
          darkMode={darkMode}
          onClose={() => setShowImportModal(false)}
          onImport={async (file, mode) => {
            try {
              if (mode === "replace") {
                const { apiDeleteAllCustomers } = await import("../services/api");
                await apiDeleteAllCustomers();
              }
              const { apiImportCSV } = await import("../services/api");
              const result = await apiImportCSV(file);
              addToast(`Imported ${result.imported} customers${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}`, "success");
              setShowImportModal(false);
              refetch();
            } catch (e) {
              addToast(e?.detail || e?.response?.data?.detail || "Import failed", "error");
            }
          }}
          existingCount={customers.length}
        />
      )}
      {showClearConfirm && (
        <ClearAllModal
          count={customers.length}
          darkMode={darkMode}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={async () => {
            try {
              const { apiDeleteAllCustomers } = await import("../services/api");
              await apiDeleteAllCustomers();
              await refetch();
              addToast("All customer data cleared", "success");
            } catch { addToast("Clear failed", "error"); }
            setShowClearConfirm(false);
          }}
        />
      )}
      {showAddModal && (
        <AddCustomerModal
          darkMode={darkMode}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (payload) => {
            try {
              await createCustomer({
                ...payload,
                assigned_to: user?.employeeId || "",
                branch: user?.branch || "",
              });
              addToast("Customer added successfully!", "success");
              setShowAddModal(false);
            } catch (e) {
              addToast(e?.response?.data?.detail || "Failed to add customer", "error");
            }
          }}
        />
      )}
    </div>
  );
}

function CustomerRow({ lead, selected, onToggle, onView, onLogCall, td, textPrimary, textSecondary, rowHoverBg, darkMode, addToast }) {
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
          <MiniBtn label="Log Call" onClick={onLogCall} color="#059669" />
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

function ImportModal({ darkMode, onClose, onImport, existingCount }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("merge"); // "merge" | "replace"
  const inputRef = React.useRef();

  const bg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    await onImport(file, mode);
    setLoading(false);
  };

  const isReplace = mode === "replace";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: bg, borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: textPrimary }}>📥 Import Customers</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: textSecondary }}>Upload CSV or Excel — AI scores all customers automatically</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: textSecondary }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Mode selector */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>What to do with existing data?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", border: `2px solid ${mode === "merge" ? "#059669" : border}`, borderRadius: "8px", cursor: "pointer", background: mode === "merge" ? "#f0fdf4" : "transparent" }}>
                <input type="radio" name="import-mode" value="merge" checked={mode === "merge"} onChange={() => setMode("merge")} style={{ marginTop: "2px", accentColor: "#059669" }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: textPrimary }}>Merge with existing data</div>
                  <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>Keeps all {existingCount} current records. New rows are added alongside them.</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", border: `2px solid ${mode === "replace" ? "#B5482F" : border}`, borderRadius: "8px", cursor: "pointer", background: mode === "replace" ? "#fff5f2" : "transparent" }}>
                <input type="radio" name="import-mode" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} style={{ marginTop: "2px", accentColor: "#B5482F" }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#B5482F" }}>Replace all existing data</div>
                  <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>Permanently deletes all {existingCount} current records, then imports the new file. This cannot be undone.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? "#1e40af" : file ? "#15803d" : border}`,
              borderRadius: "12px", padding: "28px 20px", textAlign: "center", cursor: "pointer",
              background: dragging ? "#eff6ff" : file ? "#f0fdf4" : darkMode ? "#0f172a" : "#f9fafb",
              transition: "all 0.2s",
            }}>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }}
              onChange={e => setFile(e.target.files[0])} />
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{file ? "✅" : "📂"}</div>
            {file ? (
              <>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>{file.name}</div>
                <div style={{ fontSize: "12px", color: textSecondary, marginTop: "4px" }}>{(file.size / 1024).toFixed(1)} KB — click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "14px", fontWeight: "600", color: textPrimary }}>Drop file here or click to browse</div>
                <div style={{ fontSize: "12px", color: textSecondary, marginTop: "4px" }}>Supports .csv, .xlsx, .xls</div>
              </>
            )}
          </div>

          <div style={{ marginTop: "12px", background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px", padding: "10px 14px", border: `1px solid ${border}` }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", marginBottom: "6px" }}>Required Columns</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {["name", "age", "occupation", "cibil_score", "monthly_credit_1..6", "credit_limit"].map(col => (
                <span key={col} style={{ background: "#eff6ff", color: "#1e40af", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>{col}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <ActionBtn label="Cancel" color="#6b7280" onClick={onClose} />
          <button
            disabled={!file || loading}
            onClick={handleSubmit}
            style={{
              padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
              cursor: !file || loading ? "not-allowed" : "pointer",
              border: "none",
              background: !file || loading ? "#e5e7eb" : isReplace ? "#B5482F" : "#059669",
              color: !file || loading ? "#9ca3af" : "#fff",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Importing..." : isReplace ? `Delete old data & import` : "📥 Merge & Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClearAllModal({ count, darkMode, onClose, onConfirm }) {
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const bg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const confirmed = typed === "DELETE";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: bg, borderRadius: "12px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", border: `2px solid #B5482F` }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${border}` }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#B5482F" }}>🗑 Clear All Customer Data</h3>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: textSecondary }}>This will permanently delete all {count} customer records. There is no undo.</p>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "8px" }}>
            Type <strong style={{ color: "#B5482F" }}>DELETE</strong> to confirm
          </label>
          <input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="DELETE"
            style={{ width: "100%", padding: "9px 12px", border: `2px solid ${confirmed ? "#B5482F" : border}`, borderRadius: "6px", fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary, boxSizing: "border-box" }}
          />
        </div>
        <div style={{ padding: "0 24px 20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <ActionBtn label="Cancel" color="#6b7280" onClick={onClose} />
          <button
            disabled={!confirmed || loading}
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            style={{
              padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
              cursor: !confirmed || loading ? "not-allowed" : "pointer",
              border: "none",
              background: !confirmed || loading ? "#e5e7eb" : "#B5482F",
              color: !confirmed || loading ? "#9ca3af" : "#fff",
            }}
          >
            {loading ? "Deleting..." : `Delete all ${count} records`}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: "", age: "", occupation: "", occupation_category: "Salaried", cibil_score: "",
  monthly_credit_1: "", monthly_credit_2: "", monthly_credit_3: "",
  monthly_credit_4: "", monthly_credit_5: "", monthly_credit_6: "",
  emi_debits: "", cc_spend: "", credit_limit: "", loan_page_visits: "",
  existing_loan_count: "", years_of_experience: "", account_balance: "",
  owns_home: false, has_existing_home_loan: false, has_gold_to_pledge: false,
};

const OCCUPATION_CATEGORIES = ["Salaried", "Self-Employed-Professional", "Business-Owner", "Farmer", "Fisherman", "Student", "Other"];

function AddCustomerModal({ darkMode, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState("form"); // "form" | "review"
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const bg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";
  const inputBg = darkMode ? "#0f172a" : "#f9fafb";

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    const age = parseInt(form.age); if (!age || age < 18 || age > 80) e.age = "18–80";
    if (!form.occupation.trim()) e.occupation = "Required";
    const cibil = parseInt(form.cibil_score); if (!cibil || cibil < 300 || cibil > 900) e.cibil_score = "300–900";
    const credits = [form.monthly_credit_1, form.monthly_credit_2, form.monthly_credit_3,
      form.monthly_credit_4, form.monthly_credit_5, form.monthly_credit_6];
    if (credits.filter(c => parseFloat(c) > 0).length < 3) e.monthly_credit_1 = "At least 3 months must be non-zero";
    if (!form.credit_limit || parseFloat(form.credit_limit) <= 0) e.credit_limit = "Must be > 0";
    return e;
  };

  const handleReview = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("review");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      age: parseInt(form.age),
      occupation: form.occupation.trim(),
      occupation_category: form.occupation_category,
      cibil_score: parseInt(form.cibil_score),
      monthly_credit_1: parseFloat(form.monthly_credit_1) || 0,
      monthly_credit_2: parseFloat(form.monthly_credit_2) || 0,
      monthly_credit_3: parseFloat(form.monthly_credit_3) || 0,
      monthly_credit_4: parseFloat(form.monthly_credit_4) || 0,
      monthly_credit_5: parseFloat(form.monthly_credit_5) || 0,
      monthly_credit_6: parseFloat(form.monthly_credit_6) || 0,
      emi_debits: parseFloat(form.emi_debits) || 0,
      cc_spend: parseFloat(form.cc_spend) || 0,
      credit_limit: parseFloat(form.credit_limit) || 1,
      loan_page_visits: parseInt(form.loan_page_visits) || 0,
      existing_loan_count: parseInt(form.existing_loan_count) || 0,
      years_of_experience: parseInt(form.years_of_experience) || 0,
      account_balance: parseFloat(form.account_balance) || 0,
      owns_home: form.owns_home,
      has_existing_home_loan: form.has_existing_home_loan,
      has_gold_to_pledge: form.has_gold_to_pledge,
    };
    await onSubmit(payload);
    setSubmitting(false);
  };

  const inputStyle = (k) => ({
    width: "100%", padding: "8px 10px", border: `1.5px solid ${errors[k] ? "#ef4444" : border}`,
    borderRadius: "7px", fontSize: "13px", background: inputBg, color: textPrimary, outline: "none",
    boxSizing: "border-box",
  });

  const Field = ({ label, k, type = "text", placeholder = "" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={form[k]} placeholder={placeholder}
        onChange={e => set(k, e.target.value)}
        style={inputStyle(k)} />
      {errors[k] && <span style={{ fontSize: "11px", color: "#ef4444" }}>{errors[k]}</span>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: bg, borderRadius: "16px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: textPrimary }}>
              {step === "form" ? "Add New Customer" : "Review Customer Details"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: textSecondary }}>
              {step === "form" ? "Fill in the customer's financial details" : "Confirm before saving to database"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: textSecondary }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {step === "form" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Basic Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <Field label="Full Name" k="name" placeholder="e.g. Priya Sharma" />
                <Field label="Age" k="age" type="number" placeholder="18–80" />
                <Field label="Occupation (display)" k="occupation" placeholder="e.g. Software Engineer" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, textTransform: "uppercase" }}>Occupation Category</label>
                  <select value={form.occupation_category} onChange={e => set("occupation_category", e.target.value)}
                    style={{ padding: "8px 10px", border: `1.5px solid ${border}`, borderRadius: "7px", fontSize: "13px", background: inputBg, color: textPrimary, outline: "none" }}>
                    {OCCUPATION_CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <Field label="CIBIL Score" k="cibil_score" type="number" placeholder="300–900" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Account Balance (₹)" k="account_balance" type="number" placeholder="0" />
              </div>
              {/* Property flags */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {[["owns_home", "Owns Home"], ["has_existing_home_loan", "Has Home Loan"], ["has_gold_to_pledge", "Has Gold to Pledge"]].map(([k, label]) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: textPrimary, cursor: "pointer" }}>
                    <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: "#1e40af", width: "15px", height: "15px" }} />
                    {label}
                  </label>
                ))}
              </div>

              {/* Monthly Credits */}
              <div>
                <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: textSecondary, textTransform: "uppercase" }}>
                  Monthly Salary Credits — at least 3 must be non-zero
                </p>
                {errors.monthly_credit_1 && <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#ef4444" }}>{errors.monthly_credit_1}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary }}>Month {n} (₹)</label>
                      <input type="number" value={form[`monthly_credit_${n}`]} placeholder="0"
                        onChange={e => set(`monthly_credit_${n}`, e.target.value)}
                        style={inputStyle(`monthly_credit_${n}`)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Details */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <Field label="EMI Debits/mo (₹)" k="emi_debits" type="number" placeholder="0" />
                <Field label="CC Spend/mo (₹)" k="cc_spend" type="number" placeholder="0" />
                <Field label="Credit Limit (₹)" k="credit_limit" type="number" placeholder="1" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <Field label="Loan Page Visits" k="loan_page_visits" type="number" placeholder="0" />
                <Field label="Existing Loans" k="existing_loan_count" type="number" placeholder="0" />
                <Field label="Years of Experience" k="years_of_experience" type="number" placeholder="0" />
              </div>
            </div>
          ) : (
            /* Review Step */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px", padding: "16px", border: `1px solid ${border}` }}>
                <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: textPrimary }}>Basic Information</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {[["Name", form.name], ["Age", form.age], ["Occupation", form.occupation], ["CIBIL Score", form.cibil_score], ["Account Balance", `₹${parseFloat(form.account_balance || 0).toLocaleString("en-IN")}`]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: "10px", color: textSecondary, textTransform: "uppercase", fontWeight: "600" }}>{k}</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px", padding: "16px", border: `1px solid ${border}` }}>
                <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: textPrimary }}>Monthly Credits (₹)</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: textSecondary }}>M{n}</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: parseFloat(form[`monthly_credit_${n}`]) > 0 ? "#15803d" : textSecondary }}>
                        {parseFloat(form[`monthly_credit_${n}`] || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: darkMode ? "#0f172a" : "#f9fafb", borderRadius: "10px", padding: "16px", border: `1px solid ${border}` }}>
                <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: textPrimary }}>Financial Details</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {[["EMI Debits", `₹${parseFloat(form.emi_debits||0).toLocaleString("en-IN")}`], ["CC Spend", `₹${parseFloat(form.cc_spend||0).toLocaleString("en-IN")}`], ["Credit Limit", `₹${parseFloat(form.credit_limit||0).toLocaleString("en-IN")}`], ["Loan Page Visits", form.loan_page_visits||0], ["Existing Loans", form.existing_loan_count||0], ["Yrs Experience", form.years_of_experience||0]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: "10px", color: textSecondary, textTransform: "uppercase", fontWeight: "600" }}>{k}</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "12px 14px", border: "1px solid #bfdbfe" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#1e40af", fontWeight: "600" }}>
                  ✅ AI scoring, loan recommendation, and priority will be calculated automatically after submission.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          {step === "review" && (
            <ActionBtn label="← Edit" color="#6b7280" onClick={() => setStep("form")} />
          )}
          <ActionBtn label="Cancel" color="#6b7280" onClick={onClose} />
          {step === "form" ? (
            <ActionBtn label="Review →" color="#1e40af" onClick={handleReview} primary />
          ) : (
            <ActionBtn
              label={submitting ? "Saving..." : "✓ Save to Database"}
              color="#15803d"
              onClick={handleSubmit}
              primary
            />
          )}
        </div>
      </div>
    </div>
  );
}
