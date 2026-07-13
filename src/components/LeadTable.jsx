import React, { useState } from "react";
import { PriorityBadge, LoanBadge } from "./Badges";
import ProgressBar from "./ProgressBar";

const COLS = [
  { key: "name", label: "Customer", sortable: false },
  { key: "income", label: "Income", sortable: true },
  { key: "cibil", label: "CIBIL", sortable: true },
  { key: "aiScore", label: "AI Score", sortable: true },
  { key: "conversion", label: "Conversion %", sortable: true },
  { key: "loan", label: "Recommended Loan", sortable: false },
  { key: "priority", label: "Priority", sortable: false },
  { key: "signal", label: "Top Signal", sortable: false },
];

const PAGE_SIZE = 8;

function formatIncome(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function CibilBadge({ score }) {
  const color = score >= 750 ? "#15803d" : score >= 650 ? "#b45309" : "#b91c1c";
  const bg = score >= 750 ? "#dcfce7" : score >= 650 ? "#fef3c7" : "#fee2e2";
  return (
    <span style={{ background: bg, color, borderRadius: "8px", padding: "3px 10px", fontSize: "12px", fontWeight: "700" }}>
      {score}
    </span>
  );
}

function Avatar({ name }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#1e40af", "#7c3aed", "#0891b2", "#065f46", "#9a3412", "#1d4ed8"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0,
    }}>{initials}</div>
  );
}

function LeadRow({ lead, onClick }) {
  const [hovered, setHovered] = useState(false);
  const convColor = lead.conversion >= 75 ? "#15803d" : lead.conversion >= 50 ? "#b45309" : "#b91c1c";
  return (
    <tr
      onClick={() => onClick(lead)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#eff6ff" : "transparent",
        cursor: "pointer", transition: "background 0.2s",
        borderLeft: hovered ? "3px solid #1e40af" : "3px solid transparent",
      }}
    >
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar name={lead.name} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{lead.name}</div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>{lead.occupation}</div>
          </div>
        </div>
      </td>
      <td style={td}><span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{formatIncome(lead.income)}</span></td>
      <td style={td}><CibilBadge score={lead.cibil} /></td>
      <td style={{ ...td, minWidth: "140px" }}><ProgressBar value={lead.aiScore} /></td>
      <td style={td}><span style={{ fontSize: "16px", fontWeight: "800", color: convColor }}>{lead.conversion}%</span></td>
      <td style={td}><LoanBadge icon={lead.loanIcon} loan={lead.loan} /></td>
      <td style={td}><PriorityBadge priority={lead.priority} /></td>
      <td style={td}>
        <span style={{
          fontSize: "11px", background: "#f3f4f6", color: "#374151",
          padding: "3px 10px", borderRadius: "6px", fontWeight: "500",
        }}>{lead.signal}</span>
      </td>
    </tr>
  );
}

const td = { padding: "14px 16px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };
const th = {
  padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#6b7280",
  textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e5e7eb",
  background: "#f9fafb", whiteSpace: "nowrap",
};

export default function LeadTable({ leads, onSelect }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const sorted = [...leads].sort((a, b) => {
    if (!sortKey) return 0;
    return sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ margin: "20px 28px 0", background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 4px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Lead Intelligence Table</span>
          <span style={{ marginLeft: "10px", background: "#eff6ff", color: "#1e40af", fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px" }}>{leads.length} leads</span>
        </div>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>Click any row to view details</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{ ...th, cursor: c.sortable ? "pointer" : "default" }}
                  onClick={() => c.sortable && handleSort(c.key)}>
                  {c.label} {c.sortable && (sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : "↕")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(lead => (
              <LeadRow key={lead.id} lead={lead} onClick={onSelect} />
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <PageBtn label="←" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PageBtn key={p} label={p} active={p === page} onClick={() => setPage(p)} />
            ))}
            <PageBtn label="→" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({ label, active, disabled, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid",
        borderColor: active ? "#1e40af" : "#e5e7eb",
        background: active ? "#1e40af" : hovered ? "#eff6ff" : "#fff",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
        fontSize: "12px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >{label}</button>
  );
}
