import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await axios.post("/auth/login", { email, password });
            login(res.data.user, res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "ເຂົ້າສູ່ລະບົບບໍ່ໄດ້");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Inject responsive styles */}
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', 'Noto Sans Lao', 'Noto Sans', sans-serif;
                }
                .login-left {
                    flex: 0 0 420px;
                    background: linear-gradient(160deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                }
                .login-right {
                    flex: 1;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 20px;
                }
                .login-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 40px 36px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
                }

                /* ── Mobile: hide left panel, full width form ── */
                @media (max-width: 640px) {
                    .login-left { display: none; }
                    .login-right {
                        background: linear-gradient(160deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%);
                        padding: 24px 16px;
                        align-items: flex-start;
                        padding-top: 48px;
                    }
                    .login-card {
                        padding: 28px 22px;
                        border-radius: 14px;
                    }
                    .login-mobile-logo {
                        display: flex !important;
                    }
                }
                @media (min-width: 641px) {
                    .login-mobile-logo { display: none !important; }
                }
            `}</style>

            <div className="login-page">
                {/* Left branding panel — desktop only */}
                <div className="login-left">
                    <div style={{ color: "#fff", maxWidth: 300 }}>
                        <div style={S.brandLogo}>
                            <i className="ti ti-package" style={{ fontSize: 32, color: "#fff" }} />
                        </div>
                        <h1 style={S.brandTitle}>MTP STOCK</h1>
                        <p style={S.brandSub}>ສະຕ໋ອກ ເອັມທີພີ</p>
                        <p style={S.brandDesc}>ລະບົບຈັດການສິນຄ້າ ແລະ ສາຂາ ອອນໄລນ໌</p>
                        <div style={S.featureList}>
                            {[
                                { icon: "ti-package", text: "ຈັດການສິນຄ້າ ແລະ ລ໋ອດ" },
                                { icon: "ti-building-warehouse", text: "ຕິດຕາມສະຕ໋ອກ real-time" },
                                { icon: "ti-shopping-cart", text: "ຈັດການຄຳສັ່ງຊື້ຫຼາຍສາຂາ" },
                                { icon: "ti-chart-bar", text: "ລາຍງານ ແລະ ສະຖິຕິ" },
                            ].map((f) => (
                                <div key={f.text} style={S.featureItem}>
                                    <div style={S.featureIconBox}>
                                        <i className={`ti ${f.icon}`} style={{ fontSize: 14, color: "#fff" }} />
                                    </div>
                                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right form panel */}
                <div className="login-right">
                    <div className="login-card">

                        {/* Mobile-only logo header */}
                        <div className="login-mobile-logo" style={{ flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
                            <div style={{ ...S.brandLogo, marginBottom: 12 }}>
                                <i className="ti ti-package" style={{ fontSize: 28, color: "#fff" }} />
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: 0.5 }}>MTP STOCK</h1>
                            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>ສະຕ໋ອກ ເອັມທີພີ</p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>ເຂົ້າສູ່ລະບົບ</h2>
                            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>ກະລຸນາກອກຂໍ້ມູນຂອງທ່ານ</p>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <i className="ti ti-alert-triangle" />{error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Email */}
                            <div className="form-field">
                                <label className="form-label">ອີເມວ</label>
                                <div className="form-input-icon-wrap">
                                    <i className="ti ti-mail" />
                                    <input
                                        className="form-input"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-field">
                                <label className="form-label">ລະຫັດຜ່ານ</label>
                                <div style={{ position: "relative" }}>
                                    <div className="form-input-icon-wrap">
                                        <i className="ti ti-lock" />
                                        <input
                                            className="form-input"
                                            type={showPass ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            style={{ paddingRight: 44 }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        aria-label={showPass ? "ເຊື່ອງລະຫັດ" : "ສະແດງລະຫັດ"}
                                        style={S.eyeBtn}
                                    >
                                        <i className={`ti ${showPass ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: 17, color: "#94a3b8" }} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: "100%", justifyContent: "center", marginTop: 6, opacity: loading ? 0.75 : 1 }}
                                disabled={loading}
                            >
                                {loading
                                    ? <><i className="ti ti-loader-2" style={{ fontSize: 18 }} />ກຳລັງເຂົ້າສູ່ລະບົບ...</>
                                    : <><i className="ti ti-login" style={{ fontSize: 18 }} />ເຂົ້າສູ່ລະບົບ</>
                                }
                            </button>
                        </form>

                        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
                            ຖ້າມີບັນຫາ ກະລຸນາຕິດຕໍ່ຜູ້ພັດທະນາ
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

const S = {
    brandLogo: {
        width: 60, height: 60,
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 15,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
    },
    brandTitle: { fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 1, margin: 0 },
    brandSub: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
    brandDesc: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 18, lineHeight: 1.7 },
    featureList: { marginTop: 28, display: "flex", flexDirection: "column", gap: 12 },
    featureItem: { display: "flex", alignItems: "center", gap: 12 },
    featureIconBox: {
        width: 28, height: 28,
        background: "rgba(255,255,255,0.15)",
        borderRadius: 7,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
    },
    eyeBtn: {
        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 1,
    },
};