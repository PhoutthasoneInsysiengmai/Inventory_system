const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    mainCategory: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);