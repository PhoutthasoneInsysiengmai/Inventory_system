const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, branch } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            branch: branch || null,
            status: "pending"
        });

        res.status(201).json({ message: "User registered successfully. Waiting for approval." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        if (user.status === "pending")
            return res.status(403).json({ message: "Account pending approval" });

        if (user.status === "blocked")
            return res.status(403).json({ message: "Account has been blocked" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch,
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get all pending users (specifically owner)
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ status: "pending" })
            .select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve user (specifically owner)
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        ).select("-password");

        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.json({ message: "User approved successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Block user (specifically owner)
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "blocked" },
            { new: true }
        ).select("-password");

        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.json({ message: "User blocked successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (specifically owner)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};