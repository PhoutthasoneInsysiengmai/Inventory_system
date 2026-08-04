const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productCode: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    // ເພີ່ມຂໍ້ມູນສິນຄ້າທີ່ຈຳເປັນ
    unit: {
        type: String,
        required: true,
        default: "ອັນ"
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    minimumStock: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);