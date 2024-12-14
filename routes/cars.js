const express = require("express");
const carsController = require("../controllers/cars");
const { carValidation, carUpdateValidation, validateResults } = require("../middleware/validateCar");
const { isAuthenticated, authorizeCarOwnership, authorizeRole } = require("../middleware/utilities");

const router = express.Router();

// Route to get a list of cars
router.get("/", isAuthenticated, carsController.getCars);

// Route to get a single car by ID (any logged-in user can access)
router.get("/:id", isAuthenticated, carsController.getCarById);

// Route to create a car (any logged-in user can create)
router.post("/", 
  isAuthenticated, 
  carValidation, 
  validateResults(), 
  carsController.createCar
);

// Route to update a car (only the owner or admin can update)
router.put("/:id", 
  isAuthenticated, 
  authorizeCarOwnership, 
  carUpdateValidation, 
  validateResults(), 
  carsController.updateCarById
);

// Route to delete a car (only the owner or admin can delete)
router.delete("/:id", 
  isAuthenticated, 
  authorizeCarOwnership, 
  carsController.deleteCarById
);

module.exports = router;
