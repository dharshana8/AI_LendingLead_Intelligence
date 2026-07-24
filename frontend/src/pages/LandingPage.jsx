import React, { useState, useEffect } from "react";
import { BRAND } from "../App";

const DS = {
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F",
  ink: "#12181F", ink2: "#5C6672",
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const features = [
  { icon: "🤖", title: "AI Lead Scoring", desc: "RandomForest model scores every lead in real-time with 95.95% accuracy" },
  { icon: "📊", title: "Predictive Analytics", desc: "Forecast conversion probability before the first customer call" },
  { icon: "🎯", title: "Smart Targeting", desc: "Identify high-intent customers missed by traditional CIBIL screening" },
  { icon: "⚡", title: "Instant Insights", desc: "Get actionable recommendations in under 2 seconds per customer" },
  { icon: "🔒", title: "Bank-Grade Security", desc: "End-to-end encryption with RBI-compliant data handling" },
  { icon: "📱", title: "Role-Based Access", desc: "RM · Branch Manager · Admin — each with tailored dashboards" },
];

const steps = [
  { step: "01", title: "Data Ingestion", desc: "Customer financial data securely ingested from CBS and CRM systems" },
  { step: "02", title: "Feature Extraction", desc: "28 financial signals extracted: salary stability, EMI burden, savings ratio" },
  { step: "03", title: "ML Scoring", desc: "RandomForest assigns a 0–100 AI score with SHAP explainability" },
  { step: "04", title: "RM Recommendation", desc: "Relationship Manager receives ranked leads with outreach scripts" },
];

export default function LandingPage({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: DS.bg, overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? DS.navy : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "22px", fontWeight: "700", color: DS.gold, letterSpacing: "-0.5px" }}>{BRAND}</span>
          <span style={{ fontSize: "12px", color: scrolled ? DS.textMuted : DS.ink2, fontWeight: "500", letterSpacing: "0.1em", textTransform: "uppercase" }}>Lending Intelligence</span>
        </div>
        <button onClick={onLogin} style={{
          padding: "8px 22px", background: DS.gold, color: DS.navy,
          border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>Sign In →</button>
      </nav>

      {/* HERO — navy dark panel */}
      <section style={{ background: DS.navy, padding: "80px 40px 60px", position: "relative", overflow: "hidden" }}>
        {/* subtle dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(199,154,61,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto", textAlign: "center", animation: "fadeUp 0.7s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(47,110,99,0.15)", border: "1px solid rgba(47,110,99,0.3)", borderRadius: "3px", padding: "5px 14px", marginBottom: "28px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: DS.teal, animation: "blink 1.5s infinite" }} />
            <span style={{ color: DS.teal, fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace" }}>Hackathon 2026 · AI-Powered Banking</span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(36px,6vw,68px)", fontWeight: "700", color: DS.textDark, lineHeight: 1.15, marginBottom: "20px" }}>
            AI-Powered Lending<br />
            <span style={{ color: DS.gold }}>Lead Intelligence</span> Platform
          </h1>
          <p style={{ fontSize: "18px", color: DS.textMuted, lineHeight: 1.75, marginBottom: "36px", maxWidth: "520px", margin: "0 auto 36px" }}>
            Transform how Relationship Managers identify, score, and convert high-value lending leads using machine learning and real-time financial analytics.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onLogin} style={{
              padding: "15px 36px", background: DS.gold, color: DS.navy,
              border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "700",
              cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(199,154,61,0.3)", transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >Launch Dashboard →</button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: DS.navy2, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "60px", flexWrap: "wrap" }}>
          {[["95.95%","AI Accuracy"],["+50%","More Leads Found"],["₹4.8Cr","Potential Business"],["3x","Faster Screening"]].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "42px", fontWeight: "800", color: DS.gold, fontFamily: "'IBM Plex Mono', monospace" }}>{val}</div>
              <div style={{ fontSize: "15px", color: DS.textMuted, marginTop: "6px" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 40px", background: DS.bg }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: DS.gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px", fontFamily: "'IBM Plex Mono', monospace" }}>Platform Features</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "36px", fontWeight: "700", color: DS.ink }}>Built for Modern Banking</h2>
          <p style={{ fontSize: "16px", color: DS.ink2, marginTop: "10px" }}>Everything a Relationship Manager needs to close more loans</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", maxWidth: "1100px", margin: "0 auto" }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 40px", background: DS.card, borderTop: `1px solid ${DS.border}`, borderBottom: `1px solid ${DS.border}` }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: DS.gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px", fontFamily: "'IBM Plex Mono', monospace" }}>Process</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "36px", fontWeight: "700", color: DS.ink }}>How AI Works</h2>
        </div>
        <div style={{ display: "flex", gap: "0", maxWidth: "900px", margin: "0 auto", flexWrap: "wrap" }}>
          {steps.map(({ step, title, desc }, i) => (
            <div key={step} style={{ flex: "1 1 200px", textAlign: "center", padding: "20px", position: "relative" }}>
              {i < steps.length - 1 && (
                <div style={{ position: "absolute", top: "28px", right: 0, width: "50%", height: "1px", background: DS.border }} />
              )}
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: DS.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: DS.gold, margin: "0 auto 16px", fontFamily: "'IBM Plex Mono', monospace" }}>{step}</div>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: DS.ink, marginBottom: "8px" }}>{title}</h3>
              <p style={{ fontSize: "12px", color: DS.ink2, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: DS.navy, padding: "80px 40px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(199,154,61,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "36px", fontWeight: "700", color: DS.textDark, marginBottom: "14px" }}>
          Ready to Transform Your Lending Pipeline?
        </h2>
        <p style={{ fontSize: "16px", color: DS.textMuted, marginBottom: "32px" }}>
          Start identifying high-value leads today.
        </p>
        <button onClick={onLogin} style={{
          padding: "16px 44px", background: DS.gold, color: DS.navy,
          border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
          boxShadow: "0 4px 20px rgba(199,154,61,0.3)", transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >Get Started — Sign In Now →</button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: DS.navy2, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: DS.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>© 2026 {BRAND} · AI Lending Lead Intelligence Platform</span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy Policy", "Terms", "Contact"].map(t => (
            <span key={t} style={{ fontSize: "11px", color: DS.textMuted, cursor: "pointer" }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: DS.card, borderRadius: "6px", padding: "22px",
        border: `1px solid ${h ? DS.gold : DS.border}`,
        boxShadow: h ? "0 8px 24px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: h ? "translateY(-3px)" : "none", transition: "all 0.2s",
      }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: DS.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{icon}</div>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: DS.ink, marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "12px", color: DS.ink2, lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
