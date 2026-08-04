const Product = require("../models/Product");
const Category = require("../models/Category");
const { sendLowStockAlert } = require("../services/mailService");

/// Create Product
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        const populated = await product.populate("category");
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search Product by productCode or productName
exports.searchProduct = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query)
            return res.status(400).json({ message: "Please provide search query" });

        const products = await Product.find({
            $or: [
                // ແກ້ຈາກ exact match ເປັນ regex
                { productCode: { $regex: query.trim(), $options: "i" } },
                { productName: { $regex: query.trim(), $options: "i" } }
            ]
        }).populate("category");

        if (products.length === 0)
            return res.status(404).json({ message: "Product not found" });

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("category");

        if (!updated)
            return res.status(404).json({ message: "Product not found" });

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

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Low Stock Products
exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$quantity", "$minimumStock"] }
        }).populate({
            path: "category",
            model: "Category",
            select: "mainCategory subCategory"
        });

        // ส่งอีเมลแจ้งเตือนทุกสินค้าที่ใกล้หมด
        for (const product of products) {
            await sendLowStockAlert({
                productName: product.productName,
                productCode: product.productCode,
                quantity: product.quantity,
                minimumStock: product.minimumStock,
                mainCategory: product.category?.mainCategory || "-",
                subCategory: product.category?.subCategory || "-",
                unit: product.unit || "ອັນ",
                branchName: null,
                branchEmail: null
            });
        }

        res.json(products);
    } catch (error) {
        console.error("getLowStockProducts error:", error);
        res.status(500).json({ error: error.message });
    }
};