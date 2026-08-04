import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";

export default function StockPage() {
    const [products, setProducts] = useState([]);
    const [groupedCats, setGroupedCats] = useState({});
    const [search, setSearch] = useState("");
    const [filterMain, setFilterMain] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table");

    const fetchProducts = async () => { try { const r = await axios.get("/products"); setProducts(r.data); } catch { setError("ໂຫລດບໍ່ສຳເລັດ"); } finally { setLoading(false); } };
    const fetchCats = async () => { const r = await axios.get("/categories/grouped"); setGroupedCats(r.data); };
    useEffect(() => { fetchProducts(); fetchCats(); if (window.innerWidth < 768) setViewMode("card"); }, []);

    const handleSearch = async () => {
        if (!search.trim()) return fetchProducts();
        try { const r = await axios.get(`/products/search?query=${search}`); setProducts(r.data); }
        catch { setProducts([]); }
    };

    const filtered = products.filter((p) => {
        const mc = filterMain ? p.category?.mainCategory === filterMain : true;
        const ms = filterStatus === "low" ? p.quantity <= p.minimumStock : filterStatus === "normal" ? p.quantity > p.minimumStock : true;
        return mc && ms;
    });

    const total = products.length;
    const lowCount = products.filter((p) => p.quantity <= p.minimumStock).length;
    const normCount = total - lowCount;
    const totalQty = products.reduce((s, p) => s + p.quantity, 0);

    return (
        <Layout title="ສະຕ໋ອກ">
            <div className="page-header">
                <div>
                    <h2 className="page-title">ສະຕ໋ອກສິນຄ້າ</h2>
                    <p className="page-sub">ກວດສອບສິນຄ້າໃນຄັງ</p>
                </div>
                <div className="page-actions">
                    <div className="view-toggle">
                        <button className={`toggle-btn${viewMode === "table" ? " active" : ""}`} onClick={() => setViewMode("table")}><i className="ti ti-table" />ຕາຕະລາງ</button>
                        <button className={`toggle-btn${viewMode === "card" ? " active" : ""}`} onClick={() => setViewMode("card")}><i className="ti ti-layout-grid" />ບ໋ອກ</button>
                    </div>
                    <button className="btn btn-ghost" onClick={fetchProducts}><i className="ti ti-refresh" />Refresh</button>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 18 }}>
                {[
                    { icon: "ti-package", num: total, label: "ທັງໝົດ", color: "#2563eb", bg: "#eff6ff", filter: "" },
                    { icon: "ti-alert-triangle", num: lowCount, label: "ໃກ້ໝົດ", color: "#dc2626", bg: "#fef2f2", filter: "low" },
                    { icon: "ti-circle-check", num: normCount, label: "ປົກກະຕິ", color: "#16a34a", bg: "#f0fdf4", filter: "normal" },
                    { icon: "ti-stack", num: totalQty.toLocaleString(), label: "ຈຳນວນລວມ", color: "#d97706", bg: "#fffbeb", filter: null },
                ].map((s) => (
                    <div key={s.label} className="stat-card"
                        style={{ borderTop: `3px solid ${s.color}`, cursor: s.filter !== null ? "pointer" : "default", outline: filterStatus === s.filter && s.filter !== null ? `2px solid ${s.color}` : "none" }}
                        onClick={() => s.filter !== null && setFilterStatus(s.filter)}>
                        <div className="stat-card-top">
                            <div className="stat-icon-box" style={{ background: s.bg, color: s.color }}>
                                <i className={`ti ${s.icon}`} aria-hidden="true" />
                            </div>
                        </div>
                        <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ padding: "13px 18px" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <div className="form-input-icon-wrap" style={{ flex: 1, minWidth: 180 }}>
                            <i className="ti ti-search" />
                            <input className="form-input" placeholder="ຄົ້ນຫາລະຫັດ ຫຼື ຊື່ສິນຄ້າ..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                        </div>
                        <select className="form-input" style={{ width: 155 }} value={filterMain} onChange={(e) => setFilterMain(e.target.value)}>
                            <option value="">ທຸກໝວດໝູ່</option>
                            {Object.keys(groupedCats).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="form-input" style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">ທຸກສະຖານະ</option>
                            <option value="low">ໃກ້ໝົດ</option>
                            <option value="normal">ປົກກະຕິ</option>
                        </select>
                        <button className="btn btn-primary" onClick={handleSearch}><i className="ti ti-search" />ຄົ້ນຫາ</button>
                        <button className="btn btn-ghost" onClick={() => { setSearch(""); setFilterMain(""); setFilterStatus(""); fetchProducts(); }}><i className="ti ti-x" />Reset</button>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
            {loading && <div style={{ display: "flex", gap: 8, padding: "48px", justifyContent: "center", color: "#94a3b8" }}><i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...</div>}
            {!loading && filtered.length === 0 && <div className="card"><div className="empty-state"><div className="empty-state-icon"><i className="ti ti-search" /></div><p className="empty-state-text">ບໍ່ພົບສິນຄ້າ</p></div></div>}

            {!loading && viewMode === "table" && filtered.length > 0 && (
                <div className="card">
                    <div className="table-wrap">
                        <table className="table">
                            <thead><tr><th>ລະຫັດ</th><th>ຊື່ສິນຄ້າ</th><th className="hide-mobile">ໝວດໝູ່</th><th>ໜ່ວຍ</th><th>ຄົງເຫຼືອ</th><th className="hide-mobile">ຂັ້ນຕ່ຳ</th><th>ສະຖານະ</th></tr></thead>
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
                                            <td><span className="badge badge-purple">{p.unit || "ອັນ"}</span></td>
                                            <td><span style={{ fontWeight: 700, fontSize: 15, color: isLow ? "#dc2626" : "#16a34a" }}>{p.quantity}</span></td>
                                            <td className="hide-mobile" style={{ color: "#94a3b8" }}>{p.minimumStock}</td>
                                            <td>{isLow ? <span className="badge badge-red"><i className="ti ti-alert-triangle" />ໃກ້ໝົດ</span> : <span className="badge badge-green"><i className="ti ti-check" />ປົກກະຕິ</span>}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: "11px 16px", fontSize: 12.5, color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>ສະແດງ {filtered.length} ຈາກ {products.length} ລາຍການ</div>
                </div>
            )}

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
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}