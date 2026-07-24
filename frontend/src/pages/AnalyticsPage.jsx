import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, LabelList,
} from "recharts";

const DS = {
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;
  const bg = darkMode ? "#1e2d45" : "#fff";
  const border = darkMode ? "rgba(255,255,255,0.12)" : "#E4DFD1";
  const text = darkMode ? "#E8ECF2" : "#12181F";
  const muted = darkMode ? "#8CA0BC" : "#5C6672";
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {label && <div style={{ fontSize: "11px", fontWeight: "700", color: muted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: i < payload.length - 1 ? "4px" : 0 }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: muted }}>{p.name}:</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: text, fontFamily: "'IBM Plex Mono', monospace" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Active Pie Slice ──────────────────────────────────────────────────────────
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} style={{ fontSize: "18px", fontWeight: "800", fontFamily: "'IBM Plex Mono', monospace" }}>{value}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#8CA0BC" style={{ fontSize: "11px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{payload.name}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={fill} style={{ fontSize: "12px", fontWeight: "700", fontFamily: "'IBM Plex Mono', monospace" }}>{(percent * 100).toFixed(0)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

function StatCard({ icon, value, label, sub, color, bg, darkMode, border }) {
  const [h, setH] = useState(false);
  const cardBg = darkMode ? DS.navy2 : DS.card;
  const textPrimary = darkMode ? DS.textDark : DS.ink;
  const textSecondary = darkMode ? DS.textMuted : DS.ink2;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flex: "1 1 160px", background: cardBg, borderRadius: "8px", padding: "18px",
        border: `1px solid ${border}`,
        boxShadow: h ? "0 8px 20px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: h ? "translateY(-2px)" : "none", transition: "all 0.2s",
      }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontSize: "26px", fontWeight: "800", color: textPrimary, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: "12px", fontWeight: "600", color: textPrimary, marginTop: "4px" }}>{label}</div>
      <div style={{ fontSize: "11px", color: textSecondary, marginTop: "3px" }}>{sub}</div>
    </div>
  );
}

