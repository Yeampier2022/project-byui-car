const express = require("express");
const carsController = require("../controllers/cars");

const router = express.Router();

router.get("/", carsController.getCars);
router.get("/:id", carsController.getCarById);
router.post("/", carsController.createCar);
router.put("/:id", carsController.updateCarById);
router.delete("/:id", carsController.deleteCarById);

module.exports = router;
