import React, { useState } from "react";

const styles = {
  header: {
    position: "sticky", top: 0, zIndex: 1000,
    background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
    height: "70px", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 28px",
    boxShadow: "0 4px 20px rgba(30,64,175,0.3)",
  },
  left: { display: "flex", alignItems: "center", gap: "14px" },
  logoBox: {
    width: "42px", height: "42px", borderRadius: "10px",
    background: "rgba(255,255,255,0.2)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "18px", fontWeight: "800", color: "#fff",
    border: "2px solid rgba(255,255,255,0.3)",
  },
  titleBlock: {},
  title: { color: "#fff", fontSize: "17px", fontWeight: "700", margin: 0, lineHeight: 1.2 },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: "11px", margin: 0, marginTop: "2px" },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  liveBadge: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)",
    borderRadius: "20px", padding: "4px 12px",
  },
  liveDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#22c55e", animation: "pulse 1.5s infinite",
  },
  liveText: { color: "#86efac", fontSize: "12px", fontWeight: "600" },
  iconBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "rgba(255,255,255,0.15)", border: "none",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "16px", color: "#fff",
    transition: "background 0.2s",
  },
  avatar: {
    width: "38px", height: "38px", borderRadius: "50%",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", color: "#fff",
    border: "2px solid rgba(255,255,255,0.4)", cursor: "pointer",
  },
  rmInfo: { textAlign: "right" },
  rmName: { color: "#fff", fontSize: "12px", fontWeight: "600", margin: 0 },
  rmRole: { color: "rgba(255,255,255,0.6)", fontSize: "10px", margin: 0 },
};

export default function Header() {
  const [notifHover, setNotifHover] = useState(false);
  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }`}</style>
      <header style={styles.header}>
        <div style={styles.left}>
          <div style={styles.logoBox}>IB</div>
          <div style={styles.titleBlock}>
            <p style={styles.title}>IDBI Lending Lead Intelligence</p>
            <p style={styles.subtitle}>AI Powered Lending Recommendation Engine</p>
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.liveBadge}>
            <div style={styles.liveDot} />
            <span style={styles.liveText}>Live</span>
          </div>
          <button
            style={{ ...styles.iconBtn, background: notifHover ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)" }}
            onMouseEnter={() => setNotifHover(true)}
            onMouseLeave={() => setNotifHover(false)}
          >🔔</button>
          <div style={styles.rmInfo}>
            <p style={styles.rmName}>Ankit Sharma</p>
            <p style={styles.rmRole}>Relationship Manager</p>
          </div>
          <div style={styles.avatar}>AS</div>
        </div>
      </header>
    </>
  );
}
