const mongodb = require("../database/database");
const { ObjectId } = require("mongodb");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

// Initialize AJV for JSON validation
const ajv = new Ajv();
addFormats(ajv);

// JSON Schema for Spare Parts collection
const sparePartSchema = {
  type: "object",
  required: ["name", "description", "price", "stock", "compatibleCars", "category"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    price: { type: "number", minimum: 0 },
    stock: { type: "integer", minimum: 0 },
    compatibleCars: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    category: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
};

const validateSparePart = ajv.compile(sparePartSchema);

const collectionName = "spare_parts";

// Validation function
const validate = (sparePartData) => {
  const valid = validateSparePart(sparePartData);
  if (!valid) {
    const errors = validateSparePart.errors.map((err) => `${err.instancePath} ${err.message}`).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
};

// CRUD operations

const createSparePart = async (sparePartData) => {
  validate(sparePartData);
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(sparePartData);
  return result.insertedId;
};

module.exports = {
  createSparePart,
};
