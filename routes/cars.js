const express = require("express");
const carsController = require("../controllers/cars");
const { carValidation, carUpdateValidation, validateResults } = require("../middleware/validateCar");

const router = express.Router();

router.get("/", carsController.getCars);

router.get("/:id", carsController.getCarById);

router.post("/", 
  carValidation,            // Validation middleware for creating a car
  validateResults(),          // Middleware to check validation results
  carsController.createCar
);

// Update an existing car with validation
router.put("/:id", 
  carUpdateValidation,      // Validation middleware for updating a car
  validateResults(),          // Middleware to check validation results
  carsController.updateCarById
);

router.delete("/:id", carsController.deleteCarById);

module.exports = router;
