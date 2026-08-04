import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee", branch: "" });

    const fetchUsers = async () => {
        try { const r = await axios.get("/auth/users"); setUsers(r.data); }
        catch { setError("ໂຫລດຜູ້ໃຊ້ບໍ່ສຳເລັດ"); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async () => {
        try {
            if (!form.name || !form.email || !form.password) return setError("ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ");
            await axios.post("/auth/register", form);
            const res = await axios.get("/auth/users");
            const newUser = res.data.find((u) => u.email === form.email);
            if (newUser) await axios.put(`/auth/users/${newUser._id}/approve`);
            setForm({ name: "", email: "", password: "", role: "employee", branch: "" });
            setShowForm(false); setError(""); fetchUsers();
            alert("ສ້າງຜູ້ໃຊ້ສຳເລັດ!");
        } catch (err) { setError(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleApprove = async (id) => { await axios.put(`/auth/users/${id}/approve`); fetchUsers(); };
    const handleBlock = async (id) => { await axios.put(`/auth/users/${id}/block`); fetchUsers(); };

    const statusInfo = {
        approved: { text: "ອະນຸມັດ", cls: "badge-green", icon: "ti-circle-check" },
        pending: { text: "ຖ້າ", cls: "badge-yellow", icon: "ti-clock" },
        blocked: { text: "ຖືກບ໋ອກ", cls: "badge-red", icon: "ti-ban" },
    };
    const roleInfo = {
        owner: { text: "ເຈົ້າຂອງ", cls: "badge-purple", icon: "ti-crown" },
        employee: { text: "ພະນັກງານ", cls: "badge-blue", icon: "ti-id-badge" },
        branch: { text: "ສາຂາ", cls: "badge-green", icon: "ti-building-store" },
    };

    const filtered = users.filter((u) => {
        const ms = filterStatus ? u.status === filterStatus : true;
        const mr = filterRole ? u.role === filterRole : true;
        return ms && mr;
    });
    const counts = {
        total: users.length,
        approved: users.filter((u) => u.status === "approved").length,
        pending: users.filter((u) => u.status === "pending").length,
        blocked: users.filter((u) => u.status === "blocked").length,
    };

    /* Mobile user card */
    const UserCard = ({ u }) => (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                    {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                <span className={`badge ${statusInfo[u.status]?.cls}`}>
                    <i className={`ti ${statusInfo[u.status]?.icon}`} />{statusInfo[u.status]?.text}
                </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span className={`badge ${roleInfo[u.role]?.cls}`}>
                    <i className={`ti ${roleInfo[u.role]?.icon}`} />{roleInfo[u.role]?.text}
                </span>
                {u.branch && <span className="badge badge-gray">{u.branch}</span>}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {u.status !== "approved" && (
                    <button className="btn btn-sm btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleApprove(u._id)}>
                        <i className="ti ti-check" />ອະນຸມັດ
                    </button>
                )}
                {u.status !== "blocked" && (
                    <button className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleBlock(u._id)}>
                        <i className="ti ti-ban" />ບ໋ອກ
                    </button>
                )}
                {u.status === "blocked" && (
                    <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleApprove(u._id)}>
                        <i className="ti ti-lock-open" />ປົດ
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Layout title="ຜູ້ໃຊ້">
            <style>{`
                .users-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 18px;
                }
                @media (max-width: 768px) {
                    .users-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px;
                    }
                    .users-table-wrap { display: none !important; }
                    .users-card-wrap  { display: block !important; }
                }
                @media (min-width: 769px) {
                    .users-card-wrap  { display: none !important; }
                    .users-table-wrap { display: block; }
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h2 className="page-title">ຈັດການຜູ້ໃຊ້ງານ</h2>
                    <p className="page-sub">{users.length} ຜູ້ໃຊ້ທັງໝົດ</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setForm({ name: "", email: "", password: "", role: "employee", branch: "" });
                    setShowForm(!showForm); setError("");
                }}>
                    <i className="ti ti-user-plus" />ສ້າງຜູ້ໃຊ້ໃໝ່
                </button>
            </div>

            {/* Stats — 2 cols on mobile */}
            <div className="users-stats-grid">
                {[
                    { icon: "ti-users", num: counts.total, label: "ທັງໝົດ", color: "#2563eb", bg: "#eff6ff", filter: "" },
                    { icon: "ti-circle-check", num: counts.approved, label: "ອະນຸມັດ", color: "#16a34a", bg: "#f0fdf4", filter: "approved" },
                    { icon: "ti-clock", num: counts.pending, label: "ຖ້າ", color: "#d97706", bg: "#fffbeb", filter: "pending" },
                    { icon: "ti-ban", num: counts.blocked, label: "ຖືກບ໋ອກ", color: "#dc2626", bg: "#fef2f2", filter: "blocked" },
                ].map((s) => (
                    <div key={s.label} className="stat-card"
                        style={{ borderTop: `3px solid ${s.color}`, cursor: "pointer", outline: filterStatus === s.filter ? `2px solid ${s.color}` : "none" }}
                        onClick={() => setFilterStatus(s.filter)}>
                        <div className="stat-card-top">
                            <div className="stat-icon-box" style={{ background: s.bg, color: s.color }}>
                                <i className={`ti ${s.icon}`} />
                            </div>
                        </div>
                        <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 18 }}>
                    <div className="card-header">
                        <span className="card-title"><i className="ti ti-user-plus" />ສ້າງຜູ້ໃຊ້ໃໝ່</span>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setShowForm(false); setError(""); }}>
                            <i className="ti ti-x" />ປິດ
                        </button>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label className="form-label">ຊື່ *</label>
                                <input className="form-input" placeholder="ຊື່ຜູ້ໃຊ້" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ອີເມວ *</label>
                                <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ລະຫັດຜ່ານ *</label>
                                <input className="form-input" type="password" placeholder="ລະຫັດຜ່ານ" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ບົດບາດ</label>
                                <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                    <option value="employee">ພະນັກງານ</option>
                                    <option value="branch">ສາຂາ</option>
                                    <option value="owner">ເຈົ້າຂອງບໍລິສັດ</option>
                                </select>
                            </div>
                            {form.role === "branch" && (
                                <div className="form-field">
                                    <label className="form-label">ຊື່ສາຂາ</label>
                                    <input className="form-input" placeholder="ຊື່ສາຂາ" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-success" onClick={handleCreate}><i className="ti ti-check" />ສ້າງຜູ້ໃຊ້</button>
                            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setError(""); }}>ຍົກເລີກ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">ທຸກສະຖານະ</option>
                            <option value="approved">ອະນຸມັດ</option>
                            <option value="pending">ຖ້າ</option>
                            <option value="blocked">ຖືກບ໋ອກ</option>
                        </select>
                        <select className="form-input" style={{ flex: 1, minWidth: 140 }} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="">ທຸກບົດບາດ</option>
                            <option value="owner">ເຈົ້າຂອງ</option>
                            <option value="employee">ພະນັກງານ</option>
                            <option value="branch">ສາຂາ</option>
                        </select>
                        <button className="btn btn-ghost" onClick={() => { setFilterStatus(""); setFilterRole(""); }}>
                            <i className="ti ti-x" />Reset
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ display: "flex", gap: 8, padding: "48px", justifyContent: "center", color: "#94a3b8" }}>
                    <i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...
                </div>
            )}

            {!loading && (
                <>
                    {/* Desktop table */}
                    <div className="card users-table-wrap">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ຜູ້ໃຊ້</th>
                                        <th>ບົດບາດ</th>
                                        <th className="hide-mobile">ສາຂາ</th>
                                        <th>ສະຖານະ</th>
                                        <th>ຈັດການ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                                                        {u.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</div>
                                                        <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${roleInfo[u.role]?.cls}`}>
                                                    <i className={`ti ${roleInfo[u.role]?.icon}`} />{roleInfo[u.role]?.text}
                                                </span>
                                            </td>
                                            <td className="hide-mobile" style={{ color: "#64748b" }}>{u.branch || "—"}</td>
                                            <td>
                                                <span className={`badge ${statusInfo[u.status]?.cls}`}>
                                                    <i className={`ti ${statusInfo[u.status]?.icon}`} />{statusInfo[u.status]?.text}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    {u.status !== "approved" && <button className="btn btn-sm btn-success" onClick={() => handleApprove(u._id)}><i className="ti ti-check" />ອະນຸມັດ</button>}
                                                    {u.status !== "blocked" && <button className="btn btn-sm btn-danger" onClick={() => handleBlock(u._id)}><i className="ti ti-ban" />ບ໋ອກ</button>}
                                                    {u.status === "blocked" && <button className="btn btn-sm btn-ghost" onClick={() => handleApprove(u._id)}><i className="ti ti-lock-open" />ປົດ</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon"><i className="ti ti-users" /></div>
                                <p className="empty-state-text">ບໍ່ພົບຜູ້ໃຊ້</p>
                            </div>
                        )}
                    </div>

                    {/* Mobile cards */}
                    <div className="users-card-wrap">
                        {filtered.length === 0 ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><i className="ti ti-users" /></div>
                                    <p className="empty-state-text">ບໍ່ພົບຜູ້ໃຊ້</p>
                                </div>
                            </div>
                        ) : filtered.map((u) => <UserCard key={u._id} u={u} />)}
                    </div>
                </>
            )}
        </Layout>
    );
}