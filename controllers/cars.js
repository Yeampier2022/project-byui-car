const carModel = require("../models/carModel");

const getCars = async (req, res) => {
  try {
    const cars = await carModel.getCars();
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await carModel.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const createCar = async (req, res) => {
  try {
    const carId = await carModel.createCar(req.body);
    res.status(201).json({ message: "Car created", carId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create car" });
  }
};

const updateCarById = async (req, res) => {
  try {
    const success = await carModel.updateCarById(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car updated" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteCarById = async (req, res) => {
  try {
    const success = await carModel.deleteCarById(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById,
};