import React, { useState } from "react";
import { useApp, MOCK_USERS } from "../../context/AppContext";

const USERS_DATA = [
  ...MOCK_USERS,
  { id: 4, employeeId: "RM002", name: "Sneha Kapoor", role: "rm", branch: "Delhi Central", email: "sneha.kapoor@idbi.co.in", phone: "+91 98765 43213", avatar: "SK", joined: "Apr 2023", performance: 85, status: "Active" },
  { id: 5, employeeId: "RM003", name: "Rahul Desai", role: "rm", branch: "Bangalore Tech", email: "rahul.desai@idbi.co.in", phone: "+91 98765 43214", avatar: "RD", joined: "Jul 2023", performance: 78, status: "Active" },
  { id: 6, employeeId: "BM002", name: "Kavya Nair", role: "bm", branch: "Chennai South", email: "kavya.nair@idbi.co.in", phone: "+91 98765 43215", avatar: "KN", joined: "Feb 2020", performance: 91, status: "Active" },
  { id: 7, employeeId: "RM004", name: "Arjun Pillai", role: "rm", branch: "Mumbai Main", email: "arjun.pillai@idbi.co.in", phone: "+91 98765 43216", avatar: "AP", joined: "Sep 2024", performance: 72, status: "Inactive" },
].map(u => ({ ...u, status: u.status || "Active" }));

const ROLE_COLORS = { rm: ["#eff6ff", "#1e40af", "RM"], bm: ["#f5f3ff", "#6d28d9", "BM"], admin: ["#fee2e2", "#b91c1c", "Admin"] };

export default function AdminUsersPage() {
  const { darkMode, addToast } = useApp();
  const [users, setUsers] = useState(USERS_DATA);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const bg = darkMode ? "#0f172a" : "#f5f7fb";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const textPrimary = darkMode ? "#f1f5f9" : "#111827";
  const textSecondary = darkMode ? "#94a3b8" : "#6b7280";

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    u.branch.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    addToast("User status updated", "success");
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addToast("User removed", "warning");
  };

  const th = { padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `2px solid ${border}`, background: darkMode ? "#0f172a" : "#f9fafb", whiteSpace: "nowrap" };
  const td = { padding: "13px 14px", borderBottom: `1px solid ${border}`, verticalAlign: "middle" };

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: textPrimary, margin: 0 }}>User Management</h2>
          <p style={{ fontSize: "13px", color: textSecondary, margin: "4px 0 0" }}>{users.length} employees registered</p>
        </div>
        <button onClick={() => { setEditUser(null); setShowModal(true); }}
          style={{ padding: "9px 18px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          + Create User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Total Users", value: users.length, color: "#1e40af", bg: "#eff6ff" },
          { label: "Active", value: users.filter(u => u.status === "Active").length, color: "#15803d", bg: "#dcfce7" },
          { label: "Rel. Managers", value: users.filter(u => u.role === "rm").length, color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Branch Managers", value: users.filter(u => u.role === "bm").length, color: "#0891b2", bg: "#ecfeff" },
        ].map(({ label, value, color, bg: sbg }) => (
          <div key={label} style={{ flex: "1 1 120px", background: cardBg, borderRadius: "10px", padding: "14px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: textSecondary }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, branch..."
          style={{ width: "100%", padding: "9px 12px 9px 34px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: cardBg, color: textPrimary }}
          onFocus={e => e.target.style.borderColor = "#1e40af"} onBlur={e => e.target.style.borderColor = border} />
      </div>

      <div style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${border}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Employee", "ID", "Role", "Branch", "Performance", "Status", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const [rbg, rc, rl] = ROLE_COLORS[user.role] || ["#f3f4f6", "#374151", "?"];
                return (
                  <tr key={user.id} style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#1e3a5f" : "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff" }}>{user.avatar}</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: textPrimary }}>{user.name}</div>
                          <div style={{ fontSize: "11px", color: textSecondary }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}><span style={{ fontSize: "12px", fontWeight: "600", color: textSecondary }}>{user.employeeId}</span></td>
                    <td style={td}><span style={{ background: rbg, color: rc, fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>{rl}</span></td>
                    <td style={td}><span style={{ fontSize: "12px", color: textPrimary }}>{user.branch}</span></td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "50px", height: "6px", background: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${user.performance}%`, background: user.performance >= 85 ? "#22c55e" : "#f59e0b", borderRadius: "10px" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: textPrimary }}>{user.performance}</span>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ background: user.status === "Active" ? "#dcfce7" : "#fee2e2", color: user.status === "Active" ? "#15803d" : "#b91c1c", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>{user.status}</span>
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <MiniBtn label="Edit" color="#1e40af" onClick={() => { setEditUser(user); setShowModal(true); }} />
                        <MiniBtn label={user.status === "Active" ? "Disable" : "Enable"} color={user.status === "Active" ? "#b45309" : "#15803d"} onClick={() => toggleStatus(user.id)} />
                        <MiniBtn label="Reset Pwd" color="#7c3aed" onClick={() => addToast(`Password reset link sent to ${user.name}`, "info")} />
                        {user.role !== "admin" && <MiniBtn label="Delete" color="#ef4444" onClick={() => deleteUser(user.id)} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <UserModal user={editUser} onClose={() => setShowModal(false)} onSave={(u) => { addToast(editUser ? "User updated" : "User created", "success"); setShowModal(false); }} darkMode={darkMode} border={border} textPrimary={textPrimary} textSecondary={textSecondary} cardBg={cardBg} />}
    </div>
  );
}

function UserModal({ user, onClose, onSave, darkMode, border, textPrimary, textSecondary, cardBg }) {
  const [form, setForm] = useState({ name: user?.name || "", employeeId: user?.employeeId || "", role: user?.role || "rm", branch: user?.branch || "Mumbai Main", email: user?.email || "", phone: user?.phone || "" });
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${border}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: darkMode ? "#0f172a" : "#f9fafb", color: textPrimary };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: cardBg, borderRadius: "14px", padding: "24px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: textPrimary }}>{user ? "Edit User" : "Create New User"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: textSecondary }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["Full Name", "name", "text"], ["Employee ID", "employeeId", "text"], ["Email", "email", "email"], ["Phone", "phone", "text"]].map(([label, key, type]) => (
            <div key={key}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="rm">Relationship Manager</option>
              <option value="bm">Branch Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: textSecondary, display: "block", marginBottom: "5px" }}>Branch</label>
            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              {["Mumbai Main", "Delhi Central", "Bangalore Tech", "Chennai South", "HQ Mumbai"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1.5px solid ${border}`, borderRadius: "8px", background: "transparent", color: textSecondary, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ flex: 1, padding: "10px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{user ? "Save Changes" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}

function MiniBtn({ label, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "4px 9px", borderRadius: "6px", border: `1px solid ${color}`, background: h ? color : "transparent", color: h ? "#fff" : color, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}
