const mongoose = require("mongoose");

const lotSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    lotNumber: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    receivedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Lot", lotSchema);