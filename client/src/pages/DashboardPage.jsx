import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ products: 0, lowStock: 0, orders: 0, branches: 0 });
    const [lowStockItems, setLowStockItems] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const canManage = ["owner", "employee"].includes(user?.role);

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, lRes] = await Promise.all([axios.get("/products"), axios.get("/products/low-stock")]);
                setStats((p) => ({ ...p, products: pRes.data.length, lowStock: lRes.data.length }));
                setLowStockItems(lRes.data.slice(0, 5));
                if (canManage) {
                    const [oRes, bRes] = await Promise.all([axios.get("/orders"), axios.get("/branches")]);
                    setStats((p) => ({ ...p, orders: oRes.data.length, branches: bRes.data.length }));
                    setRecentOrders(oRes.data.slice(0, 5));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const statusLabel = {
        pending: { text: "ຖ້າ", cls: "badge-yellow" },
        processing: { text: "ກຳລັງຈັດ", cls: "badge-blue" },
        shipped: { text: "ຈັດສົ່ງ", cls: "badge-purple" },
        delivered: { text: "ສົ່ງຮອດ", cls: "badge-green" },
    };

    const quickLinks = [
        { path: "/products", label: "ສິນຄ້າ", icon: "ti-package", color: "#eff6ff", border: "#bfdbfe", roles: ["owner", "employee"] },
        { path: "/lots", label: "ລ໋ອດສິນຄ້າ", icon: "ti-calendar-event", color: "#f0fdf4", border: "#bbf7d0", roles: ["owner", "employee"] },
        { path: "/orders", label: "ຄຳສັ່ງຊື້", icon: "ti-shopping-cart", color: "#fffbeb", border: "#fde68a", roles: ["owner", "employee"] },
        { path: "/orders", label: "ສັ່ງສິນຄ້າ", icon: "ti-shopping-cart", color: "#fffbeb", border: "#fde68a", roles: ["branch"] },
        { path: "/stock", label: "ສະຕ໋ອກ", icon: "ti-building-warehouse", color: "#f5f3ff", border: "#ddd6fe", roles: ["owner", "employee", "branch"] },
        { path: "/categories", label: "ໝວດໝູ່", icon: "ti-tags", color: "#fff1f2", border: "#fecdd3", roles: ["owner", "employee"] },
        { path: "/reports", label: "ລາຍງານ", icon: "ti-chart-bar", color: "#fff7ed", border: "#fed7aa", roles: ["owner", "employee"] },
        { path: "/branches", label: "ສາຂາ", icon: "ti-building-store", color: "#f0f9ff", border: "#bae6fd", roles: ["owner"] },
        { path: "/users", label: "ຜູ້ໃຊ້", icon: "ti-users", color: "#f8fafc", border: "#e2e8f0", roles: ["owner"] },
    ].filter((i) => i.roles.includes(user?.role));

    const roleIcon = { owner: "ti-crown", employee: "ti-id-badge", branch: "ti-building-store" };
    const roleText = { owner: "ເຈົ້າຂອງບໍລິສັດ", employee: "ພະນັກງານ", branch: "ສາຂາ" };

    const statCards = [
        { icon: "ti-package", num: stats.products, label: "ສິນຄ້າທັງໝົດ", color: "#2563eb", bg: "#eff6ff", show: true },
        { icon: "ti-alert-triangle", num: stats.lowStock, label: "ສິນຄ້າໃກ້ໝົດ", color: "#dc2626", bg: "#fef2f2", show: true },
        { icon: "ti-shopping-cart", num: stats.orders, label: "ຄຳສັ່ງຊື້", color: "#16a34a", bg: "#f0fdf4", show: canManage },
        { icon: "ti-building-store", num: stats.branches, label: "ສາຂາ", color: "#d97706", bg: "#fffbeb", show: canManage },
    ].filter((s) => s.show);

    if (loading) return (
        <Layout title="Dashboard">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px", gap: 10, color: "#94a3b8" }}>
                <i className="ti ti-loader-2" style={{ fontSize: 22 }} />
                ກຳລັງໂຫລດ...
            </div>
        </Layout>
    );

    return (
        <Layout title="Dashboard">
            {/* Welcome */}
            <div className="welcome-bar">
                <div className="welcome-left">
                    <div className="welcome-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                        <div className="welcome-title">ສະບາຍດີ, {user?.name}</div>
                        <div className="welcome-sub">
                            {new Date().toLocaleDateString("lo-LA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </div>
                    </div>
                </div>
                <div className="welcome-role-pill">
                    <i className={`ti ${roleIcon[user?.role]}`} aria-hidden="true" />
                    {roleText[user?.role]}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((s) => (
                    <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
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

            {/* Quick links */}
            <div style={{ marginBottom: 20 }}>
                <div className="section-title">
                    <i className="ti ti-bolt" aria-hidden="true" />
                    ເມນູລັດ
                </div>
                <div style={S.quickGrid}>
                    {quickLinks.map((item) => (
                        <button
                            key={item.path + item.label}
                            style={{ ...S.quickCard, background: item.color, borderColor: item.border }}
                            onClick={() => navigate(item.path)}
                        >
                            <i className={`ti ${item.icon}`} style={{ fontSize: 22, color: "#475569" }} aria-hidden="true" />
                            <span style={S.quickLabel}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tables */}
            <div style={S.twoCol} className="two-col">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">
                            <i className="ti ti-alert-triangle" aria-hidden="true" />
                            ສິນຄ້າໃກ້ໝົດ
                        </span>
                        <button className="btn btn-sm btn-ghost" onClick={() => navigate("/stock")}>
                            <i className="ti ti-arrow-right" />ເບິ່ງທັງໝົດ
                        </button>
                    </div>
                    <div className="table-wrap">
                        {lowStockItems.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon"><i className="ti ti-circle-check" /></div>
                                <p className="empty-state-text">ບໍ່ມີສິນຄ້າໃກ້ໝົດ</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead><tr><th>ສິນຄ້າ</th><th>ຄົງເຫຼືອ</th><th>ຂັ້ນຕ່ຳ</th></tr></thead>
                                <tbody>
                                    {lowStockItems.map((p) => (
                                        <tr key={p._id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{p.productName}</div>
                                                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{p.productCode}</div>
                                            </td>
                                            <td><span className="badge badge-red">{p.quantity}</span></td>
                                            <td style={{ color: "#94a3b8" }}>{p.minimumStock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {canManage && (
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">
                                <i className="ti ti-shopping-cart" aria-hidden="true" />
                                ຄຳສັ່ງຊື້ລ່າສຸດ
                            </span>
                            <button className="btn btn-sm btn-ghost" onClick={() => navigate("/orders")}>
                                <i className="ti ti-arrow-right" />ເບິ່ງທັງໝົດ
                            </button>
                        </div>
                        <div className="table-wrap">
                            {recentOrders.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon"><i className="ti ti-shopping-cart" /></div>
                                    <p className="empty-state-text">ຍັງບໍ່ມີຄຳສັ່ງຊື້</p>
                                </div>
                            ) : (
                                <table className="table">
                                    <thead><tr><th>ສາຂາ</th><th>ລາຍການ</th><th>ສະຖານະ</th></tr></thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td style={{ fontWeight: 600, color: "#0f172a" }}>{order.branch?.branchName || "—"}</td>
                                                <td style={{ color: "#64748b" }}>{order.items.length} ລາຍການ</td>
                                                <td><span className={`badge ${statusLabel[order.status]?.cls}`}>{statusLabel[order.status]?.text}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

const S = {
    quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 },
    quickCard: {
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        padding: "16px 8px", border: "1.5px solid", borderRadius: 10,
        cursor: "pointer", fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s",
        background: "transparent",
    },
    quickLabel: { fontSize: 12.5, fontWeight: 500, color: "#334155", textAlign: "center" },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
};