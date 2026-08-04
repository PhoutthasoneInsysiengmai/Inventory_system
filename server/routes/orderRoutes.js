const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ສາຂາສັ່ງຂອງໄດ້
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["branch"]),
    orderController.createOrder
);

// owner ແລະ employee ເບິ່ງ order ໄດ້
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    orderController.getOrders
);

router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    orderController.updateOrderStatus
);
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    orderController.cancelOrder
);
// branch ເບິ່ງ order ຂອງໂຕເອງໄດ້
router.get(
    "/my-orders",
    authMiddleware,
    roleMiddleware(["branch"]),
    orderController.getMyOrders
);

module.exports = router;