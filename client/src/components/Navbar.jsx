import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); };

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: "📊", roles: ["owner", "employee", "branch"] },
        { path: "/products", label: "ສິນຄ້າ", icon: "📦", roles: ["owner", "employee", "branch"] },
        { path: "/lots", label: "ລ໋ອດສິນຄ້າ", icon: "📅", roles: ["owner", "employee"] },
        { path: "/stock", label: "ສະຕ໋ອກ", icon: "🏷️", roles: ["owner", "employee", "branch"] },
        { path: "/orders", label: "ຄຳສັ່ງຊື້", icon: "🛒", roles: ["owner", "employee", "branch"] },
        { path: "/categories", label: "ໝວດໝູ່", icon: "🗂️", roles: ["owner", "employee"] },
        { path: "/reports", label: "ລາຍງານ", icon: "📈", roles: ["owner", "employee"] },
        { path: "/branches", label: "ສາຂາ", icon: "🏪", roles: ["owner"] },
        { path: "/users", label: "ຜູ້ໃຊ້", icon: "👥", roles: ["owner"] },
    ].filter((item) => item.roles.includes(user?.role));

    const isActive = (path) => location.pathname === path;

    const roleLabel = {
        owner: { text: "ເຈົ້າຂອງ", color: "#7c3aed", bg: "#f5f3ff" },
        employee: { text: "ພະນັກງານ", color: "#0369a1", bg: "#f0f9ff" },
        branch: { text: "ສາຂາ", color: "#15803d", bg: "#f0fdf4" }
    };
    const role = roleLabel[user?.role] || {};

    return (
        <>
            <nav style={navStyle}>
                {/* Left: logo + menu */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, overflow: "hidden" }}>
                    <div style={logoStyle} onClick={() => navigate("/dashboard")}>
                        <div style={logoIconStyle}>📦</div>
                        <span>MTP STOCK</span>
                    </div>
                    <div style={menuRowStyle}>
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                style={{ ...menuBtnStyle, ...(isActive(item.path) ? menuBtnActiveStyle : {}) }}
                                onClick={() => navigate(item.path)}
                            >
                                <span style={{ fontSize: "13px" }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right */}
                <div style={rightStyle}>
                    <span style={{ ...roleBadgeStyle, color: role.color, backgroundColor: role.bg }}>
                        {role.text}
                    </span>
                    <span style={usernameStyle}>{user?.name}</span>
                    <button style={logoutBtnStyle} onClick={handleLogout}>
                        ອອກຈາກລະບົບ
                    </button>
                </div>

                {/* Hamburger */}
                <button style={hamburgerStyle} onClick={() => setMobileOpen(true)}>☰</button>
            </nav>

            {/* Overlay */}
            {mobileOpen && <div style={overlayStyle} onClick={() => setMobileOpen(false)} />}

            {/* Mobile Sidebar */}
            <div style={{ ...sidebarStyle, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}>
                <div style={sidebarHeaderStyle}>
                    <div style={logoStyle}>
                        <div style={logoIconStyle}>📦</div>
                        <span>MTP STOCK</span>
                    </div>
                    <button style={closeBtnStyle} onClick={() => setMobileOpen(false)}>✕</button>
                </div>

                <div style={sidebarUserStyle}>
                    <span style={{ ...roleBadgeStyle, color: role.color, backgroundColor: role.bg }}>{role.text}</span>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginTop: "8px" }}>{user?.name}</p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{user?.email}</p>
                </div>

                <div style={sidebarMenuStyle}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            style={{ ...sidebarItemStyle, ...(isActive(item.path) ? sidebarItemActiveStyle : {}) }}
                            onClick={() => { navigate(item.path); setMobileOpen(false); }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                <button style={sidebarLogoutStyle} onClick={handleLogout}>
                    🚪 ອອກຈາກລະບົບ
                </button>
            </div>

            <div style={{ height: "60px" }} />
        </>
    );
}

const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, height: "60px",
    background: "#fff", borderBottom: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};
const logoStyle = {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "15px", fontWeight: "700", color: "#2563eb",
    cursor: "pointer", marginRight: "12px", flexShrink: 0,
};
const logoIconStyle = {
    width: "30px", height: "30px", background: "#2563eb",
    borderRadius: "8px", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "14px",
};
const menuRowStyle = { display: "flex", alignItems: "center", gap: "2px" };
const menuBtnStyle = {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "6px 10px", border: "none", borderRadius: "6px",
    background: "transparent", color: "#64748b",
    fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap",
};
const menuBtnActiveStyle = { background: "#eff6ff", color: "#2563eb", fontWeight: "600" };
const rightStyle = { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 };
const roleBadgeStyle = { fontSize: "11.5px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" };
const usernameStyle = { fontSize: "13px", color: "#475569", fontWeight: "500", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const logoutBtnStyle = { padding: "6px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12.5px", fontWeight: "500" };
const hamburgerStyle = { display: "none", background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px 10px", fontSize: "18px", color: "#475569", cursor: "pointer" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, backdropFilter: "blur(2px)" };
const sidebarStyle = { position: "fixed", top: 0, left: 0, bottom: 0, width: "264px", background: "#fff", borderRight: "1px solid #e2e8f0", zIndex: 300, transition: "transform 0.25s ease", display: "flex", flexDirection: "column", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" };
const sidebarHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #e2e8f0" };
const sidebarUserStyle = { padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" };
const sidebarMenuStyle = { flex: 1, padding: "10px 8px", overflowY: "auto" };
const sidebarItemStyle = { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", border: "none", borderRadius: "8px", background: "transparent", color: "#475569", fontSize: "14px", fontWeight: "500", marginBottom: "2px", textAlign: "left", cursor: "pointer" };
const sidebarItemActiveStyle = { background: "#eff6ff", color: "#2563eb", fontWeight: "600" };
const sidebarLogoutStyle = { margin: "12px", padding: "10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "14px", fontWeight: "500", width: "calc(100% - 24px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" };
const closeBtnStyle = { border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "6px", width: "30px", height: "30px", fontSize: "14px", color: "#64748b", cursor: "pointer" };