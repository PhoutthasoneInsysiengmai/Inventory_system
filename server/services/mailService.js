const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendLowStockAlert = async ({
    productName,
    productCode,
    quantity,
    minimumStock,
    mainCategory,
    subCategory,
    unit,
    branchName,
    branchEmail
}) => {
    try {
        const mainRecipients = process.env.MAIL_TO.split(",").map((e) => e.trim());
        const recipients = [...mainRecipients];
        if (branchEmail) recipients.push(branchEmail);

        await transporter.sendMail({
            from: `"Stock Alert System" <${process.env.MAIL_USER}>`,
            to: recipients.join(","),
            subject: `⚠️ ແຈ້ງເຕືອນ: ສິນຄ້າໃກ້ໝົດ — ${productName}`,
            html: `
                <div style="font-family: 'Noto Sans Thai', sans-serif; max-width: 520px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #ff4d4f, #cf1322); padding: 20px 24px;">
                        <h2 style="color: white; margin: 0; font-size: 18px;">⚠️ ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດ</h2>
                        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">
                            ກະລຸນາດຳເນີນການກັບສາຂາ ແລະ ຜູ້ຈັດການເພື່ອເຕີມສິນຄ້າ
                        </p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #888; font-size: 13px; width: 140px;">ລະຫັດສິນຄ້າ</td>
                                <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">
                                    <span style="background: #f0f0f0; padding: 2px 10px; border-radius: 6px;">${productCode}</span>
                                </td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ຊື່ສິນຄ້າ</td>
                                <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${productName}</td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ໝວດໝູ່ຫຼັກ</td>
                                <td style="padding: 10px 0;">
                                    <span style="background: #e6f7ff; color: #1890ff; padding: 2px 10px; border-radius: 12px; font-size: 13px;">📦 ${mainCategory}</span>
                                </td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ໝວກໝູ່ຍ່ອຍ</td>
                                <td style="padding: 10px 0; font-size: 13px; color: #555;">${subCategory}</td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ສາຂາ</td>
                                <td style="padding: 10px 0; font-size: 13px;">${branchName || "ຄັງກາງ"}</td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ຈຳນວນຄົງເຫຼືອ</td>
                                <td style="padding: 10px 0;">
                                    <span style="color: #ff4d4f; font-weight: 700; font-size: 18px;">${quantity}</span>
                                    <span style="color: #888; font-size: 13px;"> ${unit || "ອັນ"}</span>
                                </td>
                            </tr>
                            <tr style="border-top: 1px solid #f0f0f0;">
                                <td style="padding: 10px 0; color: #888; font-size: 13px;">ຈຳນວນຂັ້ນຕ່ຳ</td>
                                <td style="padding: 10px 0; font-size: 14px;">${minimumStock} ${unit || "ອັນ"}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div style="background: #fafafa; padding: 14px 24px; border-top: 1px solid #f0f0f0;">
                        <p style="margin: 0; font-size: 12px; color: #aaa; text-align: center;">
                            Stock Alert System — ລະບົບຈັດການສິນຄ້າ
                        </p>
                    </div>
                </div>
            `
        });

        console.log(`Low stock alert sent: ${productName} (${mainCategory} > ${subCategory}) — ${quantity} ${unit || "ອັນ"}`);
    } catch (error) {
        console.error("Mail error:", error.message);
    }
};

module.exports = { sendLowStockAlert };