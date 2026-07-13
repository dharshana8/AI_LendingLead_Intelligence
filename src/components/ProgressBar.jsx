import React, { useEffect, useState } from "react";

export default function ProgressBar({ value, animate = true }) {
  const [width, setWidth] = useState(0);
  const color = value >= 80 ? "#22c55e" : value >= 65 ? "#f59e0b" : "#ef4444";

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setWidth(value), 100);
      return () => clearTimeout(t);
    } else {
      setWidth(value);
    }
  }, [value, animate]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        flex: 1, height: "7px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${width}%`, background: color,
          borderRadius: "10px", transition: "width 1s ease",
        }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: "700", color, minWidth: "28px" }}>{value}</span>
    </div>
  );
}
