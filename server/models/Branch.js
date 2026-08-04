const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
    branchName: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);