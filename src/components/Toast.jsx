import React from "react";
import { useApp } from "../context/AppContext";

const typeConfig = {
  success: { bg: "#dcfce7", border: "#bbf7d0", color: "#15803d", icon: "✅" },
  error: { bg: "#fee2e2", border: "#fecaca", color: "#b91c1c", icon: "❌" },
  warning: { bg: "#fef3c7", border: "#fde68a", color: "#92400e", icon: "⚠️" },
  info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", icon: "ℹ️" },
};

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{ position: "fixed", top: "80px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}`}</style>
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  );
}

function Toast({ message, type = "success" }) {
  const c = typeConfig[type] || typeConfig.info;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: "10px",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "slideIn 0.3s ease",
      maxWidth: "320px", minWidth: "240px",
    }}>
      <span style={{ fontSize: "16px" }}>{c.icon}</span>
      <span style={{ fontSize: "13px", fontWeight: "500", color: c.color, flex: 1 }}>{message}</span>
    </div>
  );
}
