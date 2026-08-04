const Order = require("../models/Order");
const Product = require("../models/Product");
const Lot = require("../models/Lot");
const { sendLowStockAlert } = require("../services/mailService");

exports.createOrder = async (req, res) => {
    try {
        const { branch, items } = req.body;

        // ເຊັກ stock ກ່ອນ
        for (const item of items) {
            const product = await Product.findById(item.product_id);
            if (!product)
                return res.status(404).json({ message: `ບໍ່ພົບສິນຄ້າ: ${item.product_id}` });
            if (product.quantity < item.quantity)
                return res.status(400).json({ message: `ສິນຄ້າບໍ່ພໍ: ${product.productName} (ຄົງເຫລືອ ${product.quantity} ${product.unit})` });
        }

        // ສ້າງ Order
        const order = await Order.create({
            branch,
            orderedBy: req.user.id,
            items
        });

        // ຕັດ stock ແບບ FIFO
        for (const item of items) {
            let remaining = item.quantity;

            // ດຶງ lot ລຽງຕາມ expiry date ເກົ່າສຸດກ່ອນ
            const lots = await Lot.find({
                product: item.product_id,
                quantity: { $gt: 0 }
            }).sort({ expiryDate: 1 });

            for (const lot of lots) {
                if (remaining <= 0) break;
                const deduct = Math.min(lot.quantity, remaining);
                lot.quantity -= deduct;
                remaining -= deduct;
                await lot.save();
            }

            // ອັບເດດ quantity ລວມໃນ Product
            const updated = await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { quantity: -item.quantity } },
                { new: true }
            ).populate("category");

            // ແຈ້ງເຕືອນຖ້າໃກ້ໝົດ
            if (updated.quantity <= updated.minimumStock) {
                await sendLowStockAlert({
                    productName: updated.productName,
                    productCode: updated.productCode,
                    quantity: updated.quantity,
                    minimumStock: updated.minimumStock,
                    mainCategory: updated.category?.mainCategory || "-",
                    subCategory: updated.category?.subCategory || "-",
                    unit: updated.unit || "ອັນ",
                    branchName: null,
                    branchEmail: null
                });
            }
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("branch", "branchName")
            .populate("orderedBy", "name email")
            .populate("items.product_id", "productName productCode unit category")  // ເພີ່ມ unit category
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updated)
            return res.status(404).json({ message: "Order not found" });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Cancel Order + ຄືນ stock
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: "Order not found" });

        // ຄືນ stock ທຸກລາຍການໃນ order
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { quantity: item.quantity } }
            );
        }

        // ລົບ order
        await Order.findByIdAndDelete(req.params.id);

        res.json({ message: "Order cancelled and stock restored" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get My Orders (branch)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ orderedBy: req.user.id })
            .populate("branch", "branchName")
            .populate("orderedBy", "name email")
            .populate("items.product_id", "productName productCode unit category")  // ເພີ່ມ unit category
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};