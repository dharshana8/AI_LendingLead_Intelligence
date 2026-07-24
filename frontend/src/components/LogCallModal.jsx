import React, { useState } from "react";
import { T } from "../tokens";
import { apiUpdateCustomer } from "../services/api";
import { useApp } from "../context/AppContext";

const OUTCOMES = [
  { value: "connected",   label: "✅ Connected",       desc: "Spoke with customer" },
  { value: "no_answer",   label: "📵 No Answer",       desc: "Phone rang, no pickup" },
  { value: "callback",    label: "🔁 Callback Requested", desc: "Customer asked to call back" },
  { value: "wrong_number",label: "❌ Wrong Number",    desc: "Incorrect contact details" },
];

/**
 * LogCallModal — records a real call outcome against a lead.
 * Props:
 *   lead     — the lead object (must have .id and .name)
 *   onClose  — close handler
 *   onSaved  — called after successful save (triggers refetch)
 */
export default function LogCallModal({ lead, onClose, onSaved }) {
  const { addToast } = useApp();
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!outcome) { addToast("Select a call outcome", "error"); return; }
    setSaving(true);
    try {
      const nextStatus = outcome === "connected" ? "Contacted" : undefined;
      await apiUpdateCustomer(lead.id, {
        ...(nextStatus ? { status: nextStatus } : {}),
        last_contact: new Date().toISOString().split("T")[0],
        call_outcome: outcome,
        call_notes: notes.trim() || undefined,
      });
      addToast(`Call logged for ${lead.name} — ${OUTCOMES.find(o => o.value === outcome)?.label}`, "success");
      onSaved?.();
      onClose();
    } catch {
      addToast("Failed to log call", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: T.card, borderRadius: "8px", width: "100%", maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)", border: `1px solid ${T.line}`,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{ background: T.bg, padding: "16px 20px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: T.ink }}>📞 Log Call</div>
            <div style={{ fontSize: "11px", color: T.sub, marginTop: "2px" }}>{lead.name} · {lead.occupation}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,0.08)", border: "none", color: T.ink, width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Outcome selection */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: "600", color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Call Outcome</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {OUTCOMES.map(o => (
                <button key={o.value} onClick={() => setOutcome(o.value)}
                  style={{
                    padding: "10px 14px", borderRadius: "6px", border: `1.5px solid`,
                    borderColor: outcome === o.value ? T.gold : T.line,
                    background: outcome === o.value ? T.goldSoft : T.page,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                    transition: "all 0.15s", textAlign: "left",
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: T.ink }}>{o.label}</div>
                    <div style={{ fontSize: "11px", color: T.sub, marginTop: "1px" }}>{o.desc}</div>
                  </div>
                  {outcome === o.value && (
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: T.bg, fontWeight: "800", flexShrink: 0 }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: "600", color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Notes (optional)</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Customer interested in Home Loan, follow up next week..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", border: `1.5px solid ${T.line}`,
                borderRadius: "6px", fontSize: "13px", outline: "none", resize: "none",
                background: T.page, color: T.ink, fontFamily: "'IBM Plex Sans', sans-serif",
                lineHeight: 1.5, boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.line}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: "10px", border: `1px solid ${T.line}`, borderRadius: "6px", background: "transparent", color: T.sub, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !outcome}
              style={{
                flex: 2, padding: "10px", border: "none", borderRadius: "6px",
                background: outcome && !saving ? T.gold : T.line,
                color: outcome && !saving ? T.bg : T.sub,
                fontSize: "13px", fontWeight: "700", cursor: outcome && !saving ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}>
              {saving ? "Saving..." : "Save Call Log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
