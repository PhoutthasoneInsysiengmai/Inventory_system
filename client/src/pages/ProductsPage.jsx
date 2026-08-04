import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const emptyForm = { productCode: "", productName: "", category: "", unit: "ອັນ", quantity: "", minimumStock: "" };
const unitOptions = ["ອັນ", "ກ່ອງ (Box)", "ແພັກ (Pack)", "ຖົງ (Bag)", "ຂວດ (Bottle)", "ກະປ໋ອງ (Can)", "ໂຫລ (Dozen)", "ກິໂລ (kg)", "ລິດ (L)", "ອື່ນໆ"];

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [groupedCats, setGroupedCats] = useState({});
    const [search, setSearch] = useState("");
    const [filterMain, setFilterMain] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");
    const canEdit = ["owner", "employee"].includes(user?.role);

    const fetchProducts = async () => { try { const r = await axios.get("/products"); setProducts(r.data); } catch { setError("ໂຫລດສິນຄ້າບໍ່ສຳເລັດ"); } finally { setLoading(false); } };
    const fetchCats = async () => { const r = await axios.get("/categories/grouped"); setGroupedCats(r.data); };
    useEffect(() => { fetchProducts(); fetchCats(); if (window.innerWidth < 768) setViewMode("card"); }, []);

    const handleSearch = async () => {
        if (!search.trim()) return fetchProducts();
        try { const r = await axios.get(`/products/search?query=${search}`); setProducts(r.data); }
        catch { setProducts([]); }
    };
    const filtered = filterMain ? products.filter((p) => p.category?.mainCategory === filterMain) : products;

    const handleSubmit = async () => {
        try {
            if (!form.category) return setError("ກະລຸນາເລືອກໝວດໝູ່");
            if (!form.productCode) return setError("ກະລຸນາກອກລະຫັດສິນຄ້າ");
            if (!form.productName) return setError("ກະລຸນາກອກຊື່ສິນຄ້າ");
            if (editId) { await axios.put(`/products/${editId}`, form); }
            else { await axios.post("/products", form); }
            setForm(emptyForm); setEditId(null); setShowForm(false); setError(""); fetchProducts();
        } catch (err) { setError(err.response?.data?.error || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleEdit = (p) => {
        setForm({ productCode: p.productCode, productName: p.productName, category: p.category?._id || "", unit: p.unit || "ອັນ", quantity: p.quantity, minimumStock: p.minimumStock });
        setEditId(p._id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleDelete = async (id) => {
        if (!window.confirm("ຢືນຢັນລົບ?")) return;
        try { await axios.delete(`/products/${id}`); fetchProducts(); }
        catch { setError("ລົບບໍ່ສຳເລັດ"); }
    };
    const lowCount = products.filter((p) => p.quantity <= p.minimumStock).length;

    return (
        <Layout title="ສິນຄ້າ">
            <div className="page-header">
                <div>
                    <h2 className="page-title">ລາຍການສິນຄ້າ</h2>
                    <p className="page-sub">
                        ທັງໝົດ {products.length} ລາຍການ
                        {lowCount > 0 && <span style={{ color: "#dc2626", marginLeft: 8 }}>· ໃກ້ໝົດ {lowCount} ລາຍການ</span>}
                    </p>
                </div>
                <div className="page-actions">
                    <div className="view-toggle">
                        <button className={`toggle-btn${viewMode === "table" ? " active" : ""}`} onClick={() => setViewMode("table")}>
                            <i className="ti ti-table" />ຕາຕະລາງ
                        </button>
                        <button className={`toggle-btn${viewMode === "card" ? " active" : ""}`} onClick={() => setViewMode("card")}>
                            <i className="ti ti-layout-grid" />ບ໋ອກ
                        </button>
                    </div>
                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); setError(""); }}>
                            <i className="ti ti-plus" />ເພີ່ມສິນຄ້າ
                        </button>
                    )}
                </div>
            </div>

            {/* Form */}
            {showForm && canEdit && (
                <div className="card" style={{ marginBottom: 18 }}>
                    <div className="card-header">
                        <span className="card-title">
                            <i className={`ti ${editId ? "ti-pencil" : "ti-plus"}`} />{editId ? "ແກ້ໄຂສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່"}
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>
                            <i className="ti ti-x" />ປິດ
                        </button>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label className="form-label">ລະຫັດສິນຄ້າ *</label>
                                <input className="form-input" placeholder="ເຊັ່ນ P001" value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value.toUpperCase() })} disabled={!!editId} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ຊື່ສິນຄ້າ *</label>
                                <input className="form-input" placeholder="ຊື່ສິນຄ້າ" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ໝວດໝູ່ *</label>
                                <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option value="">-- ເລືອກໝວດໝູ່ --</option>
                                    {Object.entries(groupedCats).map(([main, subs]) => (
                                        <optgroup key={main} label={main}>
                                            {subs.map((s) => <option key={s._id} value={s._id}>{s.subCategory}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">ໜ່ວຍ *</label>
                                <select className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                                    {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">ຈຳນວນ</label>
                                <input className="form-input" type="number" min="0" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ຈຳນວນຂັ້ນຕ່ຳ</label>
                                <input className="form-input" type="number" min="0" placeholder="0" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-success" onClick={handleSubmit}>
                                <i className={`ti ${editId ? "ti-device-floppy" : "ti-plus"}`} />{editId ? "ບັນທຶກ" : "ເພີ່ມສິນຄ້າ"}
                            </button>
                            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setError(""); }}>
                                ຍົກເລີກ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <div className="form-input-icon-wrap" style={{ flex: 1, minWidth: 180 }}>
                            <i className="ti ti-search" />
                            <input className="form-input" placeholder="ຄົ້ນຫາລະຫັດ ຫຼື ຊື່ສິນຄ້າ..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                        </div>
                        <select className="form-input" style={{ width: 160 }} value={filterMain} onChange={(e) => setFilterMain(e.target.value)}>
                            <option value="">ທຸກໝວດໝູ່</option>
                            {Object.keys(groupedCats).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button className="btn btn-primary" onClick={handleSearch}><i className="ti ti-search" />ຄົ້ນຫາ</button>
                        <button className="btn btn-ghost" onClick={() => { setSearch(""); setFilterMain(""); fetchProducts(); }}><i className="ti ti-x" />Reset</button>
                    </div>
                </div>
            </div>

            {loading && <div style={{ display: "flex", gap: 8, padding: "48px", justifyContent: "center", color: "#94a3b8" }}><i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...</div>}
            {!loading && filtered.length === 0 && (
                <div className="card"><div className="empty-state"><div className="empty-state-icon"><i className="ti ti-package" /></div><p className="empty-state-text">ບໍ່ພົບສິນຄ້າ</p></div></div>
            )}

            {/* Table */}
            {!loading && viewMode === "table" && filtered.length > 0 && (
                <div className="card">
                    <div className="table-wrap">
                        <table className="table">
                            <thead><tr><th>ລະຫັດ</th><th>ຊື່ສິນຄ້າ</th><th className="hide-mobile">ໝວດໝູ່</th><th>ໜ່ວຍ</th><th>ຄົງເຫຼືອ</th><th className="hide-mobile">ຂັ້ນຕ່ຳ</th><th>ສະຖານະ</th>{canEdit && <th>ຈັດການ</th>}</tr></thead>
                            <tbody>
                                {filtered.map((p) => {
                                    const isLow = p.quantity <= p.minimumStock;
                                    return (
                                        <tr key={p._id} style={isLow ? { background: "#fff8f8" } : {}}>
                                            <td><span className="badge badge-gray">{p.productCode}</span></td>
                                            <td><div style={{ fontWeight: 600, color: "#0f172a" }}>{p.productName}</div></td>
                                            <td className="hide-mobile">
                                                <span className="badge badge-blue">{p.category?.mainCategory || "—"}</span>
                                                <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{p.category?.subCategory}</div>
                                            </td>
                                            <td><span className="badge badge-purple">{p.unit || "—"}</span></td>
                                            <td><span style={{ fontWeight: 700, fontSize: 15, color: isLow ? "#dc2626" : "#16a34a" }}>{p.quantity}</span></td>
                                            <td className="hide-mobile" style={{ color: "#94a3b8" }}>{p.minimumStock}</td>
                                            <td>{isLow ? <span className="badge badge-red"><i className="ti ti-alert-triangle" />ໃກ້ໝົດ</span> : <span className="badge badge-green"><i className="ti ti-check" />ປົກກະຕິ</span>}</td>
                                            {canEdit && (
                                                <td>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}><i className="ti ti-pencil" />ແກ້ໄຂ</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}><i className="ti ti-trash" />ລົບ</button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: "11px 16px", fontSize: 12.5, color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
                        ສະແດງ {filtered.length} ຈາກ {products.length} ລາຍການ
                    </div>
                </div>
            )}

            {/* Card view */}
            {!loading && viewMode === "card" && filtered.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 12 }}>
                    {filtered.map((p) => {
                        const isLow = p.quantity <= p.minimumStock;
                        return (
                            <div key={p._id} className="card" style={{ borderLeft: `4px solid ${isLow ? "#dc2626" : "#16a34a"}` }}>
                                <div style={{ padding: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <span className="badge badge-gray">{p.productCode}</span>
                                        {isLow ? <span className="badge badge-red"><i className="ti ti-alert-triangle" />ໃກ້ໝົດ</span> : <span className="badge badge-green"><i className="ti ti-check" />ປົກກະຕິ</span>}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 12 }}>{p.productName}</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                        {[
                                            { label: "ໝວດໝູ່", val: <span className="badge badge-blue" style={{ fontSize: 12 }}>{p.category?.mainCategory || "—"}</span> },
                                            { label: "ໜ່ວຍ", val: <span className="badge badge-purple" style={{ fontSize: 12 }}>{p.unit || "ອັນ"}</span> },
                                            { label: "ຄົງເຫຼືອ", val: <span style={{ fontSize: 20, fontWeight: 700, color: isLow ? "#dc2626" : "#16a34a" }}>{p.quantity}</span> },
                                            { label: "ຂັ້ນຕ່ຳ", val: <span style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>{p.minimumStock}</span> },
                                        ].map(({ label, val }) => (
                                            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                <span style={{ fontSize: 10.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
                                                {val}
                                            </div>
                                        ))}
                                    </div>
                                    {canEdit && (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="btn btn-outline-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleEdit(p)}><i className="ti ti-pencil" />ແກ້ໄຂ</button>
                                            <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(p._id)}><i className="ti ti-trash" />ລົບ</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}