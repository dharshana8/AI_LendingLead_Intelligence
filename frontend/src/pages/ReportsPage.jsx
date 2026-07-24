import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import * as XLSX from "xlsx";

const DS = {
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  navy: "#0E1A2B", gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
};

const REPORTS = [
  { id: 1, name: "AI Lead Scoring Report",     desc: "Complete AI scores and conversion probabilities for all leads",    type: "AI" },
  { id: 2, name: "Monthly Conversion Summary",  desc: "Lead conversion rates, revenue, and branch performance",           type: "Monthly" },
  { id: 3, name: "Customer Portfolio Report",   desc: "Full customer details with CIBIL, income, and loan recommendations", type: "Portfolio" },
  { id: 4, name: "AI vs CIBIL Comparison",      desc: "Detailed comparison of AI screening vs traditional CIBIL methods",  type: "Analysis" },
  { id: 5, name: "Branch Performance Report",   desc: "All branch metrics including leads, conversions, and revenue",      type: "Branch" },
  { id: 6, name: "High Priority Leads Export",  desc: "High-priority leads with full AI analysis",                        type: "Leads" },
  { id: 7, name: "Audit Trail Report",          desc: "Complete user activity log for compliance and review",              type: "Audit" },
  { id: 8, name: "Quarterly Business Review",   desc: "Quarterly lending performance with AI insights and forecasts",      type: "Quarterly" },
];

const TYPE_COLORS = {
  AI:        ["#eff6ff", "#1e40af"],
  Monthly:   ["#dcfce7", "#15803d"],
  Portfolio: ["#f5f3ff", "#6d28d9"],
  Analysis:  ["#fef3c7", "#b45309"],
  Branch:    ["#ecfeff", "#0891b2"],
  Leads:     ["#fee2e2", "#b91c1c"],
  Audit:     ["#f3f4f6", "#374151"],
  Quarterly: ["#fff7ed", "#9a3412"],
};

// Build a flat array of rows from customers for a given report type
function buildRows(report, customers, analytics) {
  switch (report.type) {
    case "Leads":
      return customers
        .filter(c => c.priority === "High")
        .map(c => ({
          Name: c.name, Occupation: c.occupation, "AI Score": c.aiScore,
          Priority: c.priority, "Conversion %": c.conversion,
          Income: c.income, CIBIL: c.cibil, "Recommended Loan": c.loan,
          Status: c.status, "Top Signal": c.signal,
        }));
    case "AI":
      return customers.map(c => ({
        Name: c.name, "AI Score": c.aiScore, "Conversion %": c.conversion,
        Priority: c.priority, "Recommended Loan": c.loan,
        "Top Signal": c.signal, Status: c.status,
      }));
    case "Analysis":
      return customers.map(c => ({
        Name: c.name, "AI Score": c.aiScore, CIBIL: c.cibil,
        "AI Priority": c.priority, "Conversion %": c.conversion,
        "CIBIL Band": c.cibil >= 750 ? "Excellent" : c.cibil >= 650 ? "Good" : "Poor",
      }));
    default:
      return customers.map(c => ({
        Name: c.name, Occupation: c.occupation, Income: c.income,
        CIBIL: c.cibil, "AI Score": c.aiScore, "Conversion %": c.conversion,
        Priority: c.priority, "Recommended Loan": c.loan,
        Status: c.status, "Last Contact": c.lastContact,
      }));
  }
}

function downloadExcel(report, customers, analytics) {
  const rows = buildRows(report, customers, analytics);
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, report.type);
  XLSX.writeFile(wb, `IDBI_${report.name.replace(/\s+/g, "_")}.xlsx`);
}

