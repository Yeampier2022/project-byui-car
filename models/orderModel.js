const mongodb = require("../database/database");
const { ObjectId } = require("mongodb");
const Ajv = require("ajv");
const addFormats = require("ajv-formats"); // Import ajv-formats

// Initialize AJV for JSON validation
const ajv = new Ajv();
addFormats(ajv); // Enable format validators

// Define the JSON schema for the Users collection
const orderSchema = {
  type: "object",
  required: ["clientId", "partId", "quantity", "status"],
  properties: {
    clientId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // ObjectId format
    partId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // ObjectId format
    quantity: { type: "integer", minimum: 1 },
    status: { type: "string", enum: ["pending", "completed", "canceled"] },
    orderDate: { type: "string", format: "date-time" }, // Auto-generated
  },
  additionalProperties: false,
};

const validateOrder = ajv.compile(orderSchema);

const ordersCollection = "orders";

const validateOrderData = (orderData) => {
  const valid = validateOrder(orderData);
  if (!valid) {
    const errors = validateOrder.errors.map((err) => `${err.instancePath} ${err.message}`).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
};

// CRUD operations

const createOrder = async (orderData) => {
  validateOrderData(orderData);
  const db = mongodb.getDb();
  orderData.orderDate = new Date().toISOString();
  const result = await db.collection(ordersCollection).insertOne(orderData);
  return result.insertedId;
};

module.exports = {
  createOrder,
};
