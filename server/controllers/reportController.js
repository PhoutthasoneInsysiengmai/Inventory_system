const Order = require("../models/Order");

// ສິນຄ້າຍອດນິຍົມ ເດືອນ/ປີ
exports.getPopularProducts = async (req, res) => {
    try {
        const { type, year, month } = req.query;

        // ກຳນົດຊ່ວງເວລາ
        let startDate, endDate;
        if (type === "monthly") {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
        } else {
            startDate = new Date(year, 0, 1);
            endDate = new Date(Number(year) + 1, 0, 1);
        }

        const result = await Order.aggregate([
            // ກອງຂໍ້ມູນຕາມເວລາ
            { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
            // ແຕກ items array
            { $unwind: "$items" },
            // ຈັດກຸ່ມຕາມສິນຄ້າ
            {
                $group: {
                    _id: "$items.product_id",
                    productName: { $first: "$items.productName" },
                    totalQty: { $sum: "$items.quantity" }
                }
            },
            // ລຽງຈາກໜ້ອຍໄປຫາຫຼາຍ
            { $sort: { totalQty: -1 } },
            // ເອົາແຕ່ 10 ອັນດັບ
            { $limit: 10 }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};