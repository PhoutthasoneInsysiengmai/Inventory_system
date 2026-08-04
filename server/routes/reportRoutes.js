const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/popular-products",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    reportController.getPopularProducts
);

module.exports = router;