/* Layout.jsx — Sidebar wrapper ทุกหน้าใช้ component นี้ */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, title }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); };
    const closeSidebar = () => setSidebarOpen(false);

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: "ti-layout-dashboard", section: "ຫຼັກ", roles: ["owner", "employee", "branch"] },
        { path: "/products", label: "ສິນຄ້າ", icon: "ti-package", section: "ຫຼັກ", roles: ["owner", "employee", "branch"] },
        { path: "/lots", label: "ລ໋ອດສິນຄ້າ", icon: "ti-calendar-event", section: "ຫຼັກ", roles: ["owner", "employee"] },
        { path: "/stock", label: "ສະຕ໋ອກ", icon: "ti-building-warehouse", section: "ຫຼັກ", roles: ["owner", "employee", "branch"] },
        { path: "/orders", label: "ຄຳສັ່ງຊື້", icon: "ti-shopping-cart", section: "ຈັດການ", roles: ["owner", "employee", "branch"] },
        { path: "/categories", label: "ໝວດໝູ່", icon: "ti-tags", section: "ຈັດການ", roles: ["owner", "employee"] },
        { path: "/reports", label: "ລາຍງານ", icon: "ti-chart-bar", section: "ຈັດການ", roles: ["owner", "employee"] },
        { path: "/branches", label: "ສາຂາ", icon: "ti-building-store", section: "ລະບົບ", roles: ["owner"] },
        { path: "/users", label: "ຜູ້ໃຊ້", icon: "ti-users", section: "ລະບົບ", roles: ["owner"] },
    ].filter((item) => item.roles.includes(user?.role));

    const sections = [...new Set(menuItems.map((m) => m.section))];
    const isActive = (path) => location.pathname === path;

    const roleLabel = {
        owner: { text: "ເຈົ້າຂອງ", color: "#7c3aed", bg: "#f5f3ff", icon: "ti-crown" },
        employee: { text: "ພະນັກງານ", color: "#0369a1", bg: "#f0f9ff", icon: "ti-id-badge" },
        branch: { text: "ສາຂາ", color: "#15803d", bg: "#f0fdf4", icon: "ti-building-store" },
    };
    const role = roleLabel[user?.role] || {};

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="sidebar-logo" style={{ cursor: "pointer" }} onClick={() => { navigate("/dashboard"); closeSidebar(); }}>
                <div className="sidebar-logo-icon">
                    <i className="ti ti-package" aria-hidden="true" />
                </div>
                <span className="sidebar-logo-text">MTP STOCK</span>
            </div>

            {/* Navigation */}
            <div className="sidebar-nav">
                {sections.map((section) => (
                    <div key={section}>
                        <div className="sidebar-section">{section}</div>
                        {menuItems.filter((m) => m.section === section).map((item) => (
                            <button
                                key={item.path}
                                className={`sidebar-item${isActive(item.path) ? " active" : ""}`}
                                onClick={() => { navigate(item.path); closeSidebar(); }}
                            >
                                <i className={`ti ${item.icon}`} aria-hidden="true" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom: user + logout */}
            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user?.name}
                        </div>
                        <div className="sidebar-user-role">{role.text}</div>
                    </div>
                    <span
                        style={{ fontSize: "11.5px", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: role.bg, color: role.color, whiteSpace: "nowrap" }}
                    >
                        {role.text}
                    </span>
                </div>
                <button className="sidebar-logout-btn" onClick={handleLogout}>
                    <i className="ti ti-logout" aria-hidden="true" />
                    ອອກຈາກລະບົບ
                </button>
            </div>
        </>
    );

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay show" onClick={closeSidebar} />
            )}

            {/* Main */}
            <div className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    <button
                        className="topbar-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="ເປີດເມນູ"
                    >
                        <i className="ti ti-menu-2" aria-hidden="true" />
                    </button>
                    <span className="topbar-title">{title}</span>
                    <div className="topbar-actions">
                        <span
                            className="hide-mobile"
                            style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: role.bg, color: role.color }}
                        >
                            {role.text}
                        </span>
                        <button className="topbar-btn" title="ການແຈ້ງເຕືອນ">
                            <i className="ti ti-bell" aria-hidden="true" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}