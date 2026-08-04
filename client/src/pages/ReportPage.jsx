import { useEffect, useState } from "react";
import axios from "../api/axios";
import Layout from "../components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ReportPage() {
    const [data, setData] = useState([]);
    const [type, setType] = useState("monthly");
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = type === "monthly" ? `type=monthly&year=${year}&month=${month}` : `type=yearly&year=${year}`;
            const res = await axios.get(`/reports/popular-products?${params}`);
            setData(res.data); setError("");
        } catch { setError("ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ"); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchReport(); }, []);

    const months = ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖູນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"];
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const rankColor = (i) => i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" : "#e2e8f0";
    const rankText = (i) => i < 3 ? "#fff" : "#64748b";

    return (
        <Layout title="ລາຍງານ">
            <div className="page-header">
                <div>
                    <h2 className="page-title">ລາຍງານ</h2>
                    <p className="page-sub">ສິນຄ້າຍອດນິຍົມ Top 10</p>
                </div>
            </div>

            {/* Filter */}
            <div className="card" style={{ marginBottom: 18 }}>
                <div className="card-body" style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                            <label className="form-label">ປະເພດ</label>
                            <select className="form-input" style={{ width: 140 }} value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="monthly">ລາຍເດືອນ</option>
                                <option value="yearly">ລາຍປີ</option>
                            </select>
                        </div>
                        <div className="form-field" style={{ marginBottom: 0 }}>
                            <label className="form-label">ປີ</label>
                            <select className="form-input" style={{ width: 120 }} value={year} onChange={(e) => setYear(e.target.value)}>
                                {years.map((y) => <option key={y} value={y}>{y + 543}</option>)}
                            </select>
                        </div>
                        {type === "monthly" && (
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label className="form-label">ເດືອນ</label>
                                <select className="form-input" style={{ width: 140 }} value={month} onChange={(e) => setMonth(e.target.value)}>
                                    {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                        )}
                        <button className="btn btn-primary" onClick={fetchReport}>
                            <i className="ti ti-chart-bar" />ເບິ່ງລາຍງານ
                        </button>
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-error"><i className="ti ti-alert-triangle" />{error}</div>}

            {/* Chart */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                    <span className="card-title">
                        <i className="ti ti-chart-bar" />
                        {type === "monthly" ? `10 ອັນດັບ — ${months[month - 1]} ${Number(year) + 543}` : `10 ອັນດັບ — ປີ ${Number(year) + 543}`}
                    </span>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ display: "flex", gap: 8, padding: "56px", justifyContent: "center", color: "#94a3b8" }}>
                            <i className="ti ti-loader-2" style={{ fontSize: 20 }} />ກຳລັງໂຫລດ...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><i className="ti ti-chart-bar" /></div>
                            <p className="empty-state-text">ບໍ່ມີຂໍ້ມູນໃນຊ່ວງເວລານີ້</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={data.map((d) => ({ name: d.productName, ຈຳນວນ: d.totalQty }))} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }} />
                                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12, fontSize: 13 }} />
                                <Bar dataKey="ຈຳນວນ" fill="#2563eb" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Rank table */}
            {data.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title"><i className="ti ti-trophy" />ຕາຕະລາງອັນດັບ</span>
                    </div>
                    <div className="table-wrap">
                        <table className="table">
                            <thead><tr><th>ອັນດັບ</th><th>ຊື່ສິນຄ້າ</th><th>ຈຳນວນ</th></tr></thead>
                            <tbody>
                                {data.map((d, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: rankColor(i), color: rankText(i), fontSize: 12, fontWeight: 700 }}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500, color: "#0f172a" }}>{d.productName}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: "#2563eb", fontSize: 15 }}>{d.totalQty}</span>
                                            <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>ໜ່ວຍ</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
}