const carModel = require("../models/carModel");

const getCars = async (req, res, next) => {
  try {
    const cars = await carModel.getCars();
    res.status(200).json(cars);
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const getCarById = async (req, res, next) => {
  try {
    const car = await carModel.getCarById(req.params.id);
    if (!car) {
      const error = new Error("Car not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json(car);
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const createCar = async (req, res, next) => {
  try {
    req.body.ownerId = req.session.user._id;
    const carId = await carModel.createCar(req.body);
    res.status(201).json({ message: "Car created", carId });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const updateCarById = async (req, res, next) => {
  try {
    const success = await carModel.updateCarById(req.params.id, req.body);
    if (!success) {
      const error = new Error("Car not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json({ message: "Car updated" });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const deleteCarById = async (req, res, next) => {
  try {
    const success = await carModel.deleteCarById(req.params.id);
    if (!success) {
      const error = new Error("Car not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json({ message: "Car deleted" });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById,
};