const cron = require("node-cron");
const Lot = require("../models/Lot");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendDailySummary = async () => {
    try {
        const now = new Date();
        const in15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

        // ดึง lot ใกล้หมดอายุ
        const expiringLots = await Lot.find({
            quantity: { $gt: 0 },
            expiryDate: { $lte: in15, $gte: now }
        }).populate("product", "productName productCode unit").sort({ expiryDate: 1 });

        // ດຶງສິນຄ້າໃນ stock
        const Product = require("../models/Product");
        const lowStock = await Product.find({
            $expr: { $lte: ["$quantity", "$minimumStock"] }
        }).populate("category");

        // ຈັດກຸ່ມ lot ຕາມ 3, 7, 15 ມື້
        const day3 = [], day7 = [], day15 = [];
        expiringLots.forEach((lot) => {
            const daysLeft = Math.ceil((new Date(lot.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3) day3.push({ lot, daysLeft });
            else if (daysLeft <= 7) day7.push({ lot, daysLeft });
            else day15.push({ lot, daysLeft });
        });

        const formatDate = (date) => new Date(date).toLocaleDateString("lo-LA", {
            day: "numeric", month: "short", year: "numeric"
        });

        const lotRows = (arr) => arr.length === 0
            ? `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:10px">ບໍ່ມີລາຍການ</td></tr>`
            : arr.map(({ lot, daysLeft }) => `
                <tr>
                    <td style="padding:8px 12px">${lot.product?.productCode || "-"}</td>
                    <td style="padding:8px 12px;font-weight:500">${lot.product?.productName || "-"}</td>
                    <td style="padding:8px 12px">${lot.lotNumber}</td>
                    <td style="padding:8px 12px">${lot.quantity} ${lot.product?.unit || "ອັນ"}</td>
                    <td style="padding:8px 12px">${formatDate(lot.expiryDate)} <span style="color:#dc2626;font-weight:600">(ອີກ ${daysLeft} ມື້)</span></td>
                </tr>
            `).join("");

        const lowStockRows = lowStock.length === 0
            ? `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:10px">✅ ບໍ່ມີສິນຄ້າໃກ້ໝົດ</td></tr>`
            : lowStock.map((p) => `
                <tr>
                    <td style="padding:8px 12px">${p.productCode}</td>
                    <td style="padding:8px 12px;font-weight:500">${p.productName}</td>
                    <td style="padding:8px 12px;color:#dc2626;font-weight:700">${p.quantity} ${p.unit || "ອັນ"}</td>
                    <td style="padding:8px 12px;color:#94a3b8">${p.minimumStock} ${p.unit || "ອັນ"}</td>
                </tr>
            `).join("");

        const timeStr = now.toLocaleTimeString("lo-LA", { hour: "2-digit", minute: "2-digit" });
        const dateStr = now.toLocaleDateString("lo-LA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

        await transporter.sendMail({
            from: `"Stock Alert System" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO,
            subject: `📋 ສະຫຼຸບລາຍງານສະຕ໋ອກ — ${dateStr} ເວລາ ${timeStr}`,
            html: `
                <div style="font-family:'Noto Sans Lao',sans-serif;max-width:700px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px;">
                        <h2 style="color:#fff;margin:0;font-size:20px;">📋 ສະຫຼຸບລາຍງານປະຈຳວັນ</h2>
                        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${dateStr} · ${timeStr}</p>
                    </div>

                    <div style="padding:24px;">

                        <!-- ສິນຄ້າໃກ້ໝົດ Stock -->
                        <h3 style="color:#dc2626;margin:0 0 12px;font-size:16px;">⚠️ ສິນຄ້າໃກ້ໝົດສະຕ໋ອກ (${lowStock.length} ລາຍການ)</h3>
                        <div style="overflow-x:auto;margin-bottom:28px;">
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead>
                                    <tr style="background:#f8fafc;">
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;">ລະຫັດ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;">ຊື່ສິນຄ້າ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;">ຄົງເຫຼືອ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;">ຂັ້ນຕ່ຳ</th>
                                    </tr>
                                </thead>
                                <tbody>${lowStockRows}</tbody>
                            </table>
                        </div>

                        <!-- ໝົດອາຍຸໃນ 3 ມື້ -->
                        <h3 style="color:#dc2626;margin:0 0 12px;font-size:16px;">🔴 ໝົດອາຍຸໃນ 3 ມື້ (${day3.length} ລາຍການ)</h3>
                        <div style="overflow-x:auto;margin-bottom:24px;">
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead>
                                    <tr style="background:#fef2f2;">
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fecaca;">ລະຫັດ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fecaca;">ຊື່ສິນຄ້າ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fecaca;">Lot</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fecaca;">ຄົງເຫຼືອ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fecaca;">ວັນໝົດອາຍຸ</th>
                                    </tr>
                                </thead>
                                <tbody>${lotRows(day3)}</tbody>
                            </table>
                        </div>

                        <!-- ໝົດອາຍຸໃນ 7 ມື້ -->
                        <h3 style="color:#d97706;margin:0 0 12px;font-size:16px;">🟡 ໝົດອາຍຸໃນ 7 ມື້ (${day7.length} ລາຍການ)</h3>
                        <div style="overflow-x:auto;margin-bottom:24px;">
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead>
                                    <tr style="background:#fffbeb;">
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fde68a;">ລະຫັດ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fde68a;">ຊື່ສິນຄ້າ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fde68a;">Lot</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fde68a;">ຄົງເຫຼືອ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #fde68a;">ມື້ໝົດອາຍຸ</th>
                                    </tr>
                                </thead>
                                <tbody>${lotRows(day7)}</tbody>
                            </table>
                        </div>

                        <!-- ໝົດອາຍຸໃນ 15 ມື້ -->
                        <h3 style="color:#2563eb;margin:0 0 12px;font-size:16px;">🔵 ໝົດອາຍຸໃນ 15 ມື້ (${day15.length} ລາຍການ)</h3>
                        <div style="overflow-x:auto;margin-bottom:8px;">
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead>
                                    <tr style="background:#eff6ff;">
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #bfdbfe;">ລະຫັດ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #bfdbfe;">ຊື່ສິນຄ້າ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #bfdbfe;">Lot</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #bfdbfe;">ຄົງເຫຼືອ</th>
                                        <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #bfdbfe;">ມື້ໝົດອາຍຸ</th>
                                    </tr>
                                </thead>
                                <tbody>${lotRows(day15)}</tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#94a3b8;">Stock Alert System · ສົ່ງອັດຕະໂນມັດທຸກມື້ 08:00 ແລະ 17:00</p>
                    </div>
                </div>
            `
        });

        console.log(`✅ Daily summary sent at ${timeStr}`);
    } catch (error) {
        console.error("❌ Scheduler error:", error.message);
    }
};

// ລັນ 8:00 ແລະ 17:00 ທຸກມື້
const startScheduler = () => {
    cron.schedule("0 8 * * *", sendDailySummary, { timezone: "Asia/Bangkok" });
    cron.schedule("0 17 * * *", sendDailySummary, { timezone: "Asia/Bangkok" });
    console.log("📅 Alert scheduler started — 08:00 & 17:00 daily");
};

module.exports = { startScheduler, sendDailySummary };