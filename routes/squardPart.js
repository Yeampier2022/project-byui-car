const express = require("express");
const squardPartController = require("../controllers/squardPart");
const { sparePartValidation, sparePartUpdateValidation, validateResults } = require("../middleware/validatePart");

const router = express.Router();

router.get("/", squardPartController.getSquardParts);

router.get("/:id", squardPartController.getSquardPartById);

router.post("/", 
  sparePartValidation,       // Validation middleware for creating spare part
  validateResults(),           // Middleware to check validation results
  squardPartController.createSquardPart 
);

router.put("/:id", 
  sparePartUpdateValidation, // Validation middleware for updating spare part
  validateResults(),           // Middleware to check validation results
  squardPartController.updateSquardPartById 
);

router.delete("/:id", squardPartController.deleteSquardPartById);

module.exports = router;
