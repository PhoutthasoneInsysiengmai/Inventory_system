const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ສະເພາະ owner ເທົ່ານັ້ນທີ່ສາມາດຈັດການ branch ໄດ້ (create, read, update, delete)
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["owner"]),
    branchController.createBranch
);

router.get(
    "/",
    authMiddleware,
    branchController.getBranches
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner"]),
    branchController.updateBranch
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["owner"]),
    branchController.deleteBranch
);

module.exports = router;