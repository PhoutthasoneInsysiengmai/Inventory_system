const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Search
router.get(
    "/search",
    authMiddleware,
    productController.searchProduct
);

// Low Stock
router.get(
    "/low-stock",
    authMiddleware,
    productController.getLowStockProducts
);

// CRUD
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    productController.createProduct
);

router.get(
    "/",
    authMiddleware,
    productController.getProducts
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    productController.updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner", "employee"]),
    productController.deleteProduct
);

module.exports = router;