const express = require("express");
const sparePartController = require("../controllers/sparePart");
const { sparePartValidation, sparePartUpdateValidation, validateResults } = require("../middleware/validateSparePart");

const router = express.Router();

router.get("/", sparePartController.getSpareParts);

router.get("/:id", sparePartController.getSparePartById);

router.post("/", 
  sparePartValidation,       // Validation middleware for creating spare part
  validateResults(),           // Middleware to check validation results
  sparePartController.createSparePart 
);

router.put("/:id", 
  sparePartUpdateValidation, // Validation middleware for updating spare part
  validateResults(),           // Middleware to check validation results
  sparePartController.updateSparePartById 
);

router.delete("/:id", sparePartController.deleteSparePartById);

module.exports = router;
