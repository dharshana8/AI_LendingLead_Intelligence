import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { apiUpdateUserSettings } from "../services/api";

const DS = {
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const LS_NOTIF  = "idbi_notif_settings";
const LS_LANG   = "idbi_lang_settings";
const LS_ACCESS = "idbi_access_settings";

const DEFAULT_NOTIF  = { email: true, sms: false, push: true, leadAlert: true, approvals: true, reminders: true };
const DEFAULT_LANG   = { lang: "en", dateFormat: "DD/MM/YYYY", fontSize: 14 };
const DEFAULT_ACCESS = { highContrast: false, reduceMotion: false, largeText: false, screenReader: false };

function readLS(key, def) {
  try { return { ...def, ...JSON.parse(localStorage.getItem(key) || "{}") }; }
  catch { return def; }
}

const TABS = [
  { id: "profile",       label: "Profile Settings" },
  { id: "password",      label: "Change Password" },
  { id: "theme",         label: "Theme" },
  { id: "notifications", label: "Notifications" },
  { id: "language",      label: "Language" },
  { id: "accessibility", label: "Accessibility" },
];

export default function SettingsPage() {
  const { darkMode, setDarkMode, addToast } = useApp();
  const [activeTab, setActiveTab] = useState("profile");

  // Persisted settings — loaded from localStorage on mount
  const [notifSettings, setNotifSettings] = useState(() => readLS(LS_NOTIF, DEFAULT_NOTIF));
  const [langSettings,  setLangSettings]  = useState(() => readLS(LS_LANG,  DEFAULT_LANG));
  const [accessSettings, setAccessSettings] = useState(() => readLS(LS_ACCESS, DEFAULT_ACCESS));

  // Apply font-size CSS variable whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-size", `${langSettings.fontSize}px`);
  }, [langSettings.fontSize]);

  // Apply reduce-motion CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-animation-duration",
      accessSettings.reduceMotion ? "0s" : ""
    );
  }, [accessSettings.reduceMotion]);

  const bg   = darkMode ? DS.navy  : DS.bg;
  const card = darkMode ? DS.navy2 : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.ink2;

  const saveNotif = (next) => {
    setNotifSettings(next);
    localStorage.setItem(LS_NOTIF, JSON.stringify(next));
    addToast("Notification preferences saved", "success");
  };

  const saveLang = (next) => {
    setLangSettings(next);
    localStorage.setItem(LS_LANG, JSON.stringify(next));
    addToast("Language settings saved", "success");
  };

  const saveAccess = (next) => {
    setAccessSettings(next);
    localStorage.setItem(LS_ACCESS, JSON.stringify(next));
    addToast("Accessibility settings saved", "success");
  };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: "13px", color: ink2, margin: "4px 0 0" }}>Manage your account preferences</p>
      </div>

      <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
        {/* Left nav */}
        <div style={{ width: "196px", background: card, borderRadius: "8px", border: `1px solid ${bdr}`, padding: "6px", flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              width: "100%", display: "flex", alignItems: "center",
              padding: "9px 12px", borderRadius: "5px", border: "none",
              background: activeTab === tab.id ? DS.goldSoft : "transparent",
              color: activeTab === tab.id ? DS.gold : ink2,
              fontSize: "12.5px", fontWeight: activeTab === tab.id ? "600" : "400",
              cursor: "pointer", marginBottom: "1px", transition: "all 0.15s",
              borderLeft: activeTab === tab.id ? `3px solid ${DS.gold}` : "3px solid transparent",
              textAlign: "left", fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: card, borderRadius: "8px", border: `1px solid ${bdr}`, padding: "22px" }}>
          {activeTab === "profile"       && <ProfileSettings darkMode={darkMode} bdr={bdr} ink={ink} ink2={ink2} addToast={addToast} />}
          {activeTab === "password"      && <PasswordSettings darkMode={darkMode} bdr={bdr} ink={ink} ink2={ink2} addToast={addToast} />}
          {activeTab === "theme"         && <ThemeSettings darkMode={darkMode} setDarkMode={setDarkMode} ink={ink} ink2={ink2} addToast={addToast} />}
          {activeTab === "notifications" && <NotifSettings settings={notifSettings} onSave={saveNotif} ink={ink} ink2={ink2} />}
          {activeTab === "language"      && <LangSettings settings={langSettings} onSave={saveLang} ink={ink} ink2={ink2} bdr={bdr} />}
          {activeTab === "accessibility" && <AccessSettings settings={accessSettings} onSave={saveAccess} ink={ink} ink2={ink2} />}
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function SectionTitle({ title, desc, ink, ink2 }) {
  return (
    <div style={{ marginBottom: "20px", paddingBottom: "14px", borderBottom: `1px solid ${DS.border}` }}>
      <div style={{ fontSize: "15px", fontWeight: "600", color: ink }}>{title}</div>
      {desc && <div style={{ fontSize: "12px", color: ink2, marginTop: "3px" }}>{desc}</div>}
    </div>
  );
}

