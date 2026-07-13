import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const REPORTS = [
  { id: 1, name: "AI Lead Scoring Report", desc: "Complete AI scores and conversion probabilities for all 20 leads", type: "AI", date: "Today, 9:00 AM", size: "2.4 MB", status: "Ready" },
  { id: 2, name: "Monthly Conversion Summary", desc: "June 2025 lead conversion rates, revenue, and branch performance", type: "Monthly", date: "Today, 8:30 AM", size: "1.8 MB", status: "Ready" },
  { id: 3, name: "Customer Portfolio Report", desc: "Full customer details with CIBIL, income, and loan recommendations", type: "Portfolio", date: "Yesterday", size: "3.1 MB", status: "Ready" },
  { id: 4, name: "AI vs CIBIL Comparison", desc: "Detailed comparison of AI screening vs traditional CIBIL methods", type: "Analysis", date: "Yesterday", size: "1.2 MB", status: "Ready" },
  { id: 5, name: "Branch Performance Report", desc: "All branch metrics including leads, conversions, and revenue", type: "Branch", date: "2 days ago", size: "0.9 MB", status: "Ready" },
  { id: 6, name: "High Priority Leads Export", desc: "7 high-priority leads with full AI analysis and outreach scripts", type: "Leads", date: "2 days ago", size: "0.7 MB", status: "Ready" },
  { id: 7, name: "Audit Trail Report", desc: "Complete user activity log for compliance and review", type: "Audit", date: "3 days ago", size: "4.2 MB", status: "Ready" },
  { id: 8, name: "Quarterly Business Review", desc: "Q2 2025 lending performance with AI insights and forecasts", type: "Quarterly", date: "1 week ago", size: "5.6 MB", status: "Ready" },
];

const TYPE_COLORS = {
  AI: ["#eff6ff", "#1e40af"], Monthly: ["#dcfce7", "#15803d"], Portfolio: ["#f5f3ff", "#6d28d9"],
  Analysis: ["#fef3c7", "#b45309"], Branch: ["#ecfeff", "#0891b2"], Leads: ["#fee2e2", "#b91c1c"],
  Audit: ["#f3f4f6", "#374151"], Quarterly: ["#fff7ed", "#9a3412"],
};

export default function ReportsPage() {
  const { darkMode, addToast } = useApp();
  const [generating, setGenerating] = useState(null);
  const [search, setSearch] = useState("");

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const filtered = REPORTS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = async (type) => {
    setGenerating(type);
    await new Promise(r => setTimeout(r, 1400));
    setGenerating(null);
    addToast(`${type} report generated successfully`, "success");
  };

  const handleDownload = (report, format) => {
    addToast(`Downloading ${report.name} as ${format}...`, "info");
  };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Reports</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>Generate and download banking intelligence reports</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["CSV", "Excel", "PDF"].map(fmt => (
            <button key={fmt} onClick={() => addToast(`Exporting all reports as ${fmt}...`, "info")}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #1e40af",
                background: "transparent", color: "#1e40af", fontSize: "12px", fontWeight: "600", cursor: "pointer",
              }}>📤 {fmt}</button>
          ))}
        </div>
      </div>

      {/* Generate New */}
      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "18px", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: textPrimary, marginBottom: "14px" }}>⚡ Generate New Report</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "AI Lead Report", icon: "🤖", color: "#1e40af" },
            { label: "Conversion Report", icon: "📈", color: "#22c55e" },
            { label: "Customer Export", icon: "👥", color: "#7c3aed" },
            { label: "Branch Report", icon: "🏦", color: "#0891b2" },
            { label: "Audit Report", icon: "🔍", color: "#b45309" },
          ].map(({ label, icon, color }) => (
            <GenerateBtn key={label} label={label} icon={icon} color={color}
              loading={generating === label}
              onClick={() => handleGenerate(label)} />
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
          style={{ width: "100%", padding: "10px 12px 10px 34px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: cardBg, color: textPrimary }}
          onFocus={e => e.target.style.borderColor = "#1e40af"}
          onBlur={e => e.target.style.borderColor = border}
        />
      </div>

      {/* Report List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(report => {
          const [tbg, tc] = TYPE_COLORS[report.type] || ["#f3f4f6", "#374151"];
          return (
            <ReportRow key={report.id} report={report} tbg={tbg} tc={tc}
              onDownload={handleDownload} darkMode={darkMode} cardBg={cardBg} border={border}
              textPrimary={textPrimary} textSecondary={textSecondary} />
          );
        })}
      </div>
    </div>
  );
}

function ReportRow({ report, tbg, tc, onDownload, darkMode, cardBg, border, textPrimary, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: cardBg, borderRadius: "10px", border: `1px solid ${border}`,
        padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px",
        boxShadow: h ? "0 6px 16px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.2s", flexWrap: "wrap",
      }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: tbg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: tc, flexShrink: 0 }}>{report.type}</div>
      <div style={{ flex: 1, minWidth: "200px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: textPrimary }}>{report.name}</div>
        <div style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>{report.desc}</div>
        <div style={{ fontSize: "11px", color: textSecondary, marginTop: "4px" }}>{report.date} · {report.size}</div>
      </div>
      <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>{report.status}</span>
      <div style={{ display: "flex", gap: "6px" }}>
        {["CSV", "Excel", "PDF"].map(fmt => (
          <DownloadBtn key={fmt} label={fmt} onClick={() => onDownload(report, fmt)} />
        ))}
      </div>
    </div>
  );
}

function DownloadBtn({ label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 10px", borderRadius: "6px", border: "1.5px solid #e5e7eb",
        background: h ? "#1e40af" : "#fff", color: h ? "#fff" : "#374151",
        fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
      }}>↓ {label}</button>
  );
}

function GenerateBtn({ label, icon, color, loading, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={loading} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px",
        borderRadius: "8px", border: `1.5px solid ${color}20`,
        background: h ? color : `${color}15`, color: h ? "#fff" : color,
        fontSize: "12px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}>
      {loading ? <span style={{ fontSize: "12px" }}>⏳</span> : <span>{icon}</span>}
      {loading ? "Generating..." : label}
    </button>
  );
}
