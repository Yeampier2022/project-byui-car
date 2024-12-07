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


const getSquardParts = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
}

const getSquardPartById = async (partId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(partId)) {
    throw new Error("Invalid ID format");
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(partId) });
}
const createSparePart = async (sparePartData) => {
  validate(sparePartData);
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(sparePartData);
  return result.insertedId;
};

const updateSquardPartById = async (partId, sparePartData) => {
  validate(sparePartData);
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: ObjectId(partId) },
    { $set: sparePartData }
  );
  return result.matchedCount > 0;
};

const deleteSquardPartById = async (partId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(partId)) {
    throw new Error("Invalid ID format");
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(partId) });
  return result.deletedCount > 0;
};


module.exports = {
  getSquardParts,
  getSquardPartById,
  createSparePart,
  updateSquardPartById,
  deleteSquardPartById
};
