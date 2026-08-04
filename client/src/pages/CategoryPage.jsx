import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function CategoryPage() {
    const [grouped, setGrouped] = useState({});
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ mainCategory: "", subCategory: "", description: "" });

    const fetchCategories = async () => {
        try { const r = await axios.get("/categories/grouped"); setGrouped(r.data); }
        catch { setError("ໂຫລດໝວດໝູ່ບໍ່ສຳເລັດ"); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchCategories(); }, []);

    const totalMain = Object.keys(grouped).length;
    const totalSub = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);

    const handleSubmit = async () => {
        try {
            if (!form.mainCategory || !form.subCategory) return setError("ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ");
            if (editId) { await axios.put(`/categories/${editId}`, form); }
            else { await axios.post("/categories", form); }
            setForm({ mainCategory: "", subCategory: "", description: "" });
            setEditId(null); setShowForm(false); setError(""); fetchCategories();
        } catch (err) { setError(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleEdit = (sub, mainCategory) => {
        setForm({ mainCategory, subCategory: sub.subCategory, description: sub.description });
        setEditId(sub._id); setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleDelete = async (id) => {
        if (!window.confirm("ຢືນຢັນລົບໝວດໝູ່?")) return;
        try { await axios.delete(`/categories/${id}`); fetchCategories(); }
        catch (err) { setError(err.response?.data?.message || "ລົບບໍ່ສຳເລັດ"); }
    };
    const toggleExpand = (main) => setExpanded((p) => ({ ...p, [main]: !p[main] }));

    const palette = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d", "#92400e"];
    const getColor = (i) => palette[i % palette.length];

    return (
        <Layout title="ໝວດໝູ່">
            <div className="page-header">
                <div>
                    <h2 className="page-title">ຈັດການໝວດໝູ່</h2>
                    <p className="page-sub">{totalMain} ໝວດຫຼັກ · {totalSub} ໝວດຍ່ອຍ</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setForm({ mainCategory: "", subCategory: "", description: "" });
                    setEditId(null); setShowForm(!showForm); setError("");
                }}>
                    <i className="ti ti-plus" />ເພີ່ມໝວດໝູ່
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 18 }}>
                    <div className="card-header">
                        <span className="card-title">
                            <i className={`ti ${editId ? "ti-pencil" : "ti-plus"}`} />
                            {editId ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>
                            <i className="ti ti-x" />ປິດ
                        </button>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                        <div className="form-grid-3">
                            <div className="form-field">
                                <label className="form-label">ໝວດໝູ່ຫຼັກ *</label>
                                <input className="form-input" placeholder="ເຊັ່ນ ອາຫານ, ເຄື່ອງດື່ມ" value={form.mainCategory} onChange={(e) => setForm({ ...form, mainCategory: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ໝວດໝູ່ຍ່ອຍ *</label>
                                <input className="form-input" placeholder="ເຊັ່ນ ໝູ, ໄກ່" value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ຄຳອະທິບາຍ</label>
                                <input className="form-input" placeholder="ຄຳອະທິບາຍ (ບໍ່ບັງຄັບ)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-success" onClick={handleSubmit}>
                                <i className={`ti ${editId ? "ti-device-floppy" : "ti-plus"}`} />{editId ? "ບັນທຶກ" : "ເພີ່ມ"}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(grouped).map(([main, subs], index) => (
                    <div key={main} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", userSelect: "none", flexWrap: "wrap", gap: 8 }}
                            onClick={() => toggleExpand(main)}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: getColor(index), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                                    {main.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14.5, color: "#0f172a" }}>{main}</div>
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{subs.length} ໝວດຍ່ອຍ</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {subs.slice(0, 3).map((s) => (
                                        <span key={s._id} className="badge badge-gray" style={{ fontSize: 11 }}>{s.subCategory}</span>
                                    ))}
                                    {subs.length > 3 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{subs.length - 3}</span>}
                                </div>
                                <i className={`ti ${expanded[main] ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ color: "#94a3b8", fontSize: 16 }} />
                            </div>
                        </div>

                        {expanded[main] && (
                            <div style={{ padding: "8px 16px 16px", borderTop: "1px solid #f1f5f9" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 8, marginTop: 8 }}>
                                    {subs.map((sub) => (
                                        <div key={sub._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9", gap: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: 13.5, color: "#0f172a" }}>{sub.subCategory}</div>
                                                {sub.description && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub.description}</div>}
                                            </div>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(sub, main)}><i className="ti ti-pencil" />ແກ້ໄຂ</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sub._id)}><i className="ti ti-trash" />ລົບ</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!loading && Object.keys(grouped).length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><i className="ti ti-tags" /></div>
                        <p className="empty-state-text">ຍັງບໍ່ມີໝວດໝູ່</p>
                        <p className="empty-state-sub">ກົດ "ເພີ່ມໝວດໝູ່" ດ້ານເທິງ</p>
                    </div>
                </div>
            )}
        </Layout>
    );
}