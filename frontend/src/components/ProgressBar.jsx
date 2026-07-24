import React, { useEffect, useState } from "react";

export default function ProgressBar({ value, animate = true }) {
  const [width, setWidth] = useState(0);
  const color = value >= 80 ? "#2F6E63" : value >= 65 ? "#C79A3D" : "#B5482F";

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), animate ? 100 : 0);
    return () => clearTimeout(t);
  }, [value, animate]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "5px", background: "#E4DFD1", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`, background: color,
          borderRadius: "2px", transition: "width 1s ease",
        }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: "600", color, minWidth: "24px", fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
    </div>
  );
}