function downloadPDF(report, customers, analytics) {
  const rows = buildRows(report, customers, analytics);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const tableRows = rows.slice(0, 100).map(r =>
    `<tr>${headers.map(h => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><head>
    <title>${report.name}</title>
    <style>
      body { font-family: 'IBM Plex Sans', Arial, sans-serif; font-size: 11px; color: #12181F; padding: 24px; }
      h1 { font-size: 16px; color: #0E1A2B; margin-bottom: 4px; }
      p { font-size: 11px; color: #5C6672; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #0E1A2B; color: #E8ECF2; padding: 7px 10px; font-size: 10px; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
      td { padding: 6px 10px; border-bottom: 1px solid #E4DFD1; }
      tr:nth-child(even) td { background: #F5F3ED; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>
    <h1>IDBI Bank — ${report.name}</h1>
    <p>${report.desc} · Generated ${new Date().toLocaleDateString("en-IN")}</p>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody></table>
  </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function ReportsPage() {
  const { darkMode, addToast, customers, analytics } = useApp();
  const [generating, setGenerating] = useState(null);
  const [search, setSearch] = useState("");

  const bg          = darkMode ? DS.navy  : DS.bg;
  const cardBg      = darkMode ? "#1e293b" : DS.card;
  const border      = darkMode ? "#334155" : DS.border;
  const textPrimary = darkMode ? "#f1f5f9" : DS.ink;
  const textSecondary = darkMode ? "#94a3b8" : DS.ink2;

  const filtered = REPORTS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (report, format) => {
    const key = `${report.id}-${format}`;
    setGenerating(key);
    try {
      if (format === "Excel") {
        downloadExcel(report, customers, analytics);
        addToast(`${report.name} downloaded as Excel`, "success");
      } else if (format === "PDF") {
        downloadPDF(report, customers, analytics);
        addToast(`${report.name} opened for printing/PDF`, "success");
      }
    } catch {
      addToast("Export failed", "error");
    } finally {
      setTimeout(() => setGenerating(null), 800);
    }
  };

  const handleQuickGenerate = async (label) => {
    setGenerating(label);
    await new Promise(r => setTimeout(r, 1500));
    try {
      if (label === "PDF Report") {
        downloadPDF(REPORTS[0], customers, analytics);
        addToast("PDF report opened for printing", "success");
      } else {
        const matchedReport = REPORTS.find(r => r.name.toLowerCase().includes(label.toLowerCase().split(" ")[0])) || REPORTS[0];
        downloadExcel(matchedReport, customers, analytics);
        addToast(`${label} downloaded as Excel`, "success");
      }
    } catch {
      addToast("Generation failed", "error");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: textPrimary, margin: 0 }}>Reports</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>Generate and download banking intelligence reports</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { fmt: "Excel", action: () => { downloadExcel(REPORTS[2], customers, analytics); addToast("Excel downloaded", "success"); } },
            { fmt: "PDF",   action: () => { downloadPDF(REPORTS[2], customers, analytics); addToast("PDF opened for printing", "success"); } },
          ].map(({ fmt, action }) => (
            <button key={fmt} onClick={action}
              style={{ padding: "8px 16px", borderRadius: "6px", border: `1.5px solid ${DS.gold}`, background: "transparent", color: DS.gold, fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              📤 {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Generate */}
      <div style={{ background: cardBg, borderRadius: "8px", border: `1px solid ${border}`, padding: "18px", marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: textPrimary, marginBottom: "14px" }}>⚡ Generate New Report</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "AI Lead Report", icon: "🤖", color: "#1e40af" },
            { label: "Portfolio Report", icon: "👥", color: "#7c3aed" },
            { label: "Branch Report", icon: "🏦", color: "#0891b2" },
            { label: "PDF Report", icon: "📄", color: "#b45309" },
          ].map(({ label, icon, color }) => (
            <GenerateBtn key={label} label={label} icon={icon} color={color}
              loading={generating === label}
              onClick={() => handleQuickGenerate(label)} />
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
          style={{ width: "100%", padding: "10px 12px 10px 34px", border: `1.5px solid ${border}`, borderRadius: "6px", fontSize: "13px", outline: "none", background: cardBg, color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}
          onFocus={e => e.target.style.borderColor = DS.gold}
          onBlur={e => e.target.style.borderColor = border}
        />
      </div>

      {/* Report List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(report => {
          const [tbg, tc] = TYPE_COLORS[report.type] || ["#f3f4f6", "#374151"];
          return (
            <ReportRow key={report.id} report={report} tbg={tbg} tc={tc}
              generating={generating}
              onDownload={handleDownload}
              darkMode={darkMode} cardBg={cardBg} border={border}
              textPrimary={textPrimary} textSecondary={textSecondary} />
          );
        })}
      </div>
    </div>
  );
}

function ReportRow({ report, tbg, tc, generating, onDownload, darkMode, cardBg, border, textPrimary, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: cardBg, borderRadius: "8px", border: `1px solid ${h ? DS.gold : border}`,
        padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px",
        transition: "border-color 0.15s", flexWrap: "wrap",
      }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: tbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: tc, flexShrink: 0 }}>{report.type}</div>
      <div style={{ flex: 1, minWidth: "200px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{report.name}</div>
        <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>{report.desc}</div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {["Excel", "PDF"].map(fmt => {
          const key = `${report.id}-${fmt}`;
          return (
            <DownloadBtn key={fmt} label={fmt} loading={generating === key}
              onClick={() => onDownload(report, fmt)} />
          );
        })}
      </div>
    </div>
  );
}

function DownloadBtn({ label, onClick, loading }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 10px", borderRadius: "5px",
        border: `1.5px solid ${DS.border}`,
        background: loading ? DS.goldSoft : h ? DS.navy : DS.card,
        color: loading ? DS.gold : h ? "#fff" : DS.ink2,
        fontSize: "11px", fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
      {loading ? "⏳" : "↓"} {label}
    </button>
  );
}

function GenerateBtn({ label, icon, color, loading, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px",
        borderRadius: "6px", border: `1.5px solid ${color}30`,
        background: h ? color : `${color}15`,
        color: h ? "#fff" : color,
        fontSize: "12px", fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.18s", fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
      {loading ? <span>⏳</span> : <span>{icon}</span>}
      {loading ? "Generating..." : label}
    </button>
  );
}
