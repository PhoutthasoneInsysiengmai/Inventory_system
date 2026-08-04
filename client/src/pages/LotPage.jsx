import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";

const emptyForm = { product: "", lotNumber: "", quantity: "", receivedDate: new Date().toISOString().split("T")[0], expiryDate: "", note: "" };

export default function LotPage() {
    const [lots, setLots] = useState([]);
    const [products, setProducts] = useState([]);
    const [expiring, setExpiring] = useState({ day3: [], day7: [], day15: [] });
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [filterProduct, setFilterProduct] = useState("");
    const [groupByProduct, setGroupByProduct] = useState(false);

    const fetchLots = async () => { try { const r = await axios.get("/lots"); setLots(r.data); } catch { } finally { setLoading(false); } };
    const fetchExpiring = async () => { try { const r = await axios.get("/lots/expiring"); setExpiring(r.data); } catch { } };
    const fetchProducts = async () => { try { const r = await axios.get("/products"); setProducts(r.data); } catch { } };
    useEffect(() => { fetchLots(); fetchExpiring(); fetchProducts(); }, []);

    const handleSubmit = async () => {
        try {
            if (!form.product || !form.lotNumber || !form.quantity || !form.expiryDate) return setError("ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ");
            if (editId) { await axios.put(`/lots/${editId}`, form); }
            else { await axios.post("/lots", form); }
            setForm(emptyForm); setEditId(null); setShowForm(false); setError("");
            fetchLots(); fetchExpiring(); fetchProducts();
        } catch (err) { setError(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleEdit = (lot) => {
        setForm({ product: lot.product?._id || "", lotNumber: lot.lotNumber, quantity: lot.quantity, receivedDate: new Date(lot.receivedDate).toISOString().split("T")[0], expiryDate: new Date(lot.expiryDate).toISOString().split("T")[0], note: lot.note || "" });
        setEditId(lot._id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleDelete = async (id) => {
        if (!window.confirm("ຢືນຢັນລົບ Lot?")) return;
        try { await axios.delete(`/lots/${id}`); fetchLots(); fetchProducts(); fetchExpiring(); }
        catch (err) { setError(err.response?.data?.message || "ລົບບໍ່ສຳເລັດ"); }
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString("lo-LA", { day: "numeric", month: "short", year: "numeric" });
    const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
    const dayColor = (n) => n < 0 ? "#94a3b8" : n <= 3 ? "#dc2626" : n <= 7 ? "#d97706" : n <= 15 ? "#2563eb" : "#16a34a";
    const dayBg = (n) => n < 0 ? "#f1f5f9" : n <= 3 ? "#fef2f2" : n <= 7 ? "#fffbeb" : n <= 15 ? "#eff6ff" : "#f0fdf4";

    const getSource = () => activeTab === "day3" ? expiring.day3 : activeTab === "day7" ? expiring.day7 : activeTab === "day15" ? expiring.day15 : lots;
    const filteredLots = getSource().filter((lot) => {
        const ms = search ? lot.product?.productName?.toLowerCase().includes(search.toLowerCase()) || lot.lotNumber?.toLowerCase().includes(search.toLowerCase()) : true;
        const mp = filterProduct ? lot.product?._id === filterProduct : true;
        return ms && mp;
    });
    const grouped = filteredLots.reduce((acc, lot) => {
        const key = lot.product?._id || "unknown";
        if (!acc[key]) acc[key] = { name: lot.product?.productName || "—", code: lot.product?.productCode || "—", unit: lot.product?.unit || "ອັນ", lots: [] };
        acc[key].lots.push(lot); return acc;
    }, {});
    const totalExpiring = expiring.day3.length + expiring.day7.length + expiring.day15.length;

    const LotRow = ({ lot }) => {
        const d = daysLeft(lot.expiryDate);
        return (
            <tr style={d <= 3 && d >= 0 ? { background: "#fff8f8" } : {}}>
                <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{lot.lotNumber}</span></td>
                {!groupByProduct && (
                    <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{lot.product?.productName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{lot.product?.productCode}</div>
                    </td>
                )}
                <td style={{ color: "#64748b", fontSize: 13 }}>{fmtDate(lot.receivedDate)}</td>
                <td style={{ color: dayColor(d), fontWeight: 500, fontSize: 13 }}>{fmtDate(lot.expiryDate)}</td>
                <td>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: dayBg(d), color: dayColor(d) }}>
                        {d < 0 ? "ໝົດແລ້ວ" : `ອີກ ${d} ມື້`}
                    </span>
                </td>
                <td>
                    <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 15 }}>{lot.quantity}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 3 }}>{lot.product?.unit || "ອັນ"}</span>
                </td>
                <td style={{ color: "#64748b", fontSize: 12 }}>{lot.note || "—"}</td>
                <td>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(lot)}><i className="ti ti-pencil" />ແກ້ໄຂ</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lot._id)}><i className="ti ti-trash" />ລົບ</button>
                    </div>
                </td>
            </tr>
        );
    };

    /* Mobile lot card */
    const LotCard = ({ lot }) => {
        const d = daysLeft(lot.expiryDate);
        return (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 10, borderLeft: `4px solid ${dayColor(d)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                        {!groupByProduct && <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0f172a" }}>{lot.product?.productName}</div>}
                        <span className="badge badge-gray" style={{ fontSize: 11, marginTop: groupByProduct ? 0 : 4 }}>{lot.lotNumber}</span>
                    </div>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: dayBg(d), color: dayColor(d) }}>
                        {d < 0 ? "ໝົດແລ້ວ" : `ອີກ ${d} ມື້`}
                    </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[
                        { label: "ຮັບເຂົ້າ", val: fmtDate(lot.receivedDate) },
                        { label: "ໝົດອາຍຸ", val: fmtDate(lot.expiryDate) },
                        { label: "ຈຳນວນ", val: <span style={{ fontWeight: 700, color: "#16a34a" }}>{lot.quantity} <span style={{ fontSize: 11, color: "#94a3b8" }}>{lot.product?.unit || "ອັນ"}</span></span> },
                        { label: "ໝາຍເຫດ", val: lot.note || "—" },
                    ].map(({ label, val }) => (
                        <div key={label}>
                            <div style={{ fontSize: 10.5, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 13, color: "#334155" }}>{val}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-sm btn-outline-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleEdit(lot)}><i className="ti ti-pencil" />ແກ້ໄຂ</button>
                    <button className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(lot._id)}><i className="ti ti-trash" />ລົບ</button>
                </div>
            </div>
        );
    };

    const THead = () => (
        <thead>
            <tr>
                <th>Lot</th>{!groupByProduct && <th>ສິນຄ້າ</th>}
                <th className="hide-mobile">ຮັບເຂົ້າ</th>
                <th>ໝົດອາຍຸ</th>
                <th>ເຫຼືອ</th>
                <th>ຈຳນວນ</th>
                <th className="hide-mobile">ໝາຍເຫດ</th>
                <th>ຈັດການ</th>
            </tr>
        </thead>
    );

    const tabs = [
        { key: "all", label: `ທັງໝົດ (${lots.length})`, color: "#2563eb" },
        { key: "day3", label: `≤ 3 ມື້ (${expiring.day3.length})`, color: "#dc2626" },
        { key: "day7", label: `≤ 7 ມື້ (${expiring.day7.length})`, color: "#d97706" },
        { key: "day15", label: `≤ 15 ມື້ (${expiring.day15.length})`, color: "#2563eb" },
    ];

    // detect mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <Layout title="ລ໋ອດສິນຄ້າ">
            <style>{`
                .lot-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 18px;
                }
                @media (max-width: 768px) {
                    .lot-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px;
                    }
                    .lot-table-wrap { display: none; }
                    .lot-card-wrap  { display: block !important; }
                }
                @media (min-width: 769px) {
                    .lot-card-wrap  { display: none; }
                    .lot-table-wrap { display: block; }
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h2 className="page-title">ຈັດການລ໋ອດສິນຄ້າ</h2>
                    <p className="page-sub">{lots.length} lot · <span style={{ color: "#dc2626", fontWeight: 600 }}>ໃກ້ໝົດ {totalExpiring} lot</span></p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); setError(""); }}>
                    <i className="ti ti-plus" />ເພີ່ມ Lot ໃໝ່
                </button>
            </div>

            {/* Stats — 2 cols on mobile */}
            <div className="lot-stats-grid">
                {[
                    { icon: "ti-package", num: lots.length, label: "Lot ທັງໝົດ", color: "#2563eb", bg: "#eff6ff", tab: "all" },
                    { icon: "ti-alert-triangle", num: expiring.day3.length, label: "ໝົດໃນ 3 ມື້", color: "#dc2626", bg: "#fef2f2", tab: "day3" },
                    { icon: "ti-clock", num: expiring.day7.length, label: "ໝົດໃນ 7 ມື້", color: "#d97706", bg: "#fffbeb", tab: "day7" },
                    { icon: "ti-calendar-event", num: expiring.day15.length, label: "ໝົດໃນ 15 ມື້", color: "#2563eb", bg: "#eff6ff", tab: "day15" },
                ].map((s) => (
                    <div key={s.label} className="stat-card"
                        style={{ borderTop: `3px solid ${s.color}`, cursor: "pointer" }}
                        onClick={() => { setActiveTab(s.tab); setSearch(""); setFilterProduct(""); }}>
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
                        <span className="card-title">
                            <i className={`ti ${editId ? "ti-pencil" : "ti-plus"}`} />
                            {editId ? "ແກ້ໄຂ Lot" : "ເພີ່ມ Lot ໃໝ່"}
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>
                            <i className="ti ti-x" />ປິດ
                        </button>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label className="form-label">ສິນຄ້າ *</label>
                                <select className="form-input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} disabled={!!editId}>
                                    <option value="">-- ເລືອກສິນຄ້າ --</option>
                                    {products.map((p) => <option key={p._id} value={p._id}>{p.productCode} — {p.productName}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">ໝາຍເລກ Lot *</label>
                                <input className="form-input" placeholder="ເຊັ່ນ LOT001" value={form.lotNumber} onChange={(e) => setForm({ ...form, lotNumber: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ຈຳນວນ *</label>
                                <input className="form-input" type="number" min="1" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ວັນທີຮັບເຂົ້າ</label>
                                <input className="form-input" type="date" value={form.receivedDate} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ວັນທີໝົດອາຍຸ *</label>
                                <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">ໝາຍເຫດ</label>
                                <input className="form-input" placeholder="ໝາຍເຫດ (ບໍ່ບັງຄັບ)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-success" onClick={handleSubmit}>
                                <i className={`ti ${editId ? "ti-device-floppy" : "ti-plus"}`} />{editId ? "ບັນທຶກ" : "ເພີ່ມ Lot"}
                            </button>
                            <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setError(""); }}>ຍົກເລີກ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <div className="form-input-icon-wrap" style={{ flex: 1, minWidth: 160 }}>
                            <i className="ti ti-search" />
                            <input className="form-input" placeholder="ຄົ້ນຫາ Lot..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <select className="form-input" style={{ minWidth: 160 }} value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}>
                            <option value="">ທຸກສິນຄ້າ</option>
                            {products.map((p) => <option key={p._id} value={p._id}>{p.productCode} — {p.productName}</option>)}
                        </select>
                        <button className="btn btn-ghost" onClick={() => { setSearch(""); setFilterProduct(""); }}>
                            <i className="ti ti-x" />Reset
                        </button>
                        <div className="view-toggle">
                            <button className={`toggle-btn${!groupByProduct ? " active" : ""}`} onClick={() => setGroupByProduct(false)}>
                                <i className="ti ti-list" />ລາຍການ
                            </button>
                            <button className={`toggle-btn${groupByProduct ? " active" : ""}`} onClick={() => setGroupByProduct(true)}>
                                <i className="ti ti-package" />ແຍກ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {tabs.map((t) => (
                    <button key={t.key}
                        style={{ padding: "7px 14px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: activeTab === t.key ? t.color : "#f1f5f9", color: activeTab === t.key ? "#fff" : "#475569" }}
                        onClick={() => setActiveTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div style={{ display: "flex", gap: 8, padding: "48px", justifyContent: "center", color: "#94a3b8" }}>
                    <i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...
                </div>
            )}
            {!loading && filteredLots.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><i className="ti ti-calendar-event" /></div>
                        <p className="empty-state-text">ບໍ່ພົບລາຍການ</p>
                    </div>
                </div>
            )}

            {/* ── List view ── */}
            {!loading && !groupByProduct && filteredLots.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="card lot-table-wrap">
                        <div className="table-wrap">
                            <table className="table"><THead /><tbody>{filteredLots.map((lot) => <LotRow key={lot._id} lot={lot} />)}</tbody></table>
                        </div>
                        <div style={{ padding: "11px 16px", fontSize: 12.5, color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
                            ສະແດງ {filteredLots.length} ຈາກ {getSource().length} ລາຍການ
                        </div>
                    </div>
                    {/* Mobile cards */}
                    <div className="lot-card-wrap">
                        {filteredLots.map((lot) => <LotCard key={lot._id} lot={lot} />)}
                    </div>
                </>
            )}

            {/* ── Grouped view ── */}
            {!loading && groupByProduct && filteredLots.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(grouped).map(([pid, grp]) => {
                        const totalQty = grp.lots.reduce((s, l) => s + l.quantity, 0);
                        const hasExpire = grp.lots.some((l) => daysLeft(l.expiryDate) <= 7);
                        return (
                            <div key={pid} className="card">
                                <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, background: hasExpire ? "#fff8f8" : "#f8fafc", borderRadius: "12px 12px 0 0" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: hasExpire ? "#fee2e2" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <i className="ti ti-package" style={{ fontSize: 20, color: hasExpire ? "#dc2626" : "#2563eb" }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{grp.name}</div>
                                            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                                                <span className="badge badge-gray" style={{ fontSize: 11 }}>{grp.code}</span>
                                                <span className="badge badge-purple" style={{ fontSize: 11 }}>{grp.unit}</span>
                                                <span className="badge badge-blue" style={{ fontSize: 11 }}>{grp.lots.length} lot</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a" }}>{totalQty}</div>
                                        <div style={{ fontSize: 12, color: "#94a3b8" }}>ຄົງເຫຼືອລວມ</div>
                                    </div>
                                </div>
                                {/* Desktop table */}
                                <div className="lot-table-wrap">
                                    <div className="table-wrap">
                                        <table className="table"><THead /><tbody>{grp.lots.map((lot) => <LotRow key={lot._id} lot={lot} />)}</tbody></table>
                                    </div>
                                </div>
                                {/* Mobile cards */}
                                <div className="lot-card-wrap" style={{ padding: "10px 14px" }}>
                                    {grp.lots.map((lot) => <LotCard key={lot._id} lot={lot} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}