import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function BranchesPage() {
    const [branches, setBranches] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ branchName: "", address: "", phone: "", email: "" });

    const fetchBranches = async () => {
        try { const r = await axios.get("/branches"); setBranches(r.data); }
        catch { setError("ໂຫລດສາຂາບໍ່ສຳເລັດ"); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchBranches(); }, []);

    const handleSubmit = async () => {
        try {
            if (!form.branchName) return setError("ກະລຸນາກອກຊື່ສາຂາ");
            if (editId) { await axios.put(`/branches/${editId}`, form); }
            else { await axios.post("/branches", form); }
            setForm({ branchName: "", address: "", phone: "", email: "" });
            setEditId(null); setShowForm(false); setError(""); fetchBranches();
        } catch (err) { setError(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleEdit = (b) => {
        setForm({ branchName: b.branchName, address: b.address, phone: b.phone, email: b.email });
        setEditId(b._id); setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleDelete = async (id) => {
        if (!window.confirm("ຢືນຢັນລົບສາຂານີ້?")) return;
        try { await axios.delete(`/branches/${id}`); fetchBranches(); }
        catch { setError("ລົບບໍ່ສຳເລັດ"); }
    };

    const palette = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];
    const getColor = (i) => palette[i % palette.length];

    return (
        <Layout title="ສາຂາ">
            <div className="page-header">
                <div>
                    <h2 className="page-title">ຈັດການສາຂາ</h2>
                    <p className="page-sub">{branches.length} ສາຂາ</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setForm({ branchName: "", address: "", phone: "", email: "" });
                    setEditId(null); setShowForm(!showForm); setError("");
                }}>
                    <i className="ti ti-plus" />ເພີ່ມສາຂາໃໝ່
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 18 }}>
                    <div className="card-header">
                        <span className="card-title">
                            <i className={`ti ${editId ? "ti-pencil" : "ti-plus"}`} />
                            {editId ? "ແກ້ໄຂສາຂາ" : "ເພີ່ມສາຂາໃໝ່"}
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>
                            <i className="ti ti-x" />ປິດ
                        </button>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label className="form-label">ຊື່ສາຂາ *</label>
                                <input className="form-input" placeholder="ຊື່ສາຂາ" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ອີເມວ</label>
                                <input className="form-input" type="email" placeholder="email@branch.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ທີ່ຢູ່</label>
                                <input className="form-input" placeholder="ທີ່ຢູ່ສາຂາ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ເບີໂທ</label>
                                <input className="form-input" placeholder="020 XXXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-success" onClick={handleSubmit}>
                                <i className={`ti ${editId ? "ti-device-floppy" : "ti-plus"}`} />{editId ? "ບັນທຶກ" : "ເພີ່ມສາຂາ"}
                            </button>
                            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>ຍົກເລີກ</button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ display: "flex", gap: 8, padding: "48px", justifyContent: "center", color: "#94a3b8" }}>
                    <i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 16 }}>
                {branches.map((b, i) => (
                    <div key={b._id} className="card" style={{ overflow: "hidden" }}>
                        {/* Header strip */}
                        <div style={{ background: `linear-gradient(135deg,${getColor(i)},${getColor(i)}cc)`, padding: "18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                                {b.branchName.charAt(0)}
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{b.branchName}</div>
                                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>ສາຂາ #{i + 1}</div>
                            </div>
                        </div>
                        {/* Body */}
                        <div style={{ padding: 16 }}>
                            {[
                                { icon: "ti-map-pin", label: "ທີ່ຢູ່", val: b.address },
                                { icon: "ti-phone", label: "ເບີໂທ", val: b.phone },
                                { icon: "ti-mail", label: "ອີເມວ", val: b.email },
                            ].map(({ icon, label, val }) => (
                                <div key={label} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                    <i className={`ti ${icon}`} style={{ fontSize: 16, color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 10.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</div>
                                        <div style={{ fontSize: 13.5, color: "#334155", fontWeight: 500, marginTop: 1 }}>{val || "—"}</div>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                <button className="btn btn-outline-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleEdit(b)}>
                                    <i className="ti ti-pencil" />ແກ້ໄຂ
                                </button>
                                <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(b._id)}>
                                    <i className="ti ti-trash" />ລົບ
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && branches.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><i className="ti ti-building-store" /></div>
                        <p className="empty-state-text">ຍັງບໍ່ມີສາຂາ</p>
                        <p className="empty-state-sub">ກົດ "ເພີ່ມສາຂາໃໝ່" ດ້ານເທິງ</p>
                    </div>
                </div>
            )}
        </Layout>
    );
}