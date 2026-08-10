const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        // =========================
        // 1. ตรวจสอบ JWT
        // =========================
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // =========================
        // 2. ตรวจสอบ User ใน Database
        // =========================
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // =========================
        // 3. ตรวจสอบว่า User ถูก Block หรือไม่
        // =========================
        if (user.isActive === false) {
            return res.status(401).json({
                message: "ACCOUNT_BLOCKED",
                blocked: true
            });
        }

        // =========================
        // 4. ส่งข้อมูล User ล่าสุดไปให้ Controller
        // =========================
        req.user = {
            ...decoded,
            id: user._id.toString(),
            role: user.role,
            branch: user.branch,
            isActive: user.isActive
        };

        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = authMiddleware;