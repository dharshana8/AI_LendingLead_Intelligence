import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import api from "../services/api";

const DS = {
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const QUICK_PROMPTS = {
  rm: [
    "Who should I call today?",
    "Top 3 high-priority leads?",
    "Generate a Home Loan pitch script",
    "Which customers have low EMI burden?",
    "Draft an outreach message for my best lead",
    "What is my conversion rate this month?",
  ],
  bm: [
    "Which RM is performing best this month?",
    "Show me all escalated high-priority leads",
    "Which leads have been pending approval longest?",
    "Compare branch conversion vs target",
    "Which customers need immediate reassignment?",
    "Summarise branch portfolio health",
  ],
  admin: [
    "Overall portfolio health summary",
    "Which branch has the highest AI score average?",
    "Show model accuracy and performance metrics",
    "How many leads were imported this week?",
    "List all users and their activity",
    "What is the total potential business value?",
  ],
};

const WELCOME_MESSAGE = {
  rm: "👋 Hello! I'm your **AI Lead Assistant** powered by Groq LLaMA 3.3-70B.\n\nAs your Relationship Manager assistant, I can help you:\n• Identify top leads to call today\n• Generate personalised outreach scripts\n• Explain AI scores and SHAP signals\n• Track your conversion pipeline\n\nWhat would you like to work on?",
  bm: "👋 Hello! I'm your **Branch Intelligence Assistant** powered by Groq LLaMA 3.3-70B.\n\nAs your Branch Manager assistant, I can help you:\n• Monitor team performance and RM leaderboard\n• Identify escalations and pending approvals\n• Compare branch conversion rates\n• Reassign and prioritise high-value leads\n\nWhat would you like to review?",
  admin: "👋 Hello! I'm your **Admin Analytics Assistant** powered by Groq LLaMA 3.3-70B.\n\nAs your Admin assistant, I can help you:\n• Monitor system-wide portfolio health\n• Review AI model performance metrics\n• Audit user activity and branch performance\n• Analyse potential business value across all branches\n\nWhat would you like to analyse?",
};

function renderMessage(text) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} style={{ margin: "3px 0", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
  });
}

