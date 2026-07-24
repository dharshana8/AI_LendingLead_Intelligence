import React from "react";

const filters = ["All", "High", "Medium", "Low"];

export default function FilterBar({ active, onFilter, search, onSearch, darkMode }) {
  const border = darkMode ? "rgba(255,255,255,0.1)" : "#E4DFD1";
  const cardBg = darkMode ? "#152540" : "#FFFFFF";
  const textPrimary = darkMode ? "#E8ECF2" : "#12181F";
  const textSecondary = darkMode ? "#8CA0BC" : "#5C6672";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 24px 0", flexWrap: "wrap", gap: "10px",
    }}>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {filters.map(f => {
          const isActive = active === f;
          const colors = {
            All:    { active: "#0E1A2B", soft: "#E8ECF2" },
            High:   { active: "#C79A3D", soft: "#F1E3C3" },
            Medium: { active: "#4338CA", soft: "#EEF2FF" },
            Low:    { active: "#2F6E63", soft: "#DCEAE6" },
          };
          const c = colors[f] || colors.All;
          return (
            <button key={f} onClick={() => onFilter(f)} style={{
              padding: "5px 14px", borderRadius: "3px", fontSize: "11px", fontWeight: "600",
              cursor: "pointer", border: `1px solid ${isActive ? c.active : border}`,
              background: isActive ? c.active : "transparent",
              color: isActive ? (f === "All" ? "#E8ECF2" : c.active === c.soft ? "#12181F" : "#FFFFFF") : textSecondary,
              fontFamily: "'IBM Plex Sans', sans-serif",
              transition: "all 0.15s",
            }}>{f}</button>
          );
        })}
      </div>
      <div style={{ position: "relative" }}>
        <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: textSecondary }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Search customer, loan, signal..."
          style={{
            paddingLeft: "30px", paddingRight: "14px", paddingTop: "7px", paddingBottom: "7px",
            borderRadius: "5px", border: `1px solid ${border}`, fontSize: "12px",
            outline: "none", width: "240px", background: cardBg, color: textPrimary,
            fontFamily: "'IBM Plex Sans', sans-serif", transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#C79A3D"}
          onBlur={e => e.target.style.borderColor = border}
        />
      </div>
    </div>
  );
}
