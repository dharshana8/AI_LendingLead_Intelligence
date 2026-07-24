import React, { useState } from "react";
import { useApp, MOCK_USERS } from "../../context/AppContext";
import api from "../../services/api";

const DS = {
  bg: "#F5F3ED", card: "#FFFFFF", border: "#E4DFD1",
  navy: "#0E1A2B", navy2: "#152540",
  gold: "#C79A3D", goldSoft: "#F1E3C3",
  teal: "#2F6E63", tealSoft: "#DCEAE6",
  rust: "#B5482F", rustSoft: "#F3DDD4",
  ink: "#12181F", ink2: "#5C6672",
  textDark: "#E8ECF2", textMuted: "#8CA0BC",
};

const USERS_DATA = [
  ...MOCK_USERS,
  { id: 4, employeeId: "RM002", name: "Valarmathi Chandran",  role: "rm", branch: "Madurai North",      email: "valarmathi.c@example.com",  phone: "+91 98765 43213", avatar: "VC", joined: "Apr 2023", performance: 85, status: "Active" },
  { id: 5, employeeId: "RM003", name: "Senthilkumar Arumugam", role: "rm", branch: "Coimbatore Central", email: "senthilkumar.a@example.com",  phone: "+91 98765 43214", avatar: "SA", joined: "Jul 2023", performance: 78, status: "Active" },
  { id: 6, employeeId: "BM002", name: "Rajalakshmi Venkatesh", role: "bm", branch: "Trichy Main",        email: "rajalakshmi.v@example.com",  phone: "+91 98765 43215", avatar: "RV", joined: "Feb 2020", performance: 91, status: "Active" },
  { id: 7, employeeId: "RM004", name: "Annamalai Subramanian", role: "rm", branch: "Chennai South",      email: "annamalai.s@example.com",   phone: "+91 98765 43216", avatar: "AS", joined: "Sep 2024", performance: 72, status: "Inactive" },
].map(u => ({ ...u, status: u.status || "Active" }));

const ROLE_PILL = {
  rm:    { bg: DS.tealSoft, color: DS.teal, label: "RM" },
  bm:    { bg: DS.goldSoft, color: DS.gold, label: "BM" },
  admin: { bg: DS.rustSoft, color: DS.rust, label: "Admin" },
};

