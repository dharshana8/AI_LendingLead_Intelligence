import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import api from "../services/api";

const QUICK_PROMPTS = [
  "Which customers should I call today?",
  "Who are the top 3 high-priority leads?",
  "Generate a Home Loan pitch script",
  "Which customers have low EMI burden?",
  "Compare AI vs CIBIL screening results",
  "What is the total potential revenue?",
];

function renderMessage(text) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
  });
}

export default function AIAssistantPage() {
  const { darkMode } = useApp();
  const [messages, setMessages] = useState([
    { role: "ai", text: "👋 Hello! I'm your **IDBI AI Lead Assistant** powered by Groq.\n\nI have live access to your customer portfolio and can help you:\n• Identify top leads to call today\n• Explain AI scores and signals\n• Generate outreach scripts\n• Analyze your portfolio performance\n\nWhat would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", text: msg };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Build history for backend (exclude the initial greeting)
    const history = messages
      .slice(1)
      .map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));

    try {
      const res = await api.post("/chat", { message: msg, history });
      setMessages(prev => [...prev, { role: "ai", text: res.data.reply }]);
    } catch (e) {
      const errMsg = e?.response?.data?.detail || "Failed to connect to AI. Check that GROQ_API_KEY is set in backend/.env";
      setError(errMsg);
      setMessages(prev => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
    } finally {
      setTyping(false);
    }
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
            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>Online · Powered by Groq LLaMA 3</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <span style={{ background: "#eff6ff", color: "#1e40af", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>Live Data</span>
          <span style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px" }}>Groq API</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${border}`, background: cardBg }}>
        <div style={{ fontSize: "11px", color: textSecondary, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Prompts</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(p => (
            <QuickPromptBtn key={p} text={p} onClick={() => sendMessage(p)} disabled={typing} darkMode={darkMode} border={border} textSecondary={textSecondary} />
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
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "12px", color: "#b91c1c" }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
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
          Enter to send · Shift+Enter for new line · Responses use your live customer data
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

function QuickPromptBtn({ text, onClick, disabled, darkMode, border, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: "6px 12px", borderRadius: "20px", border: `1px solid ${h && !disabled ? "#1e40af" : border}`,
        background: h && !disabled ? "#eff6ff" : "transparent", color: h && !disabled ? "#1e40af" : textSecondary,
        fontSize: "12px", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", fontWeight: "500",
        opacity: disabled ? 0.5 : 1,
      }}>{text}</button>
  );
}