export default function AIAssistantPage() {
  const { darkMode, user } = useApp();
  const role = user?.role || "rm";
  const prompts = QUICK_PROMPTS[role] || QUICK_PROMPTS.rm;
  const welcomeText = WELCOME_MESSAGE[role] || WELCOME_MESSAGE.rm;

  const [messages, setMessages] = useState([
    { role: "ai", text: welcomeText }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const bg      = darkMode ? DS.navy  : DS.bg;
  const cardBg  = darkMode ? DS.navy2 : DS.card;
  const border  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const textPrimary   = darkMode ? DS.textDark  : DS.ink;
  const textSecondary = darkMode ? DS.textMuted : DS.ink2;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setTyping(true);

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
    <div style={{ background: bg, minHeight: "100%", display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Header — navy dark panel */}
      <div style={{ background: DS.navy, padding: "16px 24px", display: "flex", alignItems: "center", gap: "14px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: DS.navy2, border: `1px solid rgba(199,154,61,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: DS.textDark, fontFamily: "'IBM Plex Sans', sans-serif" }}>AI Assistant — Groq LLaMA 3.3-70B</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: DS.teal, animation: "blink 1.5s infinite" }} />
            <span style={{ fontSize: "11px", color: DS.teal, fontWeight: "600", fontFamily: "'IBM Plex Mono', monospace" }}>Online · Live Portfolio Data</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <span style={{ background: "rgba(199,154,61,0.15)", color: DS.gold, fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "3px", border: `1px solid rgba(199,154,61,0.3)`, fontFamily: "'IBM Plex Mono', monospace" }}>LIVE DATA</span>
          <span style={{ background: "rgba(47,110,99,0.15)", color: DS.teal, fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "3px", border: `1px solid rgba(47,110,99,0.3)`, fontFamily: "'IBM Plex Mono', monospace" }}>GROQ API</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${border}`, background: cardBg }}>
        <div style={{ fontSize: "10px", color: textSecondary, fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Prompts</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {prompts.map(p => (
            <QuickPromptBtn key={p} text={p} onClick={() => sendMessage(p)} disabled={typing} darkMode={darkMode} border={border} textSecondary={textSecondary} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", background: bg }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} darkMode={darkMode} cardBg={cardBg} textPrimary={textPrimary} textSecondary={textSecondary} border={border} />
        ))}
        {typing && <TypingIndicator cardBg={cardBg} border={border} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}`, background: cardBg }}>
        {error && (
          <div style={{ background: DS.rustSoft, border: `1px solid ${DS.rust}`, borderRadius: "6px", padding: "10px 14px", marginBottom: "10px", fontSize: "12px", color: DS.rust, fontWeight: "500" }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about leads, scores, outreach strategies… (Enter to send)"
              rows={2}
              style={{
                width: "100%", padding: "11px 14px",
                border: `1.5px solid ${border}`, borderRadius: "6px",
                fontSize: "13px", outline: "none", resize: "none",
                background: darkMode ? DS.navy : DS.bg,
                color: textPrimary, fontFamily: "'IBM Plex Sans', sans-serif",
                lineHeight: 1.5, boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = DS.gold}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            style={{
              padding: "11px 20px", borderRadius: "6px", border: "none",
              background: input.trim() && !typing ? DS.gold : DS.border,
              color: input.trim() && !typing ? DS.navy : DS.ink2,
              fontSize: "13px", fontWeight: "700", cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              transition: "all 0.15s", whiteSpace: "nowrap",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>Send ↑</button>
        </div>
        <div style={{ fontSize: "10px", color: textSecondary, marginTop: "6px", fontFamily: "'IBM Plex Mono', monospace" }}>
          Enter to send · Shift+Enter for new line · Responses use your live customer data
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, darkMode, cardBg, textPrimary, textSecondary, border }) {
  const isAI = msg.role === "ai";
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: isAI ? "row" : "row-reverse" }}>
      {/* Avatar */}
      <div style={{
        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
        background: isAI ? DS.navy2 : DS.gold,
        border: isAI ? `1px solid rgba(199,154,61,0.3)` : "none",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
      }}>{isAI ? "🤖" : "👤"}</div>

      {/* Bubble */}
      <div style={{
        maxWidth: "75%",
        background: isAI ? cardBg : DS.navy,
        borderRadius: isAI ? "4px 8px 8px 8px" : "8px 4px 8px 8px",
        padding: "12px 16px",
        border: isAI ? `1px solid ${border}` : "none",
        borderLeft: isAI ? `3px solid ${DS.gold}` : undefined,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        {isAI && (
          <div style={{ fontSize: "10px", fontWeight: "700", color: DS.gold, marginBottom: "6px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em" }}>
            AI ASSISTANT
          </div>
        )}
        <div style={{ fontSize: "13px", color: isAI ? textPrimary : DS.textDark, lineHeight: 1.65 }}>
          {renderMessage(msg.text)}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ cardBg, border }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: DS.navy2, border: `1px solid rgba(199,154,61,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
      <div style={{ background: cardBg, borderRadius: "4px 8px 8px 8px", padding: "14px 18px", border: `1px solid ${border}`, borderLeft: `3px solid ${DS.gold}` }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: DS.gold, animation: `blink 1s ${delay}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickPromptBtn({ text, onClick, disabled, darkMode, border, textSecondary }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 12px", borderRadius: "3px",
        border: `1px solid ${h && !disabled ? DS.gold : border}`,
        background: h && !disabled ? DS.goldSoft : "transparent",
        color: h && !disabled ? DS.ink : textSecondary,
        fontSize: "11px", cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", fontWeight: "500",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>{text}</button>
  );
}
