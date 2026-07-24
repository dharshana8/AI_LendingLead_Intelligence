import React, { useState } from "react";
import { PriorityBadge, LoanBadge } from "./Badges";
import ProgressBar from "./ProgressBar";

const COLS = [
  { key: "name",       label: "Customer",         sortable: false },
  { key: "income",     label: "Income",           sortable: true  },
  { key: "cibil",      label: "CIBIL",            sortable: true  },
  { key: "aiScore",    label: "AI Score",         sortable: true  },
  { key: "conversion", label: "Conv %",           sortable: true  },
  { key: "loan",       label: "Loan",             sortable: false },
  { key: "priority",   label: "Priority",         sortable: false },
  { key: "signal",     label: "Top Signal",       sortable: false },
];

const PAGE_SIZE = 8;

function Avatar({ name, darkMode }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#0E1A2B", "#2F6E63", "#C79A3D", "#4338CA", "#B5482F"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: "32px", height: "32px", borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: "700", color: "#fff", flexShrink: 0,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>{initials}</div>
  );
}

export default function LeadTable({ leads, onSelect, darkMode }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const cardBg = darkMode ? "#152540" : "#FFFFFF";
  const border = darkMode ? "rgba(255,255,255,0.08)" : "#E4DFD1";
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";
  const rowHover = darkMode ? "rgba(199,154,61,0.06)" : "#FDFAF4";

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

  const th = {
    padding: "9px 14px", fontSize: "10.5px", fontWeight: "700", color: textSecondary,
    textTransform: "uppercase", letterSpacing: "0.07em",
    borderBottom: `1px solid ${border}`,
    background: darkMode ? "#0E1A2B" : "#FAFAF8",
    whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
  };
  const td = {
    padding: "12px 14px", borderBottom: `1px solid ${border}`,
    verticalAlign: "middle",
  };

  return (
    <div style={{ margin: "16px 24px 0", background: cardBg, borderRadius: "6px", border: `1px solid ${border}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>Lead Intelligence</span>
          <span style={{ background: darkMode ? "rgba(199,154,61,0.15)" : "#F1E3C3", color: "#C79A3D", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}>{leads.length}</span>
        </div>
        <span style={{ fontSize: "11px", color: textSecondary, fontFamily: "'IBM Plex Sans', sans-serif" }}>Click row to view details</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{ ...th, cursor: c.sortable ? "pointer" : "default" }}
                  onClick={() => c.sortable && handleSort(c.key)}>
                  {c.label}{c.sortable && <span style={{ marginLeft: "4px", opacity: 0.5 }}>{sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(lead => (
              <LeadRow key={lead.id} lead={lead} onClick={onSelect} td={td} textPrimary={textPrimary} textSecondary={textSecondary} rowHover={rowHover} darkMode={darkMode} />
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={COLS.length} style={{ padding: "40px", textAlign: "center", color: textSecondary, fontSize: "13px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                No leads match your filters.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", color: textSecondary, fontFamily: "'IBM Plex Mono', monospace" }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {["←", ...Array.from({ length: totalPages }, (_, i) => i + 1), "→"].map((p, i) => {
              const disabled = (p === "←" && page === 1) || (p === "→" && page === totalPages);
              const isActive = p === page;
              return (
                <button key={i} disabled={disabled}
                  onClick={() => { if (!disabled) setPage(p === "←" ? page - 1 : p === "→" ? page + 1 : p); }}
                  style={{
                    width: "28px", height: "28px", borderRadius: "3px",
                    border: `1px solid ${isActive ? "#C79A3D" : border}`,
                    background: isActive ? "#C79A3D" : "transparent",
                    color: isActive ? "#0E1A2B" : disabled ? "#C8C0B0" : textSecondary,
                    fontSize: "11px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>{p}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead, onClick, td, textPrimary, textSecondary, rowHover, darkMode }) {
  const [hovered, setHovered] = useState(false);
  const convColor = lead.conversion >= 75 ? "#2F6E63" : lead.conversion >= 50 ? "#C79A3D" : "#B5482F";
  return (
    <tr onClick={() => onClick(lead)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? rowHover : "transparent",
        cursor: "pointer", transition: "background 0.15s",
        borderLeft: hovered ? "2px solid #C79A3D" : "2px solid transparent",
      }}>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar name={lead.name} darkMode={darkMode} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>{lead.name}</div>
            <div style={{ fontSize: "10px", color: textSecondary, fontFamily: "'IBM Plex Sans', sans-serif" }}>{lead.occupation}</div>
          </div>
        </div>
      </td>
      <td style={td}><span style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, fontFamily: "'IBM Plex Mono', monospace" }}>₹{lead.income.toLocaleString("en-IN")}</span></td>
      <td style={td}>
        <span style={{
          background: lead.cibil >= 750 ? "#DCEAE6" : lead.cibil >= 650 ? "#F1E3C3" : "#F3DDD4",
          color: lead.cibil >= 750 ? "#2F6E63" : lead.cibil >= 650 ? "#92400E" : "#B5482F",
          borderRadius: "3px", padding: "2px 7px", fontSize: "11px", fontWeight: "600",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>{lead.cibil}</span>
      </td>
      <td style={{ ...td, minWidth: "130px" }}><ProgressBar value={lead.aiScore} /></td>
      <td style={td}><span style={{ fontSize: "12px", fontWeight: "700", color: convColor, fontFamily: "'IBM Plex Mono', monospace" }}>{lead.conversion}%</span></td>
      <td style={td}><LoanBadge icon={lead.loanIcon} loan={lead.loan} /></td>
      <td style={td}><PriorityBadge priority={lead.priority} /></td>
      <td style={td}><span style={{ fontSize: "10.5px", background: darkMode ? "rgba(255,255,255,0.06)" : "#F5F3ED", color: textSecondary, padding: "2px 8px", borderRadius: "3px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{lead.signal}</span></td>
    </tr>
  );
}
