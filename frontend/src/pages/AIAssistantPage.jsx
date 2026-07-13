import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { leads } from "../data/mockData";

const QUICK_PROMPTS = [
  "Which customers should I call today?",
  "Explain Rajesh Kumar's AI score",
  "Who are the top 3 high-priority leads?",
  "Generate a loan pitch for Home Loan",
  "Which customers have low EMI burden?",
  "Compare AI vs CIBIL screening results",
];

const AI_RESPONSES = {
  "which customers should i call today": `Based on today's AI analysis, here are your **top 5 priority calls**:\n\n1. 🔥 **Rajesh Kumar** (AI Score: 92) — Software Engineer, Home Loan ₹48L. Highest conversion probability at 91%. Call before 12 PM.\n\n2. 🔥 **Meera Nair** (AI Score: 91) — CA, Home Loan ₹58L. Excellent credit health. Follow-up pending since 3 days.\n\n3. 🔥 **Vikram Singh** (AI Score: 89) — Army Officer, Home Loan ₹38L. Special defence rates applicable. High intent signal.\n\n4. 🔥 **Arjun Mehta** (AI Score: 87) — IT Consultant, Home Loan ₹80L. High income, strong repayment capacity.\n\n5. 🔥 **Priya Sharma** (AI Score: 88) — Doctor, Home Loan ₹72L. Outstanding credit profile.\n\n💡 **AI Tip:** Morning calls (9–11 AM) show 34% higher connect rates for salaried professionals.`,
  "explain rajesh kumar": `**Rajesh Kumar — AI Score Breakdown (92/100)**\n\n📊 **Signal Analysis:**\n• Salary Stability: 95% — Consistent 3-year employment at TCS\n• Repayment Capacity: 88% — EMI-to-income ratio only 28%\n• Savings Ratio: 82% — Monthly savings ₹24,000\n• Loan Intent: 90% — Visited IDBI Home Loan page 6 times\n• Credit Health: 85% — Zero missed payments in 24 months\n• CIBIL Contribution: 78% — Score 780, above threshold\n\n🎯 **Why High Priority:**\nRajesh's combination of salary stability and low EMI burden places him in the top 5% of leads. His repeated loan page visits indicate strong purchase intent.\n\n💰 **Recommended Action:**\nOffer Home Loan up to ₹48,00,000 at 8.5% p.a. with pre-approved status. Expected conversion: **91%**`,
  "top 3 high-priority": `**Top 3 High-Priority Leads Today:**\n\n🥇 **Rajesh Kumar** — Score 92 | Conversion 91% | Home Loan ₹48L\n*Signal: Salary Stability + Low EMI Burden*\n\n🥈 **Meera Nair** — Score 91 | Conversion 89% | Home Loan ₹58L\n*Signal: Credit Health + Repayment Capacity*\n\n🥉 **Ravi Shankar** — Score 90 | Conversion 88% | Mortgage ₹60L\n*Signal: Credit Health + Savings Rate*\n\n📈 Combined potential business value: **₹1.66 Crores**\n\n💡 Initiating outreach to all three today could yield ₹1.2Cr in confirmed applications by end of week.`,
  "generate a loan pitch": `**AI-Generated Home Loan Pitch Script:**\n\n---\n*"Good morning [Customer Name], this is [Your Name] calling from IDBI Bank.*\n\n*I'm reaching out because our AI system has identified you as a pre-qualified candidate for our exclusive Home Loan offer.*\n\n*Based on your strong financial profile, you're eligible for:*\n*✅ Loan amount up to ₹48,00,000*\n*✅ Interest rate starting at 8.40% p.a.*\n*✅ Tenure up to 30 years*\n*✅ Zero processing fee this month*\n*✅ Doorstep documentation service*\n\n*This offer is valid for the next 7 days. Would you like me to schedule a quick 15-minute consultation?"*\n\n---\n💡 **Pro Tip:** Mention the zero processing fee first — it increases callback rate by 42%.`,
  "low emi burden": `**Customers with Low EMI Burden (< 30% of income):**\n\n| Customer | Income | Current EMI | EMI Ratio | Eligible For |\n|---|---|---|---|---|\n| Rajesh Kumar | ₹1.2L | ₹18,000 | 15% | Home Loan ₹48L |\n| Vikram Singh | ₹95,000 | ₹12,000 | 13% | Home Loan ₹38L |\n| Meera Nair | ₹1.45L | ₹22,000 | 15% | Home Loan ₹58L |\n| Ananya Bose | ₹1.3L | ₹28,000 | 22% | Home Loan ₹52L |\n| Arjun Mehta | ₹2.0L | ₹35,000 | 18% | Home Loan ₹80L |\n\n✅ These 5 customers have the highest loan absorption capacity. Prioritize for large-ticket loans.`,
  "compare ai vs cibil": `**AI Screening vs Traditional CIBIL — Comparison Report:**\n\n📊 **Results from 20 Customers:**\n\n| Metric | CIBIL Only | AI Screening |\n|---|---|---|\n| Qualified Leads | 6 | 9 |\n| Missed High-Intent | 3 | 0 |\n| Avg Conversion Rate | 15% | 34% |\n| Processing Time | 4 hours | 8 seconds |\n| False Positives | 2 | 0 |\n\n🔍 **3 Customers Missed by CIBIL but Caught by AI:**\n1. **Suresh Yadav** — Low CIBIL (610) but high loan intent + stable agricultural income\n2. **Kavitha Reddy** — CIBIL 640 but consistent salary + savings pattern\n3. **Lakshmi Devi** — CIBIL 590 but strong household income signals\n\n💡 **Conclusion:** AI screening identifies **50% more qualified leads** and reduces processing time by **99.9%**.`,
};

function getAIResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes("call today") || lower.includes("should i call")) return AI_RESPONSES["which customers should i call today"];
  if (lower.includes("rajesh")) return AI_RESPONSES["explain rajesh kumar"];
  if (lower.includes("top 3") || lower.includes("high-priority") || lower.includes("high priority")) return AI_RESPONSES["top 3 high-priority"];
  if (lower.includes("pitch") || lower.includes("script")) return AI_RESPONSES["generate a loan pitch"];
  if (lower.includes("emi burden") || lower.includes("low emi")) return AI_RESPONSES["low emi burden"];
  if (lower.includes("compare") || lower.includes("cibil") || lower.includes("vs")) return AI_RESPONSES["compare ai vs cibil"];
  const high = leads.filter(l => l.priority === "High");
  return `I found **${high.length} high-priority leads** matching your query.\n\nTop recommendation: **${high[0]?.name}** with AI Score ${high[0]?.aiScore} and ${high[0]?.conversion}% conversion probability.\n\n💡 Try asking me:\n• "Which customers should I call today?"\n• "Explain Rajesh Kumar's score"\n• "Generate a loan pitch"\n• "Compare AI vs CIBIL results"`;
}

function renderMessage(text) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
  });
}

export default function AIAssistantPage() {
  const { darkMode } = useApp();
  const [messages, setMessages] = useState([
    { role: "ai", text: "👋 Hello! I'm your **IDBI AI Lead Assistant**.\n\nI can help you:\n• Identify top leads to call today\n• Explain AI scores and signals\n• Generate outreach scripts\n• Compare AI vs CIBIL results\n\nWhat would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    setTyping(false);
    setMessages(prev => [...prev, { role: "ai", text: getAIResponse(msg) }]);
  };

  return (
    <div style={{ background: bg, minHeight: "100%", display: "flex", flexDirection: "column", height: "calc(100vh - 70px)" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${border}`, background: cardBg, display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🤖</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: textPrimary }}>IDBI AI Lead Assistant</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "blink 1.5s infinite" }} />
            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>Online · Powered by AI/ML</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <span style={{ background: "#eff6ff", color: "#1e40af", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>GPT-Ready</span>
          <span style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>Groq API</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${border}`, background: cardBg }}>
        <div style={{ fontSize: "11px", color: textSecondary, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Prompts</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(p => (
            <QuickPromptBtn key={p} text={p} onClick={() => sendMessage(p)} darkMode={darkMode} border={border} textSecondary={textSecondary} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} darkMode={darkMode} cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} />
        ))}
        {typing && <TypingIndicator darkMode={darkMode} cardBg={cardBg} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}`, background: cardBg }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about leads, scores, outreach strategies... (Enter to send)"
              rows={2}
              style={{
                width: "100%", padding: "12px 14px", border: `1.5px solid ${border}`,
                borderRadius: "10px", fontSize: "13px", outline: "none", resize: "none",
                background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary,
                fontFamily: "inherit", lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = "#1e40af"}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>
          <button onClick={() => sendMessage()} disabled={!input.trim() || typing}
            style={{
              padding: "12px 20px", background: input.trim() && !typing ? "linear-gradient(135deg,#1e40af,#2563eb)" : "#e5e7eb",
              color: input.trim() && !typing ? "#fff" : "#9ca3af",
              border: "none", borderRadius: "10px", fontSize: "14px", cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              fontWeight: "700", transition: "all 0.2s", whiteSpace: "nowrap",
            }}>Send ↑</button>
        </div>
        <div style={{ fontSize: "11px", color: textSecondary, marginTop: "6px" }}>
          Press Enter to send · Shift+Enter for new line · Backend will connect to Groq API
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, darkMode, cardBg, textPrimary, textSecondary }) {
  const isAI = msg.role === "ai";
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: isAI ? "row" : "row-reverse" }}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
        background: isAI ? "linear-gradient(135deg,#1e40af,#7c3aed)" : "linear-gradient(135deg,#f59e0b,#ef4444)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
      }}>{isAI ? "🤖" : "👤"}</div>
      <div style={{
        maxWidth: "75%", background: isAI ? cardBg : "#1e40af",
        borderRadius: isAI ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
        padding: "12px 16px", border: isAI ? `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` : "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        {isAI && <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", marginBottom: "6px" }}>IDBI AI Assistant</div>}
        <div style={{ fontSize: "13px", color: isAI ? textPrimary : "#fff", lineHeight: 1.6 }}>
          {renderMessage(msg.text)}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ darkMode, cardBg }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
      <div style={{ background: cardBg, borderRadius: "4px 12px 12px 12px", padding: "14px 18px", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1e40af", animation: `blink 1s ${delay}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickPromptBtn({ text, onClick, darkMode, border, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "6px 12px", borderRadius: "20px", border: `1px solid ${h ? "#1e40af" : border}`,
        background: h ? "#eff6ff" : "transparent", color: h ? "#1e40af" : textSecondary,
        fontSize: "12px", cursor: "pointer", transition: "all 0.15s", fontWeight: "500",
      }}>{text}</button>
  );
}
