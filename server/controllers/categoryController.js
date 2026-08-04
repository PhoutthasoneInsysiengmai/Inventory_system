const Category = require("../models/Category");
const Product = require("../models/Product");

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ mainCategory: 1, subCategory: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get grouped categories (ຈັດກຸ່ມຕາມ mainCategory)
exports.getGroupedCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ mainCategory: 1, subCategory: 1 });
        const grouped = {};
        categories.forEach((c) => {
            if (!grouped[c.mainCategory]) grouped[c.mainCategory] = [];
            grouped[c.mainCategory].push({ _id: c._id, subCategory: c.subCategory, description: c.description });
        });
        res.json(grouped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { mainCategory, subCategory, description } = req.body;
        if (!mainCategory || !subCategory)
            return res.status(400).json({ message: "ກະລຸນາເພີ່ມໝວດໝູ່ຫຼັກ ແລະ ຍ່ອຍກ່ອນ" });

        const existing = await Category.findOne({ mainCategory, subCategory });
        if (existing)
            return res.status(400).json({ message: "ໝວດໝູ່ນີ້ມີຢູ່ແລ້ວ" });

        const category = await Category.create({ mainCategory, subCategory, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated)
            return res.status(404).json({ message: "ບໍ່ພົບໝວດໝູ່ນີ້" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        // ເຊັກວ່າມີ category ນີ້ຢູ່ບໍ?
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0)
            return res.status(400).json({
                message: `ບໍ່ສາມາດລົບໄດ້ ມີສິນຄ້າ ${productCount} ລາຍການຢູ່ໝວດໝູ່ນີ້ຢູ່`
            });

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "ລົບໝວດໝູ່ສຳເລັດ" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};