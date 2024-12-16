const express = require("express");
const carsController = require("../controllers/cars");
const { carValidation, carUpdateValidation, validateResults } = require("../middleware/validateCar");
const { isAuthenticated, authorizeCarOwnership } = require("../middleware/utilities");
const { checkEmptyBody, checkEntityExists, checkForIdenticalData } = require('../middleware/validateRequest');
const Car = require('../models/carModel');
const allowedFields = ['make', 'model', 'year', 'engineType', 'VIN', 'category'];

const router = express.Router();

// Route to get a list of cars
router.get("/", isAuthenticated, carsController.getCars);

// Route to get a single car by ID (any logged-in user can access)
router.get("/:id", isAuthenticated, carsController.getCarById);

// Route to create a car (any logged-in user can create)
router.post("/", 
  isAuthenticated, 
  checkEmptyBody,
  carValidation, 
  validateResults(), 
  carsController.createCar
);

// Route to update a car (only the owner or admin can update)
router.put("/:id", 
  isAuthenticated, 
  checkEmptyBody,
  checkEntityExists(Car, 'getCarById'),
  authorizeCarOwnership, 
  checkForIdenticalData(allowedFields),
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
