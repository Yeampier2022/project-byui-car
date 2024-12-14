const express = require("express");
const sparePartController = require("../controllers/sparePart");
const { sparePartValidation, sparePartUpdateValidation, validateResults } = require("../middleware/validateSparePart");
const { authorizeRole, isAuthenticated } = require("../middleware/utilities");

const router = express.Router();

// Allow everyone to view spare parts
router.get("/", isAuthenticated, sparePartController.getSpareParts);
router.get("/:id", isAuthenticated, sparePartController.getSparePartById);

// Restrict creating spare parts to admin and employee roles
router.post(
  "/",
  isAuthenticated, 
  authorizeRole("admin", "employee"), // Restrict to admins and employees
  sparePartValidation,
  validateResults(),
  sparePartController.createSparePart
);

// Restrict updating spare parts to admin and employee roles
router.put(
  "/:id",
  isAuthenticated,
  authorizeRole("admin", "employee"), // Restrict to admins and employees
  sparePartUpdateValidation,
  validateResults(),
  sparePartController.updateSparePartById
);

// Restrict deleting spare parts to admin and employee roles
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRole("admin", "employee"), // Restrict to admins and employees
  sparePartController.deleteSparePartById
);

module.exports = router;