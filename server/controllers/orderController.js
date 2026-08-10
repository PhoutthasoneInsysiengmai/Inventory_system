const Order = require("../models/Order");
const Product = require("../models/Product");
const Lot = require("../models/Lot");
const { sendLowStockAlert } = require("../services/mailService");

exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        // =========================
        // 1. ตรวจสอบ items
        // =========================
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "ກະລຸນາເລືອກສິນຄ້າ"
            });
        }

        // =========================
        // 2. ดึง User ที่ Login อยู่
        // =========================
        const User = require("../models/User");
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                message: "ບໍ່ພົບຜູ້ໃຊ້"
            });
        }

        // =========================
        // 3. ตรวจสอบว่า User มีสาขา
        // =========================
        if (!currentUser.branch) {
            return res.status(400).json({
                message: "ບັນຊີນີ້ບໍ່ມີສາຂາ"
            });
        }

        // =========================
        // 4. หา Branch ของ User
        // =========================
        const Branch = require("../models/Branch");

        const userBranch = await Branch.findOne({
            branchName: currentUser.branch
        });

        if (!userBranch) {
            return res.status(404).json({
                message: `ບໍ່ພົບສາຂາ ${currentUser.branch}`
            });
        }

        // =========================
        // 5. ตรวจสอบ Stock ก่อน
        // =========================
        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                return res.status(404).json({
                    message: `ไม่พบสินค้า: ${item.product_id}`
                });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `สินค้าไม่พอ: ${product.productName} (คงเหลือ ${product.quantity} ${product.unit})`
                });
            }
        }

        // =========================
        // 6. สร้าง Order
        // ใช้ Branch ของ User เท่านั้น
        // =========================
        const order = await Order.create({
            branch: userBranch._id,
            orderedBy: req.user.id,
            items
        });

        // =========================
        // 7. ตัด Stock แบบ FIFO
        // =========================
        for (const item of items) {
            let remaining = item.quantity;

            const lots = await Lot.find({
                product: item.product_id,
                quantity: { $gt: 0 }
            }).sort({
                expiryDate: 1
            });

            for (const lot of lots) {
                if (remaining <= 0) break;

                const deduct = Math.min(
                    lot.quantity,
                    remaining
                );

                lot.quantity -= deduct;
                remaining -= deduct;

                await lot.save();
            }

            // ลด Stock
            const updated = await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { quantity: -item.quantity } },
                { returnDocument: "after" }
            ).populate("category");

            // =========================
            // Low Stock Alert
            // =========================
            if (
                updated &&
                updated.quantity <= updated.minimumStock
            ) {
                await sendLowStockAlert({
                    productName: updated.productName,
                    productCode: updated.productCode,
                    quantity: updated.quantity,
                    minimumStock: updated.minimumStock,
                    mainCategory:
                        updated.category?.mainCategory || "-",
                    subCategory:
                        updated.category?.subCategory || "-",
                    unit:
                        updated.unit || "ອັນ",
                    branchName:
                        userBranch.branchName,
                    branchEmail:
                        null
                });
            }
        }

        // =========================
        // 8. ส่ง Order กลับ
        // =========================
        res.status(201).json(order);

    } catch (error) {
        console.error("Create Order Error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};

// Get All Orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("branch", "branchName")
            .populate("orderedBy", "name email")
            .populate({
                path: "items.product_id",
                select: "productName productCode unit category",
                populate: {
                    path: "category",
                    select: "mainCategory subCategory"
                }
            })
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
            { returnDocument: "after" }
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
            .populate({
                path: "items.product_id",
                select: "productName productCode unit category",
                populate: {
                    path: "category",
                    select: "mainCategory subCategory"
                }
            })
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};