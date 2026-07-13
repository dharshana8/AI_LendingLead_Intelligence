import React, { useState } from "react";

const filters = ["All", "High", "Medium", "Low"];

export default function FilterBar({ active, onFilter, search, onSearch }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 28px 0", flexWrap: "wrap", gap: "12px",
    }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {filters.map(f => (
          <FilterBtn key={f} label={f} active={active === f} onClick={() => onFilter(f)} />
        ))}
      </div>
      <SearchBar value={search} onChange={onSearch} />
    </div>
  );
}

function FilterBtn({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
        cursor: "pointer", border: "1.5px solid #1e40af", transition: "all 0.2s",
        background: active ? "#1e40af" : hovered ? "#eff6ff" : "#fff",
        color: active ? "#fff" : "#1e40af",
        transform: hovered && !active ? "translateY(-1px)" : "none",
        boxShadow: active ? "0 4px 12px rgba(30,64,175,0.3)" : "none",
      }}
    >{label}</button>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
        fontSize: "14px", color: "#9ca3af",
      }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search customer, loan, signal..."
        style={{
          paddingLeft: "36px", paddingRight: "16px", paddingTop: "9px", paddingBottom: "9px",
          borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13px",
          outline: "none", width: "260px", background: "#fff", color: "#111827",
          transition: "border 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "#1e40af"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"}
      />
    </div>
  );
}