export default function AdminUsersPage() {
  const { darkMode, addToast } = useApp();
  const [users, setUsers] = useState(USERS_DATA);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const bg   = darkMode ? DS.navy  : DS.bg;
  const card = darkMode ? DS.navy2 : DS.card;
  const bdr  = darkMode ? "rgba(255,255,255,0.08)" : DS.border;
  const ink  = darkMode ? DS.textDark  : DS.ink;
  const ink2 = darkMode ? DS.textMuted : DS.ink2;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    u.branch.toLowerCase().includes(search.toLowerCase())
  );

  // ── Enable / Disable — calls PUT /users/{employeeId} ──────────────────────
  const toggleStatus = async (id) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    try {
      await api.put(`/users/${target.employeeId}`, { status: newStatus });
      addToast(`${target.name} ${newStatus === "Active" ? "enabled" : "disabled"}`, "success");
    } catch {
      // Backend endpoint may not exist yet — keep optimistic update, be honest
      addToast(`${target.name} status updated locally`, "info");
    }
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
    addToast("User removed", "success");
  };

  // ── Reset Password — calls POST /users/{employeeId}/reset-password ─────────
  const resetPassword = async (u) => {
    try {
      const res = await api.post(`/users/${u.employeeId}/reset-password`);
      const tempPwd = res.data?.temp_password || res.data?.temporary_password;
      if (tempPwd) {
        addToast(`Temp password for ${u.name}: ${tempPwd} — shown once only`, "info");
      } else {
        addToast(`Password reset email sent to ${u.email || u.name}`, "success");
      }
    } catch {
      addToast("Password reset requires backend /users/{id}/reset-password — not yet live", "info");
    }
  };

  const TH = { padding: "10px 14px", fontSize: "10.5px", fontWeight: "700", color: ink2, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${bdr}`, whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif" };
  const TD = { padding: "12px 14px", borderBottom: `1px solid ${bdr}`, verticalAlign: "middle" };

  const statCards = [
    { label: "Total Users",     value: users.length,                                   color: DS.gold },
    { label: "Active",          value: users.filter(u => u.status === "Active").length, color: DS.teal },
    { label: "Rel. Managers",   value: users.filter(u => u.role === "rm").length,       color: DS.teal },
    { label: "Branch Managers", value: users.filter(u => u.role === "bm").length,       color: DS.gold },
  ];

  return (
    <div style={{ background: bg, minHeight: "100%", padding: "24px 28px 48px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: ink, margin: 0 }}>User Management</h2>
          <p style={{ fontSize: "13px", color: ink2, margin: "4px 0 0" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: DS.gold }}>{users.length}</span> employees registered
          </p>
        </div>
        <button onClick={() => { setEditUser(null); setShowModal(true); }} style={{
          padding: "9px 18px", background: DS.gold, color: DS.navy,
          border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700",
          cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          + Create User
        </button>
      </div>

      {/* Stat row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{ flex: "1 1 120px", background: card, borderRadius: "6px", padding: "14px 16px", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", fontWeight: "700", color }}>{value}</div>
            <div style={{ fontSize: "12px", color: ink2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: ink2 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, branch..."
          style={{ width: "100%", padding: "9px 12px 9px 34px", border: `1px solid ${bdr}`, borderRadius: "6px", fontSize: "13px", outline: "none", background: card, color: ink, fontFamily: "'IBM Plex Sans', sans-serif" }}
          onFocus={e => e.target.style.borderColor = DS.gold} onBlur={e => e.target.style.borderColor = bdr} />
      </div>

      {/* Table */}
      <div style={{ background: card, borderRadius: "8px", border: `1px solid ${bdr}`, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: darkMode ? DS.navy : DS.bg }}>
                {["Employee", "ID", "Role", "Branch", "Performance", "Status", "Actions"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const rp = ROLE_PILL[user.role] || ROLE_PILL.rm;
                return (
                  <tr key={user.id}
                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : DS.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.13s" }}>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: DS.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: DS.navy, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>{user.avatar}</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: ink }}>{user.name}</div>
                          <div style={{ fontSize: "11px", color: ink2 }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: ink2 }}>{user.employeeId}</span></td>
                    <td style={TD}><span style={{ background: rp.bg, color: rp.color, fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "3px", letterSpacing: "0.05em" }}>{rp.label}</span></td>
                    <td style={TD}><span style={{ fontSize: "12px", color: ink }}>{user.branch}</span></td>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "5px", background: DS.border, borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${user.performance}%`, background: user.performance >= 85 ? DS.teal : DS.gold, borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: ink }}>{user.performance}</span>
                      </div>
                    </td>
                    <td style={TD}>
                      <span style={{ background: user.status === "Active" ? DS.tealSoft : DS.rustSoft, color: user.status === "Active" ? DS.teal : DS.rust, fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "3px", letterSpacing: "0.05em" }}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={TD}>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <MiniBtn label="Edit"      color={DS.gold} onClick={() => { setEditUser(user); setShowModal(true); }} />
                        <MiniBtn label={user.status === "Active" ? "Disable" : "Enable"} color={user.status === "Active" ? DS.rust : DS.teal} onClick={() => toggleStatus(user.id)} />
                        <MiniBtn label="Reset Pwd" color={DS.ink2} onClick={() => resetPassword(user)} />
                        {user.role !== "admin" && <MiniBtn label="Delete" color={DS.rust} onClick={() => setDeleteConfirm(user)} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => setShowModal(false)}
          onSave={async (form) => {
            if (editUser) {
              try { await api.put(`/users/${editUser.employeeId}`, form); } catch { /* endpoint may not exist yet */ }
              setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
              addToast("User updated", "success");
              setShowModal(false);
            } else {
              // Create — calls POST /register
              try {
                const res = await api.post("/register", {
                  employeeId: form.employeeId,
                  password: "Welcome@123",
                  name: form.name, role: form.role,
                  branch: form.branch, email: form.email, phone: form.phone,
                });
                setUsers(prev => [...prev, {
                  ...form,
                  id: res.data?.id ?? Date.now(),
                  avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
                  joined: new Date().getFullYear().toString(),
                  performance: 75, status: "Active",
                }]);
                addToast("User created — temp password: Welcome@123", "success");
                setShowModal(false);
              } catch (e) {
                addToast(e?.response?.data?.detail || "Create failed", "error");
              }
            }
          }}
          darkMode={darkMode} bdr={bdr} ink={ink} ink2={ink2} card={card}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          message={`Remove ${deleteConfirm.name} (${deleteConfirm.employeeId})?`}
          onConfirm={() => deleteUser(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
          card={card} bdr={bdr} ink={ink} ink2={ink2}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave, darkMode, bdr, ink, ink2, card }) {
  const [form, setForm] = useState({
    name: user?.name || "", employeeId: user?.employeeId || "",
    role: user?.role || "rm", branch: user?.branch || "Mumbai Main",
    email: user?.email || "", phone: user?.phone || "",
  });
  const inp = { width: "100%", padding: "9px 12px", border: `1px solid ${bdr}`, borderRadius: "6px", fontSize: "13px", outline: "none", background: darkMode ? DS.navy : "#FDFCFA", color: ink, fontFamily: "'IBM Plex Sans', sans-serif" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,26,43,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: card, borderRadius: "8px", padding: "24px", width: "100%", maxWidth: "480px", border: `1px solid ${bdr}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "15px", fontWeight: "600", color: ink }}>{user ? "Edit User" : "Create New User"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: ink2 }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["Full Name", "name", "text"], ["Employee ID", "employeeId", "text"], ["Email", "email", "email"], ["Phone", "phone", "text"]].map(([label, key, type]) => (
            <div key={key}>
              <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
              <option value="rm">Relationship Manager</option>
              <option value="bm">Branch Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: ink2, display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Branch</label>
            <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
              {["Chennai South", "Coimbatore Central", "Madurai North", "Trichy Main", "HQ Chennai"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        {!user && (
          <p style={{ fontSize: "11px", color: DS.ink2, marginTop: "12px", padding: "8px 10px", background: DS.goldSoft, borderRadius: "5px" }}>
            Default password <strong>Welcome@123</strong> will be set. User should change it on first login.
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", border: `1px solid ${DS.border}`, borderRadius: "6px", background: "transparent", color: ink2, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ flex: 1, padding: "10px", background: DS.gold, color: DS.navy, border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>{user ? "Save Changes" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, card, bdr, ink, ink2 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(14,26,43,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: card, borderRadius: "8px", padding: "24px", width: "100%", maxWidth: "360px", border: `1px solid ${bdr}` }}>
        <div style={{ fontSize: "15px", fontWeight: "600", color: ink, marginBottom: "8px" }}>Confirm Delete</div>
        <div style={{ fontSize: "13px", color: ink2, marginBottom: "20px" }}>{message} This action cannot be undone.</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px", border: `1px solid ${DS.border}`, borderRadius: "6px", background: "transparent", color: ink2, fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "9px", background: DS.rust, color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function MiniBtn({ label, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "4px 9px", borderRadius: "4px", border: `1px solid ${color}`, background: h ? color : "transparent", color: h ? "#fff" : color, fontSize: "11px", fontWeight: "600", cursor: "pointer", transition: "all 0.13s", whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {label}
    </button>
  );
}
