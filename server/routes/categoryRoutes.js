const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    categoryController.getCategories
);

router.get(
    "/grouped",
    authMiddleware,
    categoryController.getGroupedCategories
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    categoryController.createCategory
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    categoryController.updateCategory
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    categoryController.deleteCategory
);

module.exports = router;