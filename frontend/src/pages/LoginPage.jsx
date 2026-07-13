import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LoginPage({ onBack }) {
  const { login, addToast } = useApp();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (id, pass) => {
    setError("");
    if (!id.trim()) { setError("Employee ID is required"); return; }
    if (!pass.trim()) { setError("Password is required"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const result = login(id, pass);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      addToast("Welcome back! Dashboard loading...", "success");
    }
  };

  const handleDemo = (role) => {
    const map = { rm: ["RM001", "password123"], bm: ["BM001", "password123"], admin: ["ADM001", "admin123"] };
    const [id, pass] = map[role];
    setEmployeeId(id); setPassword(pass);
    handleLogin(id, pass);
  };

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setForgotSent(true);
    addToast("Password reset link sent to your email", "success");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>

      {/* LEFT PANEL */}
      <div style={{
        flex: "1", background: "linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#2563eb 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "60px 40px", position: "relative", overflow: "hidden",
        minWidth: "0",
      }}>
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", textAlign: "center", maxWidth: "380px", animation: "fadeUp 0.8s ease" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "18px",
            background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: "800", color: "#fff", margin: "0 auto 24px",
          }}>IB</div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "12px", lineHeight: 1.2 }}>
            IDBI Lending<br />Lead Intelligence
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: "40px" }}>
            AI-powered platform for Relationship Managers to identify, score, and convert high-value lending leads.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              ["🤖", "AI Lead Scoring", "94% accuracy"],
              ["📊", "Predictive Analytics", "Real-time insights"],
              ["🎯", "Smart Targeting", "+50% more leads"],
              ["🔒", "Bank-Grade Security", "RBI compliant"],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{title}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: "clamp(340px,45%,520px)", background: "#fff",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px", overflowY: "auto",
      }}>
        <div style={{ animation: "fadeUp 0.6s ease" }}>
          {!forgotMode ? (
            <>
              <button onClick={onBack} style={{
                background: "none", border: "none", color: "#6b7280", fontSize: "13px",
                cursor: "pointer", marginBottom: "24px", padding: 0, display: "flex", alignItems: "center", gap: "4px",
              }}>← Back to Home</button>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "6px" }}>Welcome Back</h2>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "32px" }}>Sign in to your IDBI dashboard</p>

              {error && (
                <div style={{
                  background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px",
                  padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center",
                }}>
                  <span style={{ fontSize: "14px" }}>⚠️</span>
                  <span style={{ fontSize: "13px", color: "#b91c1c", fontWeight: "500" }}>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} placeholder="e.g. RM001" icon="👤" />
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔑</span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin(employeeId, password)}
                      placeholder="Enter your password"
                      style={{ ...inputStyle, paddingLeft: "36px", paddingRight: "40px" }}
                      onFocus={e => e.target.style.borderColor = "#1e40af"}
                      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                    />
                    <button onClick={() => setShowPass(s => !s)} style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", fontSize: "14px",
                    }}>{showPass ? "🙈" : "👁️"}</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      style={{ width: "15px", height: "15px", accentColor: "#1e40af" }} />
                    <span style={{ fontSize: "13px", color: "#374151" }}>Remember me</span>
                  </label>
                  <button onClick={() => setForgotMode(true)} style={{
                    background: "none", border: "none", color: "#1e40af", fontSize: "13px",
                    cursor: "pointer", fontWeight: "500",
                  }}>Forgot Password?</button>
                </div>
                <button
                  onClick={() => handleLogin(employeeId, password)}
                  disabled={loading}
                  style={{
                    padding: "13px", background: loading ? "#93c5fd" : "linear-gradient(135deg,#1e40af,#2563eb)",
                    color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px",
                    fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(30,64,175,0.35)", transition: "opacity 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  {loading ? <><Spinner />Signing in...</> : "Sign In →"}
                </button>
              </div>

              <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Demo Accounts</span>
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { role: "rm", label: "RM Login", color: "#1e40af", bg: "#eff6ff" },
                  { role: "bm", label: "Branch Mgr", color: "#7c3aed", bg: "#f5f3ff" },
                  { role: "admin", label: "Admin", color: "#b91c1c", bg: "#fee2e2" },
                ].map(({ role, label, color, bg }) => (
                  <DemoBtn key={role} label={label} color={color} bg={bg} onClick={() => handleDemo(role)} />
                ))}
              </div>

              <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", marginTop: "20px" }}>
                Demo: RM001 / BM001 / ADM001 · Password: password123
              </p>
            </>
          ) : (
            <ForgotPanel
              email={forgotEmail} setEmail={setForgotEmail}
              sent={forgotSent} loading={loading}
              onSubmit={handleForgot} onBack={() => { setForgotMode(false); setForgotSent(false); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>{icon}</span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...inputStyle, paddingLeft: "36px" }}
          onFocus={e => e.target.style.borderColor = "#1e40af"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
      </div>
    </div>
  );
}

function ForgotPanel({ email, setEmail, sent, loading, onSubmit, onBack }) {
  return (
    <>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "13px", cursor: "pointer", marginBottom: "24px", padding: 0 }}>← Back to Login</button>
      <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Reset Password</h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "28px" }}>Enter your registered email to receive a reset link.</p>
      {sent ? (
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>✅</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#15803d" }}>Reset link sent!</div>
          <div style={{ fontSize: "12px", color: "#166534", marginTop: "6px" }}>Check your email inbox</div>
        </div>
      ) : (
        <>
          <Field label="Registered Email" value={email} onChange={setEmail} placeholder="your.email@idbi.co.in" icon="📧" />
          <button onClick={onSubmit} disabled={loading} style={{
            marginTop: "16px", width: "100%", padding: "13px",
            background: "linear-gradient(135deg,#1e40af,#2563eb)", color: "#fff",
            border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            {loading ? <><Spinner />Sending...</> : "Send Reset Link"}
          </button>
        </>
      )}
    </>
  );
}

function DemoBtn({ label, color, bg, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flex: 1, padding: "9px 6px", background: h ? color : bg,
        color: h ? "#fff" : color, border: `1.5px solid ${color}`,
        borderRadius: "8px", fontSize: "12px", fontWeight: "600",
        cursor: "pointer", transition: "all 0.2s",
      }}>{label}</button>
  );
}

function Spinner() {
  return <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" };
const inputStyle = {
  width: "100%", padding: "11px 12px", border: "1.5px solid #e5e7eb",
  borderRadius: "8px", fontSize: "13px", outline: "none", color: "#111827",
  transition: "border-color 0.2s", background: "#fff",
};
