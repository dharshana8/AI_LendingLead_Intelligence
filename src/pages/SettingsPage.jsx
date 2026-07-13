import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function SettingsPage() {
  const { darkMode, setDarkMode, addToast } = useApp();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifSettings, setNotifSettings] = useState({ email: true, sms: false, push: true, leadAlert: true, approvals: true, reminders: true });
  const [lang, setLang] = useState("en");
  const [fontSize, setFontSize] = useState("medium");

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const TABS = [
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "password", icon: "🔑", label: "Password" },
    { id: "theme", icon: "🎨", label: "Theme" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "language", icon: "🌐", label: "Language" },
    { id: "accessibility", icon: "♿", label: "Accessibility" },
  ];

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>Manage your account preferences</p>
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Sidebar Tabs */}
        <div style={{ width: "200px", background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "8px", flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", border: "none",
                background: activeTab === tab.id ? "#eff6ff" : "transparent",
                color: activeTab === tab.id ? "#1e40af" : textSecondary,
                fontSize: "13px", fontWeight: activeTab === tab.id ? "600" : "500",
                cursor: "pointer", marginBottom: "2px", transition: "all 0.15s",
                borderLeft: activeTab === tab.id ? "3px solid #1e40af" : "3px solid transparent",
              }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, padding: "20px" }}>
          {activeTab === "profile" && <ProfileSettings darkMode={darkMode} border={border} textPrimary={textPrimary} textSecondary={textSecondary} addToast={addToast} />}
          {activeTab === "password" && <PasswordSettings darkMode={darkMode} border={border} textPrimary={textPrimary} textSecondary={textSecondary} addToast={addToast} />}
          {activeTab === "theme" && <ThemeSettings darkMode={darkMode} setDarkMode={setDarkMode} textPrimary={textPrimary} textSecondary={textSecondary} addToast={addToast} />}
          {activeTab === "notifications" && <NotifSettings settings={notifSettings} setSettings={setNotifSettings} textPrimary={textPrimary} textSecondary={textSecondary} border={border} addToast={addToast} />}
          {activeTab === "language" && <LangSettings lang={lang} setLang={setLang} fontSize={fontSize} setFontSize={setFontSize} textPrimary={textPrimary} textSecondary={textSecondary} border={border} addToast={addToast} />}
          {activeTab === "accessibility" && <AccessSettings textPrimary={textPrimary} textSecondary={textSecondary} border={border} addToast={addToast} />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, desc, textPrimary, textSecondary }) {
  return (
    <div style={{ marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: textPrimary }}>{title}</div>
      {desc && <div style={{ fontSize: "12px", color: textSecondary, marginTop: "3px" }}>{desc}</div>}
    </div>
  );
}

function FieldRow({ label, desc, children, textPrimary, textSecondary }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "500", color: textPrimary }}>{label}</div>
        {desc && <div style={{ fontSize: "11px", color: textSecondary, marginTop: "2px" }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: "42px", height: "24px", borderRadius: "12px", background: checked ? "#1e40af" : "#d1d5db",
      position: "relative", cursor: "pointer", transition: "background 0.2s",
    }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px", left: checked ? "21px" : "3px",
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function SaveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ marginTop: "20px", padding: "10px 24px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
      Save Changes
    </button>
  );
}

function ProfileSettings({ darkMode, border, textPrimary, textSecondary, addToast }) {
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary };
  return (
    <div>
      <SectionTitle title="Profile Settings" desc="Update your personal information" textPrimary={textPrimary} textSecondary={textSecondary} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {[["Full Name", "Ankit Sharma"], ["Employee ID", "RM001", true], ["Email", "ankit.sharma@idbi.co.in"], ["Phone", "+91 98765 43210"], ["Branch", "Mumbai Main", true], ["Department", "Retail Lending"]].map(([label, val, disabled]) => (
          <div key={label}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>{label}</label>
            <input defaultValue={val} disabled={disabled} style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }} />
          </div>
        ))}
      </div>
      <SaveBtn onClick={() => addToast("Profile settings saved", "success")} />
    </div>
  );
}

function PasswordSettings({ darkMode, border, textPrimary, textSecondary, addToast }) {
  const [vals, setVals] = useState({ current: "", newPass: "", confirm: "" });
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary };
  const handleSave = () => {
    if (!vals.current) { addToast("Enter current password", "error"); return; }
    if (vals.newPass.length < 8) { addToast("Password must be at least 8 characters", "error"); return; }
    if (vals.newPass !== vals.confirm) { addToast("Passwords do not match", "error"); return; }
    addToast("Password changed successfully", "success");
    setVals({ current: "", newPass: "", confirm: "" });
  };
  return (
    <div>
      <SectionTitle title="Change Password" desc="Use a strong password with letters, numbers, and symbols" textPrimary={textPrimary} textSecondary={textSecondary} />
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "400px" }}>
        {[["Current Password", "current"], ["New Password", "newPass"], ["Confirm New Password", "confirm"]].map(([label, key]) => (
          <div key={key}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>{label}</label>
            <input type="password" value={vals[key]} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))} style={inputStyle} />
          </div>
        ))}
      </div>
      <SaveBtn onClick={handleSave} />
    </div>
  );
}

