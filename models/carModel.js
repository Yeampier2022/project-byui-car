const mongodb = require("../database/database");
const { ObjectId } = require("mongodb");
const Ajv = require("ajv");
const addFormats = require("ajv-formats"); // Import ajv-formats

// Initialize Ajv for JSON validation
const ajv = new Ajv();
addFormats(ajv); // Enable format validators

// Define the JSON schema for the Cars collection
const carSchema = {
  type: "object",
  required: ["make", "model", "year", "engineType", "VIN", "category"],
  properties: {
    make: { type: "string", minLength: 1 },
    model: { type: "string", minLength: 1 },
    year: { type: "integer", minimum: 1886, maximum: new Date().getFullYear() },
    engineType: { type: "string", enum: ["Petrol", "Diesel", "Electric", "Hybrid"] },
    VIN: { type: "string", minLength: 17, maxLength: 17 },
    category: {
      type: "string",
      enum: ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"],
    },
    ownerId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // MongoDB ObjectId format
  },
  additionalProperties: false,
};

const carUpdateSchema = {
  type: "object",
  properties: {
    make: { type: "string", minLength: 1 },
    model: { type: "string", minLength: 1 },
    year: { type: "integer", minimum: 1886, maximum: new Date().getFullYear() },
    engineType: { type: "string", enum: ["Petrol", "Diesel", "Electric", "Hybrid"] },
    VIN: { type: "string", minLength: 17, maxLength: 17 },
    category: {
      type: "string",
      enum: ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"],
    },
  },
  additionalProperties: false,
};

// Compile the schema for validation
const validateCar = ajv.compile(carSchema);
const validateUpdateCar = ajv.compile(carUpdateSchema);

const collectionName = "cars";

// Validate the car data
const validate = (carData) => {
  const valid = validateCar(carData);
  if (!valid) {
    const errors = validateCar.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

// Validate the update car data
const updateValidate = (carData) => {
  const valid = validateUpdateCar(carData);
  if (!valid) {
    const errors = validateUpdateCar.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation update failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

const getCars = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
};

const getCarById = async (id) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400;  // Bad Request
    throw error;
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
};

const createCar = async (carData) => {
  validate(carData); // Validate data before insertion
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(carData);
  return result.insertedId;
};

const updateCarById = async (carId, carData) => {
  updateValidate(carData);
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(carId) },
    { $set: carData }
  );
  return result.matchedCount > 0;
};

const deleteCarById = async (carId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(carId)) {
    const error = new Error("Invalid ID format");
    error.status = 400;  // Bad Request
    throw error;
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(carId) });
  return result.deletedCount > 0;
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCarById,
  deleteCarById
};