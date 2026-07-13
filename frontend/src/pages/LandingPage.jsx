import React, { useState, useEffect } from "react";

const features = [
  { icon: "🤖", title: "AI Lead Scoring", desc: "Machine learning models score every lead in real-time with 94% accuracy" },
  { icon: "📊", title: "Predictive Analytics", desc: "Forecast conversion probability before the first customer call" },
  { icon: "🎯", title: "Smart Targeting", desc: "Identify high-intent customers missed by traditional CIBIL screening" },
  { icon: "⚡", title: "Instant Insights", desc: "Get actionable recommendations in under 2 seconds per customer" },
  { icon: "🔒", title: "Bank-Grade Security", desc: "End-to-end encryption with RBI-compliant data handling" },
  { icon: "📱", title: "Omnichannel Ready", desc: "Works seamlessly across desktop, tablet, and mobile devices" },
];

const stats = [
  { value: "94%", label: "AI Accuracy" },
  { value: "+50%", label: "More Leads Found" },
  { value: "₹4.8Cr", label: "Potential Business" },
  { value: "3x", label: "Faster Screening" },
];

const steps = [
  { step: "01", title: "Data Ingestion", desc: "Customer financial data is securely ingested from CBS and CRM systems" },
  { step: "02", title: "AI Feature Extraction", desc: "28 financial signals extracted including salary stability, EMI burden, savings ratio" },
  { step: "03", title: "ML Scoring", desc: "Gradient boosting model assigns a 0–100 AI score with confidence interval" },
  { step: "04", title: "RM Recommendation", desc: "Relationship Manager receives ranked leads with outreach scripts" },
];

function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const step = num / 40;
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + step, num);
      setCount(Math.floor(current));
      if (current >= num) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{target.startsWith("₹") ? "₹" : ""}{count}{target.includes("%") ? "%" : ""}{target.includes("x") ? "x" : ""}{target.startsWith("+") ? "+" : ""}</>;
}

export default function LandingPage({ onLogin }) {
  const [navHover, setNavHover] = useState(null);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb", padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "linear-gradient(135deg,#1e40af,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "800", color: "#fff",
          }}>IB</div>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>IDBI Lead Intelligence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {["Features", "How It Works", "Contact"].map(item => (
            <button key={item}
              onMouseEnter={() => setNavHover(item)}
              onMouseLeave={() => setNavHover(null)}
              style={{
                background: "none", border: "none", padding: "8px 14px",
                fontSize: "13px", fontWeight: "500", cursor: "pointer",
                color: navHover === item ? "#1e40af" : "#374151",
                borderRadius: "6px", transition: "color 0.2s",
              }}>{item}</button>
          ))}
          <button onClick={onLogin} style={{
            padding: "9px 22px", background: "linear-gradient(135deg,#1e40af,#3b82f6)",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(30,64,175,0.3)", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Login →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg,#1e3a8a 0%,#1e40af 40%,#2563eb 100%)",
        padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px",
          borderRadius: "50%", background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px",
          borderRadius: "50%", background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto", animation: "fadeUp 0.8s ease" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
          }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
            <span style={{ color: "#86efac", fontSize: "12px", fontWeight: "600" }}>IDBI Bank Hackathon 2026 · AI-Powered Banking</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: "800", color: "#fff", lineHeight: 1.15, marginBottom: "20px" }}>
            AI-Powered Lending<br />
            <span style={{ color: "#93c5fd" }}>Lead Intelligence</span> Platform
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px" }}>
            Transform how IDBI Relationship Managers identify, score, and convert high-value lending leads using cutting-edge machine learning.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onLogin} style={{
              padding: "14px 32px", background: "#fff", color: "#1e40af",
              border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700",
              cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >🚀 Launch Dashboard</button>
            <button style={{
              padding: "14px 32px", background: "rgba(255,255,255,0.15)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >▶ Watch Demo</button>
          </div>
        </div>

        {/* Floating dashboard preview card */}
        <div style={{
          maxWidth: "700px", margin: "52px auto 0",
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
          borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)",
          padding: "20px", animation: "float 4s ease-in-out infinite",
        }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {[["👥","20","Total Leads"],["🔥","7","High Priority"],["🤖","82","AI Score"],["📈","34%","Conversion"],["💰","₹4.8Cr","Business"]].map(([icon,val,lbl]) => (
              <div key={lbl} style={{
                background: "rgba(255,255,255,0.15)", borderRadius: "10px",
                padding: "12px 16px", textAlign: "center", minWidth: "90px",
              }}>
                <div style={{ fontSize: "18px" }}>{icon}</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>{val}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "#1e40af", padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "60px", flexWrap: "wrap" }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "#fff" }}>
                <CountUp target={value} />
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 40px", background: "#f5f7fb" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Platform Features</span>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", marginTop: "8px" }}>Built for Modern Banking</h2>
          <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "10px" }}>Everything a Relationship Manager needs to close more loans</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
          {features.map(({ icon, title, desc }) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 40px", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Process</span>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", marginTop: "8px" }}>How AI Works</h2>
        </div>
        <div style={{ display: "flex", gap: "0", maxWidth: "900px", margin: "0 auto", flexWrap: "wrap" }}>
          {steps.map(({ step, title, desc }, i) => (
            <div key={step} style={{ flex: "1 1 200px", textAlign: "center", padding: "20px", position: "relative" }}>
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute", top: "32px", right: "-1px", width: "50%",
                  height: "2px", background: "linear-gradient(90deg,#1e40af,#93c5fd)",
                  display: "none",
                }} />
              )}
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "800", color: "#fff",
                margin: "0 auto 16px", boxShadow: "0 8px 20px rgba(30,64,175,0.3)",
              }}>{step}</div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{title}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg,#1e3a8a,#1e40af)",
        padding: "80px 40px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginBottom: "16px" }}>
          Ready to Transform Your Lending Pipeline?
        </h2>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", marginBottom: "32px" }}>
          Join IDBI's AI-powered future. Start identifying high-value leads today.
        </p>
        <button onClick={onLogin} style={{
          padding: "16px 40px", background: "#fff", color: "#1e40af",
          border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700",
          cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          transition: "transform 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >Get Started — Login Now →</button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111827", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>© 2026 IDBI Bank Hackathon · AI Lending Lead Intelligence Platform</span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy Policy", "Terms", "Contact"].map(t => (
            <span key={t} style={{ fontSize: "12px", color: "#6b7280", cursor: "pointer" }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: "14px", padding: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: hovered ? "0 12px 28px rgba(0,0,0,0.1)" : "0 4px 10px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", marginBottom: "16px",
      }}>{icon}</div>
      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
