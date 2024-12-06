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

// Compile the schema for validation
const validateCar = ajv.compile(carSchema);

const collectionName = "cars";

// Validate the car data
const validate = (carData) => {
  const valid = validateCar(carData);
  if (!valid) {
    const errors = validateCar.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
};

const getCars = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
};

const getCarById = async (id) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
};

const createCar = async (carData) => {
  validate(carData); // Validate data before insertion
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(carData);
  return result.insertedId;
};

module.exports = {
  getCars,
  getCarById,
  createCar,
};
