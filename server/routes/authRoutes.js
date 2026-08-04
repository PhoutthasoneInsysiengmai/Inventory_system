const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Owner only routes
router.get(
    "/users",
    authMiddleware,
    roleMiddleware(["owner"]),
    authController.getAllUsers
);

router.get(
    "/users/pending",
    authMiddleware,
    roleMiddleware(["owner"]),
    authController.getPendingUsers
);

router.put(
    "/users/:id/approve",
    authMiddleware,
    roleMiddleware(["owner"]),
    authController.approveUser
);

router.put(
    "/users/:id/block",
    authMiddleware,
    roleMiddleware(["owner"]),
    authController.blockUser
);

module.exports = router;