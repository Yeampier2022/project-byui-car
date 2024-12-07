const express = require("express");
const router = express.Router();
const carsController = require("../controllers/cars");

router.get("/", carsController.getCars);
router.get("/:id", carsController.getCarById);
router.post('/', carsController.createCar);

router.put('/:id', carsController.updateCarById);

router.delete('/:id', carsController.deleteCarById);


module.exports = router;
