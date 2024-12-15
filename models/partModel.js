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
      items: {
        type: "string",
        enum: ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"],
      },
      minItems: 1,
    },
    category: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
};

const sparePartUpdateSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    price: { type: "number", minimum: 0 },
    stock: { type: "integer", minimum: 0 },
    compatibleCars: {
      type: "array",
      items: {
        type: "string",
        enum: ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"],
      },
      minItems: 1,
    },
    category: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
};

const validateSparePart = ajv.compile(sparePartSchema);
const validateUpdateSparePart = ajv.compile(sparePartUpdateSchema);

const collectionName = "spare_parts";

// Validation function
const validate = (sparePartData) => {
  const valid = validateSparePart(sparePartData);
  if (!valid) {
    const errors = validateSparePart.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

// Validate the update spare part data
const updateValidate = (sparePartData) => {
  const valid = validateUpdateSparePart(sparePartData);
  if (!valid) {
    const errors = validateUpdateSparePart.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation update failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

// CRUD operations
const getSpareParts = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
};

const getSparePartById = async (partId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(partId)) {
    return null
  }
  let part = await db.collection(collectionName).findOne({ _id: new ObjectId(partId) });
  return part
};

const getSparePartsByIds = async (partIds) => {
  const db = mongodb.getDb();
  const validPartIds = partIds.filter((id) => ObjectId.isValid(id));

  if (validPartIds.length === 0) {
    return false;
  }

  const existingParts = await db
    .collection(collectionName)
    .find({ _id: { $in: validPartIds.map((id) => new ObjectId(id)) } })
    .toArray();

  // Ensure the number of valid parts matches the number of valid partIds
  return existingParts.length === validPartIds.length;
};

const createSparePart = async (sparePartData) => {
  validate(sparePartData);  // Validate data before insertion
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(sparePartData);
  return result.insertedId;
};

const updateSparePartById = async (partId, sparePartData) => {
  updateValidate(sparePartData);  // Validate data before update
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(partId) },
    { $set: sparePartData }
  );
  if (result.matchedCount === 0) {
    const error = new Error("No spare part found to update");
    error.status = 404;  // Not Found
    throw error;
  }
  return result.matchedCount > 0;
};

const deleteSparePartById = async (partId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(partId)) {
    const error = new Error("Invalid ID format");
    error.status = 400;  // Bad Request
    throw error;
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(partId) });
  if (result.deletedCount === 0) {
    const error = new Error("No spare part found to delete");
    error.status = 404;  // Not Found
    throw error;
  }
  return result.deletedCount > 0;
};

module.exports = {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePartById,
  deleteSparePartById,
  getSparePartsByIds
};
