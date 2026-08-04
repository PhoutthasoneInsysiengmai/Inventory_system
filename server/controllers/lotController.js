const Lot = require("../models/Lot");
const Product = require("../models/Product");

// ເພີ່ມ Lot ໃໝ່
exports.addLot = async (req, res) => {
    try {
        const { product, lotNumber, quantity, receivedDate, expiryDate, note } = req.body;

        if (!product || !lotNumber || !quantity || !expiryDate)
            return res.status(400).json({ message: "ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ" });

        // ເຊັກວ່າສິນຄ້າມີຢູ່ຈິງ
        const productExists = await Product.findById(product);
        if (!productExists)
            return res.status(404).json({ message: "ບໍ່ພົບສິນຄ້ານີ້" });

        const lot = await Lot.create({
            product, lotNumber, quantity,
            receivedDate: receivedDate || Date.now(),
            expiryDate, note
        });

        // ອັບເດດ quantity ລວມໃນ Product
        await Product.findByIdAndUpdate(product, {
            $inc: { quantity: quantity }
        });

        const populated = await lot.populate("product", "productName productCode unit");
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ເບິ່ງ Lot ທັງໝົດຂອງສິນຄ້ານັ້ນ
exports.getLotsByProduct = async (req, res) => {
    try {
        const lots = await Lot.find({
            product: req.params.productId,
            quantity: { $gt: 0 }              // ສະເພາະ lot ທີ່ຍັງມີສິນຄ້າ
        })
            .populate("product", "productName productCode unit")
            .sort({ expiryDate: 1 });             // ລຽງຕາມ expiry ເກົ່າສຸດກ່ອນ (FIFO)

        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ເບິ່ງ Lot ທັງໝົດ (ທຸກສິນຄ້າ)
exports.getAllLots = async (req, res) => {
    try {
        const lots = await Lot.find({ quantity: { $gt: 0 } })
            .populate("product", "productName productCode unit category")
            .sort({ expiryDate: 1 });
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ເບິ່ງ Lot ໃກ້ໝົດອາຍຸ (3, 7, 15 ມື້)
exports.getExpiringLots = async (req, res) => {
    try {
        const now = new Date();
        const in15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

        const lots = await Lot.find({
            quantity: { $gt: 0 },
            expiryDate: { $lte: in15, $gte: now }
        })
            .populate("product", "productName productCode unit")
            .sort({ expiryDate: 1 });

        // ຈັດກຸ່ມຕາມ 3, 7, 15 ມື້
        const grouped = { day3: [], day7: [], day15: [] };
        lots.forEach((lot) => {
            const daysLeft = Math.ceil((new Date(lot.expiryDate) - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3) grouped.day3.push({ ...lot.toObject(), daysLeft });
            else if (daysLeft <= 7) grouped.day7.push({ ...lot.toObject(), daysLeft });
            else grouped.day15.push({ ...lot.toObject(), daysLeft });
        });

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ແກ້ໄຂ Lot
exports.updateLot = async (req, res) => {
    try {
        const lot = await Lot.findById(req.params.id);
        if (!lot) return res.status(404).json({ message: "ບໍ່ພົບ Lot ນີ້" });

        const oldQty = lot.quantity;
        const updated = await Lot.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate("product", "productName productCode unit");

        // ອັບເດດ quantity ລວມໃນ Product
        const diff = updated.quantity - oldQty;
        if (diff !== 0) {
            await Product.findByIdAndUpdate(updated.product._id, {
                $inc: { quantity: diff }
            });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ລົບ Lot
exports.deleteLot = async (req, res) => {
    try {
        const lot = await Lot.findById(req.params.id);
        if (!lot) return res.status(404).json({ message: "ບໍ່ພົບ Lot ນີ້" });

        // ຫຼຸດ quantity ໃນ Product
        await Product.findByIdAndUpdate(lot.product, {
            $inc: { quantity: -lot.quantity }
        });

        await Lot.findByIdAndDelete(req.params.id);
        res.json({ message: "ລົບ Lot ສຳເລັດ" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};