const express = require("express");
const router = express.Router();
const lotController = require("../controllers/lotController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ເບິ່ງ lot ທັງໝົດ
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    lotController.getAllLots
);

// ເບິ່ງ lot ໃກ້ໝົດອາຍຸ
router.get(
    "/expiring",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    lotController.getExpiringLots
);

// ເບິ່ງ lot ຂອງສິນຄ້ານັ້ນ
router.get(
    "/product/:productId",
    authMiddleware,
    lotController.getLotsByProduct
);

// ເພີ່ມ lot
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    lotController.addLot
);

// ແກ້ໄຂ lot
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    lotController.updateLot
);

// ລົບ lot
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    lotController.deleteLot
);

module.exports = router;