function Section({ title, icon, children, cardBg, border, textPrimary, badge }) {
  return (
    <div style={{ background: cardBg, borderRadius: "8px", border: `1px solid ${border}`, padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: "15px" }}>{icon}</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: textPrimary }}>{title}</span>
        {badge && <span style={{ marginLeft: "auto", background: "rgba(47,110,99,0.15)", color: DS.teal, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px", border: `1px solid rgba(47,110,99,0.3)`, fontFamily: "'IBM Plex Mono', monospace" }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function PriorityDistribution({ highCount, medCount, lowCount, total, darkMode, gridColor, axisColor }) {
  const safeTotal = total || 1;
  // Use separate bars (not stacked) — avoids Recharts zero-segment crash
  const data = [
    { name: "High",   count: highCount || 0,  fill: DS.rust },
    { name: "Medium", count: medCount  || 0,  fill: DS.gold },
    { name: "Low",    count: lowCount  || 0,  fill: DS.teal },
  ];

  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="35%" layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: axisColor, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 }} axisLine={false} tickLine={false} width={52} />
          <Tooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} minPointSize={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: "12px", fontWeight: "700", fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        {[["High", highCount || 0, DS.rust, DS.rustSoft], ["Medium", medCount || 0, DS.gold, DS.goldSoft], ["Low", lowCount || 0, DS.teal, DS.tealSoft]].map(([label, val, color, bg]) => (
          <div key={label} style={{ flex: 1, textAlign: "center", background: bg, borderRadius: "6px", padding: "8px 4px" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color, fontFamily: "'IBM Plex Mono', monospace" }}>{val}</div>
            <div style={{ fontSize: "11px", fontWeight: "700", color, marginTop: "2px" }}>{label}</div>
            <div style={{ fontSize: "10px", color, opacity: 0.7, marginTop: "1px" }}>{Math.round((val / safeTotal) * 100)}%</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  const { darkMode, analytics, customers } = useApp();
  const [activePieIndex, setActivePieIndex] = useState(0);

  const bg     = darkMode ? DS.navy  : DS.bg;
  const cardBg = darkMode ? DS.navy2 : DS.card;
  const border = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const textPrimary   = darkMode ? DS.textDark  : DS.ink;
  const textSecondary = darkMode ? DS.textMuted : DS.ink2;
  const gridColor = darkMode ? "rgba(255,255,255,0.06)" : "#E4DFD1";
  const axisColor = darkMode ? "#8CA0BC" : "#5C6672";

  const total      = analytics?.total      ?? customers.length;
  const highCount  = analytics?.highCount  ?? customers.filter(l => l.priority === "High").length;
  const medCount   = analytics?.medCount   ?? customers.filter(l => l.priority === "Medium").length;
  const lowCount   = analytics?.lowCount   ?? customers.filter(l => l.priority === "Low").length;
  const avgScore   = analytics?.avgScore   ?? 0;
  const avgConv    = analytics?.avgConv    ?? 0;
  const potentialRevenue = analytics?.potentialRevenue ?? "₹0Cr";

  // ── Chart data ──────────────────────────────────────────────────────────────
  const monthlyData = (analytics?.monthly ?? []).map(m => ({
    month: m.month,
    "Total Leads": m.leads,
    "Converted": m.converted,
    "Pipeline": m.leads - m.converted,
  }));

  const loanPieData = (analytics?.loanDist ?? [])
    .filter(d => d.count > 0)
    .map(d => ({ name: d.loan, value: d.count, color: d.color }));

  const funnelData = (analytics?.funnel ?? []).map(f => ({
    name: f.stage,
    value: f.count,
    fill: f.color,
  }));

  const radarData = (analytics?.aiMetrics ?? []).map(m => ({
    metric: m.label.replace("Overall ", ""),
    value: m.value,
    fullMark: 100,
  }));

  const branchData = (analytics?.branches ?? []).map(b => ({
    name: b.name.split(" ")[0],
    Leads: b.leads,
    "Conv %": b.conversion,
  }));

  // Area chart — AI score distribution from real customers
  const scoreRanges = [
    { range: "0–20", count: 0 }, { range: "21–40", count: 0 },
    { range: "41–60", count: 0 }, { range: "61–80", count: 0 }, { range: "81–100", count: 0 },
  ];
  customers.forEach(c => {
    const s = c.aiScore ?? 0;
    if (s <= 20) scoreRanges[0].count++;
    else if (s <= 40) scoreRanges[1].count++;
    else if (s <= 60) scoreRanges[2].count++;
    else if (s <= 80) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: textPrimary, margin: 0 }}>Analytics & Insights</h2>
        <p style={{ fontSize: "12px", color: textSecondary, margin: "4px 0 0" }}>AI-powered performance metrics for your lending portfolio</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard icon="👥" value={total}            label="Total Leads"       sub="Active pipeline"   color={DS.navy} bg={DS.goldSoft}  darkMode={darkMode} border={border} />
        <StatCard icon="🔥" value={highCount}        label="High Priority"     sub="Immediate action"  color={DS.rust} bg={DS.rustSoft}  darkMode={darkMode} border={border} />
        <StatCard icon="🤖" value={avgScore}         label="Avg AI Score"      sub="Above benchmark"   color={DS.gold} bg={DS.goldSoft}  darkMode={darkMode} border={border} />
        <StatCard icon="📈" value={`${avgConv}%`}    label="Avg Conversion"    sub="vs 15% industry"   color={DS.teal} bg={DS.tealSoft}  darkMode={darkMode} border={border} />
        <StatCard icon="💰" value={potentialRevenue} label="Potential Revenue" sub="This month"        color={DS.gold} bg={DS.goldSoft}  darkMode={darkMode} border={border} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "16px", marginBottom: "16px" }}>

        {/* 1. Monthly Lead Growth — Grouped Bar Chart */}
        <Section title="Monthly Lead Growth" icon="📅" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "'IBM Plex Sans', sans-serif", paddingTop: "8px" }} />
              <Bar dataKey="Total Leads" fill={DS.gold} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Converted" fill={DS.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* 2. Loan Distribution — Interactive Donut */}
        <Section title="Loan Type Distribution" icon="🏦" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  data={loanPieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                >
                  {loanPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              {loanPieData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", opacity: activePieIndex === i ? 1 : 0.6, transition: "opacity 0.2s" }}
                  onMouseEnter={() => setActivePieIndex(i)}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: textSecondary, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: d.color, fontFamily: "'IBM Plex Mono', monospace" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 3. Lead Funnel — Horizontal Bar */}
        <Section title="Lead Conversion Funnel" icon="🔽" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Sans', monospace" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList dataKey="value" position="right" style={{ fontSize: "11px", fontWeight: "700", fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* 4. AI Score Distribution — Area Chart */}
        <Section title="AI Score Distribution" icon="🎯" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={scoreRanges}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DS.gold} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DS.gold} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ stroke: DS.gold, strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area type="monotone" dataKey="count" name="Customers" stroke={DS.gold} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: DS.gold, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: DS.gold }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {/* 5. AI Model Performance — Radar Chart */}
        <div style={{ background: DS.navy, borderRadius: "8px", padding: "18px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "15px" }}>🤖</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: DS.textDark }}>AI Model Performance</span>
            <span style={{ marginLeft: "auto", background: "rgba(47,110,99,0.2)", color: DS.teal, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "3px", border: "1px solid rgba(47,110,99,0.3)", fontFamily: "'IBM Plex Mono', monospace" }}>LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={75}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: DS.textMuted, fontFamily: "'IBM Plex Sans', sans-serif" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: DS.textMuted }} axisLine={false} />
              <Radar name="Score" dataKey="value" stroke={DS.gold} fill={DS.gold} fillOpacity={0.2} strokeWidth={2} dot={{ fill: DS.gold, r: 3 }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: "#1e2d45", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "8px 12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace" }}>{payload[0].value}%</span>
                  </div>
                );
              }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Branch Performance — Grouped Bar */}
        <Section title="Branch Performance" icon="🏢" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: axisColor, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "'IBM Plex Sans', sans-serif", paddingTop: "8px" }} />
              <Bar yAxisId="left" dataKey="Leads" fill={DS.navy} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="Conv %" fill={DS.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* 7. Priority Distribution */}
        <Section title="Priority Distribution" icon="📊" cardBg={cardBg} border={border} textPrimary={textPrimary}>
          <PriorityDistribution
            highCount={highCount}
            medCount={medCount}
            lowCount={lowCount}
            total={total}
            darkMode={darkMode}
            gridColor={gridColor}
            axisColor={axisColor}
          />
        </Section>

      </div>
    </div>
  );
}
