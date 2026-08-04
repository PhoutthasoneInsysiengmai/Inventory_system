import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [groupedCats, setGroupedCats] = useState({});
    const [error, setError] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [cart, setCart] = useState([]);
    const [searchProduct, setSearchProduct] = useState("");
    const [filterMain, setFilterMain] = useState("");
    const [expandedBranch, setExpandedBranch] = useState(null);
    const [activeTab, setActiveTab] = useState("order");
    const canManage = ["owner", "employee"].includes(user?.role);

    const fetchOrders = async () => { try { const r = await axios.get("/orders"); setOrders(r.data); } catch { setError("ໂຫລດບໍ່ສຳເລັດ"); } };
    const fetchMyOrders = async () => { try { const r = await axios.get("/orders/my-orders"); setMyOrders(r.data); } catch { } };
    const fetchProducts = async () => { const r = await axios.get("/products"); setProducts(r.data); };
    const fetchBranches = async () => { const r = await axios.get("/branches"); setBranches(r.data); };
    const fetchCats = async () => { const r = await axios.get("/categories/grouped"); setGroupedCats(r.data); };

    useEffect(() => {
        if (canManage) { fetchOrders(); fetchBranches(); }
        if (user?.role === "branch") { fetchProducts(); fetchBranches(); fetchMyOrders(); fetchCats(); }
    }, []);

    const filteredProducts = products.filter((p) => {
        const ms = searchProduct ? p.productCode.toLowerCase().includes(searchProduct.toLowerCase()) || p.productName.toLowerCase().includes(searchProduct.toLowerCase()) : true;
        const mc = filterMain ? p.category?.mainCategory === filterMain : true;
        return ms && mc;
    });

    const addToCart = (product) => {
        const ex = cart.find((c) => c.product_id === product._id);
        if (ex) {
            if (ex.quantity >= product.quantity) return alert(`ຄົງເຫຼືອ ${product.quantity} ${product.unit || "ອັນ"}`);
            setCart(cart.map((c) => c.product_id === product._id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            if (product.quantity === 0) return alert("ສິນຄ້າໝົດ");
            setCart([...cart, { product_id: product._id, productName: product.productName, productCode: product.productCode, unit: product.unit || "ອັນ", maxQty: product.quantity, quantity: 1 }]);
        }
    };
    const updateQty = (id, qty) => {
        const item = cart.find((c) => c.product_id === id);
        if (qty < 1) return;
        if (qty > item.maxQty) return alert(`ຄົງເຫຼືອ ${item.maxQty}`);
        setCart(cart.map((c) => c.product_id === id ? { ...c, quantity: qty } : c));
    };
    const removeFromCart = (id) => setCart(cart.filter((c) => c.product_id !== id));

    const handleCreateOrder = async () => {
        try {
            if (!selectedBranch) return setError("ກະລຸນາເລືອກສາຂາ");
            if (cart.length === 0) return setError("ກະລຸນາເລືອກສິນຄ້າ");
            await axios.post("/orders", { branch: selectedBranch, items: cart.map((c) => ({ product_id: c.product_id, productName: c.productName, quantity: c.quantity })) });
            setCart([]); setSelectedBranch(""); setSearchProduct(""); setFilterMain(""); setError("");
            fetchMyOrders(); fetchProducts();
            alert("ສັ່ງຂອງສຳເລັດ!");
        } catch (err) { setError(err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"); }
    };
    const handleCancel = async (id) => { if (!window.confirm("ຢືນຢັນຍົກເລີກ?")) return; try { await axios.delete(`/orders/${id}`); fetchOrders(); } catch { setError("ຍົກເລີກບໍ່ສຳເລັດ"); } };
    const handleUpdateStatus = async (id, status) => { try { await axios.put(`/orders/${id}/status`, { status }); fetchOrders(); } catch { setError("ອັບເດດບໍ່ສຳເລັດ"); } };

    const statusInfo = {
        pending: { text: "ຖ້າດຳເນີນການ", cls: "badge-yellow", icon: "ti-clock" },
        processing: { text: "ກຳລັງຈັດ", cls: "badge-blue", icon: "ti-loader-2" },
        shipped: { text: "ຈັດສົ່ງ", cls: "badge-purple", icon: "ti-truck" },
        delivered: { text: "ສົ່ງຮອດ", cls: "badge-green", icon: "ti-circle-check" },
    };

    const groupByBranch = () => {
        const g = {};
        orders.forEach((o) => {
            const id = o.branch?._id || "unknown";
            if (!g[id]) g[id] = { name: o.branch?.branchName || "ບໍ່ລະບຸ", orders: [] };
            g[id].orders.push(o);
        });
        return g;
    };
    const grouped = groupByBranch();
    const totalCartQty = cart.reduce((s, c) => s + c.quantity, 0);

    return (
        <Layout title="ຄຳສັ່ງຊື້">
            {/* ── Branch role ── */}
            {user?.role === "branch" && (
                <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        {[
                            { key: "order", label: "ສັ່ງສິນຄ້າ", icon: "ti-shopping-cart" },
                            { key: "history", label: "ປະຫວັດ", icon: "ti-history" },
                        ].map((t) => (
                            <button key={t.key}
                                className={`btn ${activeTab === t.key ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => { setActiveTab(t.key); if (t.key === "history") fetchMyOrders(); }}
                                style={{ position: "relative" }}>
                                <i className={`ti ${t.icon}`} />{t.label}
                                {t.key === "order" && cart.length > 0 && (
                                    <span style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{totalCartQty}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === "order" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
                            {/* Product list */}
                            <div className="card" style={{ padding: 20 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#0f172a" }}>ເລືອກສິນຄ້າ</h3>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                    <div className="form-input-icon-wrap" style={{ flex: 1 }}>
                                        <i className="ti ti-search" />
                                        <input className="form-input" placeholder="ຄົ້ນຫາ..." value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} />
                                    </div>
                                    <select className="form-input" style={{ width: 155 }} value={filterMain} onChange={(e) => setFilterMain(e.target.value)}>
                                        <option value="">ທຸກໝວດໝູ່</option>
                                        {Object.keys(groupedCats).map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
                                    {filteredProducts.map((p) => {
                                        const inCart = cart.find((c) => c.product_id === p._id);
                                        const isOut = p.quantity === 0;
                                        return (
                                            <div key={p._id}
                                                style={{ border: `2px solid ${inCart ? "#2563eb" : "#e2e8f0"}`, borderRadius: 10, padding: 12, background: inCart ? "#eff6ff" : "#fff", cursor: isOut ? "not-allowed" : "pointer", opacity: isOut ? 0.5 : 1, transition: "all 0.15s" }}
                                                onClick={() => !isOut && addToCart(p)}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{p.productCode}</span>
                                                    {inCart && <span className="badge badge-blue" style={{ fontSize: 11 }}><i className="ti ti-check" />{inCart.quantity}</span>}
                                                </div>
                                                <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", marginBottom: 8, lineHeight: 1.4 }}>{p.productName}</p>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span className="badge badge-purple" style={{ fontSize: 11 }}>{p.unit || "ອັນ"}</span>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: p.quantity <= p.minimumStock ? "#dc2626" : "#16a34a" }}>{p.quantity}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredProducts.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#94a3b8", padding: 32 }}>ບໍ່ພົບສິນຄ້າ</p>}
                                </div>
                            </div>

                            {/* Cart */}
                            <div className="card" style={{ padding: 20, position: "sticky", top: 72, alignSelf: "start" }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 7 }}>
                                    <i className="ti ti-shopping-cart" style={{ fontSize: 18 }} />ກະຕ່າ
                                </h3>
                                <div className="form-field">
                                    <label className="form-label">ເລືອກສາຂາ</label>
                                    <select className="form-input" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                                        <option value="">-- ເລືອກສາຂາ --</option>
                                        {branches.map((b) => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                                    </select>
                                </div>
                                {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                                {cart.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "24px 16px", background: "#f8fafc", borderRadius: 10, color: "#94a3b8" }}>
                                        <i className="ti ti-shopping-cart" style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 8, display: "block" }} />
                                        <p style={{ fontWeight: 500, color: "#475569" }}>ກະຕ່າວ່າງ</p>
                                        <p style={{ fontSize: 12 }}>ກົດເລືອກສິນຄ້າດ້ານຊ້າຍ</p>
                                    </div>
                                ) : (
                                    <>
                                        {cart.map((item) => (
                                            <div key={item.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.productCode}</div>
                                                    <div style={{ fontWeight: 500, fontSize: 13, color: "#0f172a" }}>{item.productName}</div>
                                                    <span className="badge badge-purple" style={{ fontSize: 11, marginTop: 2 }}>{item.unit}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
                                                    <button style={{ width: 26, height: 26, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                                                    <span style={{ width: 28, textAlign: "center", fontWeight: 600, fontSize: 14 }}>{item.quantity}</span>
                                                    <button style={{ width: 26, height: 26, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                                                    <button style={{ width: 26, height: 26, border: "none", borderRadius: 6, background: "#fee2e2", color: "#dc2626", cursor: "pointer", marginLeft: 4, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => removeFromCart(item.product_id)}>
                                                        <i className="ti ti-x" style={{ fontSize: 13 }} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ padding: "10px 0", fontSize: 13, color: "#64748b", borderTop: "1px solid #f1f5f9", marginTop: 8, fontWeight: 500 }}>
                                            {cart.length} ລາຍການ · {totalCartQty} ໜ່ວຍ
                                        </div>
                                        <button className="btn btn-success" style={{ width: "100%", marginTop: 12, justifyContent: "center" }} onClick={handleCreateOrder}>
                                            <i className="ti ti-check" />ຢືນຢັນສັ່ງຂອງ
                                        </button>
                                        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 6, justifyContent: "center" }} onClick={() => setCart([])}>
                                            <i className="ti ti-trash" />ລ້າງກະຕ່າ
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div>
                            <div className="page-header"><h2 className="page-title">ປະຫວັດການສັ່ງຊື້</h2></div>
                            {myOrders.length === 0 ? (
                                <div className="card"><div className="empty-state"><div className="empty-state-icon"><i className="ti ti-history" /></div><p className="empty-state-text">ຍັງບໍ່ມີປະຫວັດ</p></div></div>
                            ) : myOrders.map((order) => (
                                <div key={order._id} className="card" style={{ marginBottom: 12 }}>
                                    <div className="card-header">
                                        <div>
                                            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><i className="ti ti-building-store" style={{ fontSize: 16, color: "#94a3b8" }} />{order.branch?.branchName || "—"}</div>
                                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{new Date(order.createdAt).toLocaleString("th-TH")}</div>
                                        </div>
                                        <span className={`badge ${statusInfo[order.status]?.cls}`}><i className={`ti ${statusInfo[order.status]?.icon}`} />{statusInfo[order.status]?.text}</span>
                                    </div>
                                    <div className="table-wrap">
                                        <table className="table">
                                            <thead><tr><th>ລະຫັດ</th><th>ຊື່ສິນຄ້າ</th><th className="hide-mobile">ໜ່ວຍ</th><th>ຈຳນວນ</th></tr></thead>
                                            <tbody>
                                                {order.items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{item.product_id?.productCode || "—"}</span></td>
                                                        <td style={{ fontWeight: 500, color: "#0f172a" }}>{item.productName}</td>
                                                        <td className="hide-mobile"><span className="badge badge-purple" style={{ fontSize: 12 }}>{item.product_id?.unit || "—"}</span></td>
                                                        <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Owner / Employee ── */}
            {canManage && (
                <>
                    <div className="page-header">
                        <div>
                            <h2 className="page-title">ຄຳສັ່ງຊື້ທັງໝົດ</h2>
                            <p className="page-sub">{orders.length} ຄຳສັ່ງຊື້</p>
                        </div>
                    </div>
                    {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}
                    {orders.length === 0 && <div className="card"><div className="empty-state"><div className="empty-state-icon"><i className="ti ti-shopping-cart" /></div><p className="empty-state-text">ຍັງບໍ່ມີຄຳສັ່ງຊື້</p></div></div>}

                    {Object.entries(grouped).map(([branchId, { name, orders: bo }]) => (
                        <div key={branchId} className="card" style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", userSelect: "none", flexWrap: "wrap", gap: 8 }}
                                onClick={() => setExpandedBranch(expandedBranch === branchId ? null : branchId)}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 38, height: 38, background: "#f1f5f9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <i className="ti ti-building-store" style={{ fontSize: 18, color: "#64748b" }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{name}</div>
                                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{bo.length} ຄຳສັ່ງຊື້</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                        {Object.entries(bo.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})).map(([status, count]) => (
                                            <span key={status} className={`badge ${statusInfo[status]?.cls}`}>{statusInfo[status]?.text} {count}</span>
                                        ))}
                                    </div>
                                    <i className={`ti ${expandedBranch === branchId ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ color: "#94a3b8", fontSize: 16 }} />
                                </div>
                            </div>

                            {expandedBranch === branchId && (
                                <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #f1f5f9" }}>
                                    {bo.map((order) => (
                                        <div key={order._id} style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #f1f5f9", marginBottom: 10 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                        <i className="ti ti-user" style={{ fontSize: 14, color: "#94a3b8" }} />{order.orderedBy?.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(order.createdAt).toLocaleString("th-TH")}</div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                    <span className={`badge ${statusInfo[order.status]?.cls}`}><i className={`ti ${statusInfo[order.status]?.icon}`} />{statusInfo[order.status]?.text}</span>
                                                    <select className="form-input" style={{ padding: "4px 8px", fontSize: 12, width: "auto" }} value={order.status} onChange={(e) => handleUpdateStatus(order._id, e.target.value)}>
                                                        <option value="pending">ຖ້າດຳເນີນການ</option>
                                                        <option value="processing">ກຳລັງຈັດຂອງ</option>
                                                        <option value="shipped">ຈັດສົ່ງແລ້ວ</option>
                                                        <option value="delivered">ສົ່ງຮອດແລ້ວ</option>
                                                    </select>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleCancel(order._id)}><i className="ti ti-x" />ຍົກເລີກ</button>
                                                </div>
                                            </div>
                                            <div className="table-wrap">
                                                <table className="table">
                                                    <thead><tr><th>ລະຫັດ</th><th>ຊື່ສິນຄ້າ</th><th className="hide-mobile">ໝວດໝູ່</th><th className="hide-mobile">ໜ່ວຍ</th><th>ຈຳນວນ</th></tr></thead>
                                                    <tbody>
                                                        {order.items.map((item, i) => (
                                                            <tr key={i}>
                                                                <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{item.product_id?.productCode || "—"}</span></td>
                                                                <td style={{ fontWeight: 500, color: "#0f172a" }}>{item.productName}</td>
                                                                <td className="hide-mobile"><span className="badge badge-blue" style={{ fontSize: 12 }}>{item.product_id?.category?.mainCategory || "—"}</span></td>
                                                                <td className="hide-mobile"><span className="badge badge-purple" style={{ fontSize: 12 }}>{item.product_id?.unit || "—"}</span></td>
                                                                <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </Layout>
    );
}