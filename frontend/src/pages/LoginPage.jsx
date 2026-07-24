import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BRAND } from "../App";

const BRANCHES = ["Chennai South", "Coimbatore Central", "Madurai North", "Trichy Main", "HQ Chennai"];
const ROLES = [
  { value: "rm", label: "Relationship Manager" },
  { value: "bm", label: "Branch Manager" },
  { value: "admin", label: "Administrator" },
];

const DS = {
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

export default function LoginPage() {
  const { login, register, addToast } = useApp();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [reg, setReg] = useState({
    employeeId: "", password: "", confirmPassword: "",
    name: "", role: "rm", branch: "Chennai South", email: "", phone: "",
  });

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    if (!empId.trim()) { setError("Employee ID or Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }
    setLoading(true);
    const result = await login(empId.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error);
    else addToast("Welcome back!", "success");
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    if (!reg.name.trim()) { setError("Full name is required"); return; }
    if (!reg.employeeId.trim()) { setError("Employee ID is required"); return; }
    if (!reg.email.trim()) { setError("Email is required"); return; }
    if (reg.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (reg.password !== reg.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    const result = await register({ employeeId: reg.employeeId, password: reg.password, name: reg.name, role: reg.role, branch: reg.branch, email: reg.email, phone: reg.phone });
    if (!result.success) { setLoading(false); setError(result.error); return; }
    const loginResult = await login(reg.employeeId, reg.password);
    setLoading(false);
    if (!loginResult.success) setError(loginResult.error);
    else {
      const roleLabel = result.data?.role === "admin" ? "Administrator" : result.data?.role === "bm" ? "Branch Manager" : "Relationship Manager";
      addToast(`Welcome, ${result.data?.name || reg.name}! Signed in as ${roleLabel}.`, "success");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: DS.bg }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lp-input::placeholder { color: #A89880; }
        .lp-input:focus { border-color: ${DS.gold} !important; outline: none; }
        .lp-select:focus { border-color: ${DS.gold} !important; outline: none; }
      `}</style>

      {/* LEFT — Navy branding panel */}
      <div style={{
        flex: 1, background: DS.navy, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 56px", minWidth: 0, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(199,154,61,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "360px", animation: "fadeUp 0.7s ease" }}>
          {/* Wordmark */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "42px", fontWeight: "700", color: DS.gold, letterSpacing: "-1px", lineHeight: 1 }}>{BRAND}</div>
            <div style={{ fontSize: "12px", fontWeight: "500", color: DS.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "6px" }}>Lending Intelligence</div>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "600", color: DS.textDark, lineHeight: 1.4, marginBottom: "16px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
            AI-powered lead scoring for relationship managers
          </h1>

          <p style={{ fontSize: "14px", color: DS.textMuted, lineHeight: 1.7, marginBottom: "48px" }}>
            Identify and convert high-value lending leads using machine learning and real-time financial analytics.
          </p>

          {/* Single clean stat */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px" }}>
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>95.95%</div>
              <div style={{ fontSize: "11px", color: DS.textMuted, marginTop: "4px" }}>Model Accuracy</div>
            </div>
            <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>3×</div>
              <div style={{ fontSize: "11px", color: DS.textMuted, marginTop: "4px" }}>Faster Screening</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>+50%</div>
              <div style={{ fontSize: "11px", color: DS.textMuted, marginTop: "4px" }}>More Leads Found</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div style={{
        width: "clamp(380px, 44%, 500px)", background: DS.card,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "52px 48px", overflowY: "auto",
        borderLeft: `1px solid ${DS.border}`,
      }}>
        <div style={{ animation: "fadeUp 0.45s ease" }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: DS.bg, borderRadius: "6px", padding: "3px", marginBottom: "32px", border: `1px solid ${DS.border}` }}>
            {[["login", "Sign In"], ["register", "Register"]].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "8px", borderRadius: "4px", border: "none",
                  background: tab === t ? DS.card : "transparent",
                  color: tab === t ? DS.ink : DS.ink2,
                  fontSize: "13px", fontWeight: tab === t ? "600" : "400",
                  cursor: "pointer", transition: "all 0.18s",
                  boxShadow: tab === t ? `0 1px 3px rgba(0,0,0,0.08)` : "none",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>{label}</button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: DS.rustSoft, border: `1px solid ${DS.rust}`, borderRadius: "6px", padding: "10px 14px", marginBottom: "18px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>⚠</span>
              <span style={{ fontSize: "13px", color: DS.rust, fontWeight: "500" }}>{error}</span>
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "22px", fontWeight: "600", color: DS.ink, marginBottom: "4px" }}>Welcome back</div>
                <div style={{ fontSize: "13px", color: DS.ink2 }}>Sign in to your {BRAND} dashboard</div>
              </div>
              <LPField label="Employee ID or Email" value={empId} onChange={setEmpId} placeholder="e.g. RM001" />
              <LPPasswordField label="Password" value={password} onChange={setPassword} show={showPass} onToggle={() => setShowPass(s => !s)} onEnter={handleLogin} />
              <LPSubmitBtn loading={loading} label="Sign In" />
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "22px", fontWeight: "600", color: DS.ink, marginBottom: "4px" }}>Create account</div>
                <div style={{ fontSize: "13px", color: DS.ink2 }}>Register as a {BRAND} employee</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <LPField label="Full Name" value={reg.name} onChange={v => setReg(r => ({ ...r, name: v }))} placeholder="Your full name" span />
                <LPField label="Employee ID" value={reg.employeeId} onChange={v => setReg(r => ({ ...r, employeeId: v }))} placeholder="e.g. RM005" />
                <LPField label="Email" value={reg.email} onChange={v => setReg(r => ({ ...r, email: v }))} placeholder="name@example.com" type="email" />
                <LPField label="Phone" value={reg.phone} onChange={v => setReg(r => ({ ...r, phone: v }))} placeholder="+91 98765 43210" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <LPSelect label="Role" value={reg.role} onChange={v => setReg(r => ({ ...r, role: v }))} options={ROLES} />
                <LPSelect label="Branch" value={reg.branch} onChange={v => setReg(r => ({ ...r, branch: v }))} options={BRANCHES.map(b => ({ value: b, label: b }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <LPPasswordField label="Password" value={reg.password} onChange={v => setReg(r => ({ ...r, password: v }))} show={showPass} onToggle={() => setShowPass(s => !s)} />
                <LPPasswordField label="Confirm Password" value={reg.confirmPassword} onChange={v => setReg(r => ({ ...r, confirmPassword: v }))} show={showPass} onToggle={() => setShowPass(s => !s)} />
              </div>
              <LPSubmitBtn loading={loading} label="Create Account" />
            </form>
          )}

          <div style={{ fontSize: "11px", color: "#C8C0B0", textAlign: "center", marginTop: "28px" }}>
            {BRAND} · AI Lending Lead Intelligence · v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

const inputBase = {
  width: "100%", padding: "9px 12px",
  border: `1px solid #E4DFD1`, borderRadius: "6px",
  fontSize: "13px", color: "#12181F", background: "#FDFCFA",
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  transition: "border-color 0.18s", boxSizing: "border-box",
};

function LPField({ label, value, onChange, placeholder, type = "text", span }) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : {}}>
      <label style={{ fontSize: "11px", fontWeight: "600", color: "#5C6672", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input className="lp-input" type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputBase} />
    </div>
  );
}

function LPPasswordField({ label, value, onChange, show, onToggle, onEnter }) {
  return (
    <div>
      <label style={{ fontSize: "11px", fontWeight: "600", color: "#5C6672", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input className="lp-input" type={show ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && onEnter?.()}
          style={{ ...inputBase, paddingRight: "48px" }} />
        <button type="button" onClick={onToggle} style={{
          position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "#8CA0BC",
          fontSize: "11px", fontWeight: "600", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>{show ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}

function LPSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ fontSize: "11px", fontWeight: "600", color: "#5C6672", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <select className="lp-select" value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%235C6672' d='M5 7L1 3h8z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function LPSubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      padding: "12px", background: loading ? "#E4DFD1" : "#C79A3D",
      color: loading ? "#8CA0BC" : "#0E1A2B", border: "none", borderRadius: "6px",
      fontSize: "13px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
      fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: "0.02em",
      transition: "background 0.18s", display: "flex", alignItems: "center",
      justifyContent: "center", gap: "8px", marginTop: "4px",
    }}>
      {loading && <div style={{ width: "13px", height: "13px", border: "2px solid rgba(14,26,43,0.2)", borderTop: "2px solid #0E1A2B", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
      {loading ? (label === "Sign In" ? "Signing in..." : "Creating account...") : label}
    </button>
  );
}
