const express = require("express");
const router = express.Router();
const carsController = require("../controllers/cars");

router.get("/", carsController.getCars);

module.exports = router;
