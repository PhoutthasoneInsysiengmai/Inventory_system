const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "employee", "branch"],
        required: true
    },
    branch: {
        type: String,
        default: null       // ກອກສະເພາະ role: "branch"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "blocked"],
        default: "pending"  // ຖ້າ developer approve ກ່ອນເຂົ້າລະບົບໄດ້
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);