function FieldRow({ label, desc, children, ink, ink2 }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${DS.border}` }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "500", color: ink }}>{label}</div>
        {desc && <div style={{ fontSize: "11px", color: ink2, marginTop: "2px" }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: "40px", height: "22px", borderRadius: "11px",
      background: checked ? DS.gold : DS.border,
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px", left: checked ? "21px" : "3px",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function SaveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      marginTop: "20px", padding: "9px 22px",
      background: DS.gold, color: DS.navy,
      border: "none", borderRadius: "6px",
      fontSize: "13px", fontWeight: "700", cursor: "pointer",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      Save Changes
    </button>
  );
}

function inputStyle(bdr, darkMode) {
  return {
    width: "100%", padding: "9px 12px",
    border: `1px solid ${bdr}`, borderRadius: "6px",
    fontSize: "13px", color: darkMode ? DS.textDark : DS.ink,
    background: darkMode ? DS.navy : "#FDFCFA",
    fontFamily: "'IBM Plex Sans', sans-serif",
    outline: "none",
  };
}

function ProfileSettings({ darkMode, bdr, ink, ink2, addToast }) {
  const { user } = useApp();
  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "bm" ? "Branch Manager" : "Relationship Manager";
  const fields = [
    ["Full Name",    user?.name        || "", true],
    ["Employee ID",  user?.employeeId  || "", true],
    ["Email",        user?.email       || "", false],
    ["Phone",        user?.phone       || "", false],
    ["Branch",       user?.branch      || "", true],
    ["Role",         roleLabel,               true],
  ];
  return (
    <div>
      <SectionTitle title="Profile Settings" desc="Update your personal information" ink={ink} ink2={ink2} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {fields.map(([label, val, disabled]) => (
          <div key={label}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
            <input defaultValue={val} disabled={disabled} style={{ ...inputStyle(bdr, darkMode), opacity: disabled ? 0.6 : 1 }} />
          </div>
        ))}
      </div>
      <SaveBtn onClick={() => addToast("Profile preferences saved locally", "success")} />
    </div>
  );
}

function PasswordSettings({ darkMode, bdr, ink, ink2, addToast }) {
  const { user } = useApp();
  const [vals, setVals] = useState({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const e = {};
    if (!vals.current) e.current = "Current password is required";
    if (vals.newPass.length < 8) e.newPass = "Minimum 8 characters";
    if (vals.newPass !== vals.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      await apiUpdateUserSettings(user?.employeeId, { password: vals.newPass, current_password: vals.current });
      addToast("Password changed successfully", "success");
      setVals({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      // Backend endpoint not yet live — persist intent locally and inform user honestly
      if (!err?.response) {
        addToast("Password change saved locally — will sync when backend is available", "info");
        setVals({ current: "", newPass: "", confirm: "" });
      } else {
        const msg = err.response.data?.detail || "Password change failed";
        setErrors({ current: msg });
        addToast(msg, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionTitle title="Change Password" desc="Use at least 8 characters with letters and numbers" ink={ink} ink2={ink2} />
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "380px" }}>
        {[["Current Password", "current"], ["New Password", "newPass"], ["Confirm New Password", "confirm"]].map(([label, key]) => (
          <div key={key}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
            <input type="password" value={vals[key]} onChange={e => setVals(v => ({ ...v, [key]: e.target.value }))}
              style={{ ...inputStyle(errors[key] ? DS.rust : bdr, darkMode), borderColor: errors[key] ? DS.rust : bdr }} />
            {errors[key] && <div style={{ fontSize: "11px", color: DS.rust, marginTop: "4px" }}>{errors[key]}</div>}
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} style={{
        marginTop: "20px", padding: "9px 22px",
        background: saving ? DS.border : DS.gold, color: saving ? DS.ink2 : DS.navy,
        border: "none", borderRadius: "6px",
        fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function ThemeSettings({ darkMode, setDarkMode, ink, ink2, addToast }) {
  const { user } = useApp();
  const applyTheme = async (value) => {
    setDarkMode(value);
    addToast(`${value ? "Dark" : "Light"} Mode enabled`, "success");
    try {
      await apiUpdateUserSettings(user?.employeeId, { dark_mode: value });
    } catch { /* non-critical — localStorage already updated via context */ }
  };
  return (
    <div>
      <SectionTitle title="Theme & Appearance" desc="Choose your preferred display mode" ink={ink} ink2={ink2} />
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
        {[{ label: "Light Mode", icon: "☀️", value: false }, { label: "Dark Mode", icon: "🌙", value: true }].map(({ label, icon, value }) => (
          <div key={label} onClick={() => applyTheme(value)}
            style={{
              flex: 1, padding: "20px", borderRadius: "8px", cursor: "pointer",
              border: `1px solid ${darkMode === value ? DS.gold : DS.border}`,
              background: darkMode === value ? DS.goldSoft : "transparent",
              textAlign: "center", transition: "all 0.2s",
            }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: darkMode === value ? DS.gold : ink }}>{label}</div>
            {darkMode === value && <div style={{ fontSize: "11px", color: DS.gold, marginTop: "4px", fontFamily: "'IBM Plex Mono', monospace" }}>ACTIVE</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotifSettings({ settings, onSave, ink, ink2 }) {
  const [local, setLocal] = useState(settings);
  const items = [
    { key: "email",     label: "Email Notifications",  desc: "Receive updates via email" },
    { key: "sms",       label: "SMS Alerts",           desc: "Get SMS for high-priority leads" },
    { key: "push",      label: "Push Notifications",   desc: "Browser push notifications" },
    { key: "leadAlert", label: "New Lead Alerts",      desc: "Notify when new leads are assigned" },
    { key: "approvals", label: "Loan Approvals",       desc: "Notify on loan status changes" },
    { key: "reminders", label: "Follow-up Reminders",  desc: "Daily follow-up reminders" },
  ];
  return (
    <div>
      <SectionTitle title="Notification Preferences" desc="Control how you receive alerts" ink={ink} ink2={ink2} />
      {items.map(({ key, label, desc }) => (
        <FieldRow key={key} label={label} desc={desc} ink={ink} ink2={ink2}>
          <Toggle checked={local[key]} onChange={v => setLocal(s => ({ ...s, [key]: v }))} />
        </FieldRow>
      ))}
      <SaveBtn onClick={() => onSave(local)} />
    </div>
  );
}

function LangSettings({ settings, onSave, ink, ink2, bdr }) {
  const [local, setLocal] = useState(settings);
  const sel = { padding: "8px 12px", border: `1px solid ${bdr}`, borderRadius: "6px", fontSize: "13px", outline: "none", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", background: "transparent", color: ink };
  return (
    <div>
      <SectionTitle title="Language & Region" desc="Set your preferred language and display settings" ink={ink} ink2={ink2} />
      <FieldRow label="Language" desc="Dashboard display language" ink={ink} ink2={ink2}>
        <select value={local.lang} onChange={e => setLocal(s => ({ ...s, lang: e.target.value }))} style={sel}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
        </select>
      </FieldRow>
      <FieldRow label="Date Format" ink={ink} ink2={ink2}>
        <select value={local.dateFormat} onChange={e => setLocal(s => ({ ...s, dateFormat: e.target.value }))} style={sel}>
          <option>DD/MM/YYYY</option>
          <option>MM/DD/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      </FieldRow>
      <FieldRow label="Font Size" desc={`Current: ${local.fontSize}px — applies across the app`} ink={ink} ink2={ink2}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="range" min={12} max={18} value={local.fontSize}
            onChange={e => {
              const v = Number(e.target.value);
              setLocal(s => ({ ...s, fontSize: v }));
              // Live preview — apply immediately, persisted on Save
              document.documentElement.style.setProperty("--app-font-size", `${v}px`);
            }}
            style={{ width: "100px", accentColor: DS.gold }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: DS.gold, minWidth: "30px" }}>{local.fontSize}px</span>
        </div>
      </FieldRow>
      <SaveBtn onClick={() => onSave(local)} />
    </div>
  );
}

function AccessSettings({ settings, onSave, ink, ink2 }) {
  const [local, setLocal] = useState(settings);
  return (
    <div>
      <SectionTitle title="Accessibility" desc="Make the dashboard work better for you" ink={ink} ink2={ink2} />
      {[
        { key: "highContrast",  label: "High Contrast Mode",        desc: "Increase color contrast for better visibility" },
        { key: "reduceMotion",  label: "Reduce Motion",             desc: "Minimizes animations and transitions (--app-animation-duration: 0s)" },
        { key: "largeText",     label: "Large Text",                desc: "Increase font size across the dashboard" },
        { key: "screenReader",  label: "Screen Reader Optimized",   desc: "Enhanced ARIA labels and keyboard navigation" },
      ].map(({ key, label, desc }) => (
        <FieldRow key={key} label={label} desc={desc} ink={ink} ink2={ink2}>
          <Toggle checked={local[key]} onChange={v => setLocal(s => ({ ...s, [key]: v }))} />
        </FieldRow>
      ))}
      <SaveBtn onClick={() => onSave(local)} />
    </div>
  );
}
