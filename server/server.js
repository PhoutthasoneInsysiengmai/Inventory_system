const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Import Routes ────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const branchRoutes = require("./routes/branchRoutes");
const lotRoutes = require("./routes/lotRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");

// ─── Import Middleware ────────────────────────────────────
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const { startScheduler } = require("./services/alertScheduler");
startScheduler();
// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);

// ─── Test Routes (ลบทิ้งได้ตอน production) ───────────────
app.get("/", (req, res) => {
    res.send("Inventory API is running...");
});

app.get("/api/protected",
    authMiddleware,
    (req, res) => {
        res.json({ message: "You are authorized", user: req.user });
    }
);

app.get("/api/owner-only",
    authMiddleware,
    roleMiddleware(["owner"]),
    (req, res) => {
        res.json({ message: "Welcome Owner 👑" });
    }
);

// ─── Connect MongoDB ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.log(err));