function ThemeSettings({ darkMode, setDarkMode, textPrimary, textSecondary, addToast }) {
  return (
    <div>
      <SectionTitle title="Theme & Appearance" desc="Customize the look of your dashboard" textPrimary={textPrimary} textSecondary={textSecondary} />
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
        {[{ label: "Light Mode", icon: "☀️", value: false }, { label: "Dark Mode", icon: "🌙", value: true }].map(({ label, icon, value }) => (
          <div key={label} onClick={() => { setDarkMode(value); addToast(`${label} enabled`, "success"); }}
            style={{
              flex: 1, padding: "20px", borderRadius: "12px", cursor: "pointer",
              border: `2px solid ${darkMode === value ? "#1e40af" : "#e5e7eb"}`,
              background: darkMode === value ? "#eff6ff" : "#f9fafb",
              textAlign: "center", transition: "all 0.2s",
            }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: darkMode === value ? "#1e40af" : textPrimary }}>{label}</div>
            {darkMode === value && <div style={{ fontSize: "11px", color: "#1e40af", marginTop: "4px" }}>✓ Active</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotifSettings({ settings, setSettings, textPrimary, textSecondary, border, addToast }) {
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const items = [
    { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
    { key: "sms", label: "SMS Alerts", desc: "Get SMS for high-priority leads" },
    { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
    { key: "leadAlert", label: "New Lead Alerts", desc: "Notify when new leads are assigned" },
    { key: "approvals", label: "Loan Approvals", desc: "Notify on loan status changes" },
    { key: "reminders", label: "Follow-up Reminders", desc: "Daily follow-up reminders" },
  ];
  return (
    <div>
      <SectionTitle title="Notification Preferences" desc="Control how you receive alerts" textPrimary={textPrimary} textSecondary={textSecondary} />
      {items.map(({ key, label, desc }) => (
        <FieldRow key={key} label={label} desc={desc} textPrimary={textPrimary} textSecondary={textSecondary}>
          <Toggle checked={settings[key]} onChange={() => toggle(key)} />
        </FieldRow>
      ))}
      <SaveBtn onClick={() => addToast("Notification preferences saved", "success")} />
    </div>
  );
}

function LangSettings({ lang, setLang, fontSize, setFontSize, textPrimary, textSecondary, border, addToast }) {
  const selectStyle = { padding: "8px 12px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" };
  return (
    <div>
      <SectionTitle title="Language & Region" desc="Set your preferred language and display settings" textPrimary={textPrimary} textSecondary={textSecondary} />
      <FieldRow label="Language" desc="Dashboard display language" textPrimary={textPrimary} textSecondary={textSecondary}>
        <select value={lang} onChange={e => setLang(e.target.value)} style={selectStyle}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
        </select>
      </FieldRow>
      <FieldRow label="Font Size" desc="Adjust text size for readability" textPrimary={textPrimary} textSecondary={textSecondary}>
        <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={selectStyle}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </FieldRow>
      <FieldRow label="Date Format" textPrimary={textPrimary} textSecondary={textSecondary}>
        <select style={selectStyle}><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select>
      </FieldRow>
      <SaveBtn onClick={() => addToast("Language settings saved", "success")} />
    </div>
  );
}

function AccessSettings({ textPrimary, textSecondary, border, addToast }) {
  const [settings, setSettings] = useState({ highContrast: false, reduceMotion: false, largeText: false, screenReader: false });
  return (
    <div>
      <SectionTitle title="Accessibility" desc="Make the dashboard work better for you" textPrimary={textPrimary} textSecondary={textSecondary} />
      {[
        { key: "highContrast", label: "High Contrast Mode", desc: "Increase color contrast for better visibility" },
        { key: "reduceMotion", label: "Reduce Motion", desc: "Minimize animations and transitions" },
        { key: "largeText", label: "Large Text", desc: "Increase font size across the dashboard" },
        { key: "screenReader", label: "Screen Reader Optimized", desc: "Enhanced ARIA labels and keyboard navigation" },
      ].map(({ key, label, desc }) => (
        <FieldRow key={key} label={label} desc={desc} textPrimary={textPrimary} textSecondary={textSecondary}>
          <Toggle checked={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
        </FieldRow>
      ))}
      <SaveBtn onClick={() => addToast("Accessibility settings saved", "success")} />
    </div>
  );
}
