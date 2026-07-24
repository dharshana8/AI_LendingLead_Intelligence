import React from "react";
import { useApp } from "../context/AppContext";

const typeConfig = {
  success: { bg: "#DCEAE6", border: "#A8CECA", color: "#2F6E63" },
  error:   { bg: "#F3DDD4", border: "#D4896E", color: "#B5482F" },
  warning: { bg: "#F1E3C3", border: "#E8C97A", color: "#92400E" },
  info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8" },
};

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{ position: "fixed", top: "76px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}`}</style>
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  );
}

function Toast({ message, type = "success" }) {
  const c = typeConfig[type] || typeConfig.info;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: "5px",
      padding: "11px 16px", display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)", animation: "slideIn 0.25s ease",
      maxWidth: "320px", minWidth: "240px",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      <span style={{ fontSize: "12px", fontWeight: "500", color: c.color, flex: 1, lineHeight: 1.4 }}>{message}</span>
    </div>
  );
}
