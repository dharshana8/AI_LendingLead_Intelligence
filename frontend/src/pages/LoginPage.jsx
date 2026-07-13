import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const BRANCHES = ["Mumbai Main", "Delhi Central", "Bangalore Tech", "Chennai South", "HQ Mumbai"];
const ROLES = [{ value: "rm", label: "Relationship Manager" }, { value: "bm", label: "Branch Manager" }, { value: "admin", label: "Administrator" }];

export default function LoginPage() {
  const { login, register, addToast } = useApp();
  const [tab, setTab] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [reg, setReg] = useState({ employeeId: "", password: "", confirmPassword: "", name: "", role: "rm", branch: "Mumbai Main", email: "", phone: "" });

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    if (!empId.trim()) { setError("Employee ID is required"); return; }
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
    setLoading(false);
    if (!result.success) setError(result.error);
    else addToast("Account created successfully!", "success");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#f5f7fb" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder { color: #9ca3af; }
      `}</style>

      {/* LEFT — Branding */}
      <div style={{
        flex: 1, background: "linear-gradient(160deg,#0f2460 0%,#1e40af 60%,#1d4ed8 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "60px 48px", position: "relative", overflow: "hidden", minWidth: 0,
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: "-120px", right: "-120px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ position: "relative", maxWidth: "360px", animation: "fadeUp 0.8s ease" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", fontWeight: "800", color: "#fff",
            }}>IB</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>IDBI Bank</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "1px" }}>Lead Intelligence Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#fff", lineHeight: 1.25, marginBottom: "16px" }}>
            AI-Powered<br />Lending Intelligence
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: "44px" }}>
            Identify, score, and convert high-value lending leads using machine learning and real-time financial analytics.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "🤖", title: "AI Lead Scoring", sub: "95.95% model accuracy" },
              { icon: "📊", title: "Predictive Analytics", sub: "Real-time portfolio insights" },
              { icon: "🎯", title: "Role-Based Access", sub: "RM · Branch Manager · Admin" },
              { icon: "🔒", title: "Secure & Compliant", sub: "RBI guidelines adherent" },
            ].map(({ icon, title, sub }) => (
              <div key={title} style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: "rgba(255,255,255,0.07)", borderRadius: "10px",
                padding: "12px 16px", border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{title}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "1px" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{
        width: "clamp(360px,44%,500px)", background: "#fff",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 44px", overflowY: "auto",
        boxShadow: "-4px 0 40px rgba(0,0,0,0.06)",
      }}>
        <div style={{ animation: "fadeUp 0.5s ease" }}>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", marginBottom: "32px" }}>
            {[["login", "Sign In"], ["register", "Register"]].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "9px", borderRadius: "7px", border: "none",
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#111827" : "#6b7280",
                  fontSize: "13px", fontWeight: tab === t ? "700" : "500",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}>{label}</button>
            ))}
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px",
              padding: "10px 14px", marginBottom: "18px", display: "flex", gap: "8px", alignItems: "center",
            }}>
              <span style={{ fontSize: "13px" }}>⚠️</span>
              <span style={{ fontSize: "13px", color: "#b91c1c", fontWeight: "500" }}>{error}</span>
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ marginBottom: "4px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: 0 }}>Welcome back</h2>
                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Sign in to your IDBI dashboard</p>
              </div>

              <Field label="Employee ID" value={empId} onChange={setEmpId} placeholder="Enter your Employee ID" />
              <PasswordField label="Password" value={password} onChange={setPassword} show={showPass} onToggle={() => setShowPass(s => !s)} onEnter={handleLogin} />

              <SubmitBtn loading={loading} label="Sign In" />
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ marginBottom: "4px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: 0 }}>Create account</h2>
                <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Register as an IDBI employee</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Full Name" value={reg.name} onChange={v => setReg(r => ({ ...r, name: v }))} placeholder="Your full name" span />
                <Field label="Employee ID" value={reg.employeeId} onChange={v => setReg(r => ({ ...r, employeeId: v }))} placeholder="e.g. RM005" />
                <Field label="Email" value={reg.email} onChange={v => setReg(r => ({ ...r, email: v }))} placeholder="name@idbi.co.in" type="email" />
                <Field label="Phone" value={reg.phone} onChange={v => setReg(r => ({ ...r, phone: v }))} placeholder="+91 98765 43210" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <SelectField label="Role" value={reg.role} onChange={v => setReg(r => ({ ...r, role: v }))} options={ROLES} />
                <SelectField label="Branch" value={reg.branch} onChange={v => setReg(r => ({ ...r, branch: v }))} options={BRANCHES.map(b => ({ value: b, label: b }))} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <PasswordField label="Password" value={reg.password} onChange={v => setReg(r => ({ ...r, password: v }))} show={showPass} onToggle={() => setShowPass(s => !s)} />
                <PasswordField label="Confirm Password" value={reg.confirmPassword} onChange={v => setReg(r => ({ ...r, confirmPassword: v }))} show={showPass} onToggle={() => setShowPass(s => !s)} />
              </div>

              <SubmitBtn loading={loading} label="Create Account" />
            </form>
          )}

          <p style={{ fontSize: "11px", color: "#d1d5db", textAlign: "center", marginTop: "24px" }}>
            IDBI Bank · AI Lending Lead Intelligence Platform · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", span }) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : {}}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = "#1e40af"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, onEnter }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && onEnter?.()}
          style={{ ...inputStyle, paddingRight: "38px" }}
          onFocus={e => e.target.style.borderColor = "#1e40af"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        <button type="button" onClick={onToggle} style={{
          position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "13px", padding: "2px",
        }}>{show ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      padding: "13px", background: loading ? "#93c5fd" : "linear-gradient(135deg,#1e40af,#2563eb)",
      color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px",
      fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
      boxShadow: "0 4px 14px rgba(30,64,175,0.3)", transition: "opacity 0.2s",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "4px",
    }}>
      {loading ? <><Spinner />{label === "Sign In" ? "Signing in..." : "Creating account..."}</> : label}
    </button>
  );
}

function Spinner() {
  return <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb",
  borderRadius: "8px", fontSize: "13px", outline: "none", color: "#111827",
  transition: "border-color 0.2s", background: "#fff", boxSizing: "border-box",
};
