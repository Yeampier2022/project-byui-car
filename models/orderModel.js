const mongodb = require("../database/database");
const { ObjectId } = require("mongodb");
const Ajv = require("ajv");
const addFormats = require("ajv-formats"); // Import ajv-formats
const User = require("./userModel")
const Part = require("./partModel")

// Initialize Ajv for JSON validation
const ajv = new Ajv();
addFormats(ajv); // Enable format validators

// Define the JSON schema for the Order collection
const orderSchema = {
  type: "object",
  required: ["userId", "items", "status"],
  properties: {
    userId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // MongoDB ObjectId format
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["partId", "quantity"],
        properties: {
          partId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // MongoDB ObjectId format
          quantity: { type: "integer", minimum: 1 }, // Quantity of the part
        },
        additionalProperties: false,
      },
    },
    status: { type: "string", enum: ["Pending", "Shipped", "Completed"] },
    orderDate: { type: "string", format: "date-time" }, // Order date
  },
  additionalProperties: false,
};

const orderUpdateSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["partId", "quantity"],
        properties: {
          partId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" }, // MongoDB ObjectId format
          quantity: { type: "integer", minimum: 1 }, // Quantity of the part
        },
        additionalProperties: false,
      },
      
    },
    status: { type: "string", enum: ["Pending", "Shipped", "Completed"] },
  },
  additionalProperties: false,
};

// Compile the schema for validation
const validateOrder = ajv.compile(orderSchema);
const validateUpdateOrder = ajv.compile(orderUpdateSchema);

const collectionName = "orders";

// Validation function for orders
const validate = (orderData) => {
  const valid = validateOrder(orderData);
  if (!valid) {
    const errors = validateOrder.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

const validateUpdate = (orderData) => {
  const valid = validateUpdateOrder(orderData);
  if (!valid) {
    const errors = validateUpdateOrder.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422;  // Unprocessable Entity
    throw error;
  }
};

// Check if the client exists in the Users collection
const userExists = async (userId) => {
  const client = User.getUserById(userId);
  return client !== null;
};

// Ensure all parts exist in the Spare Parts collection
const allPartsExist = async (items) => {
  const partIds = items.map((item) => item.partId);
  const existingParts = await Part.getSparePartsByIds(partIds);
  return existingParts;
};


// Create an order if the client and part exist
const createOrder = async (orderData) => {
  validate(orderData); // Validate data before insertion

  const { userId, items } = orderData;

  // Ensure the client exists
  const isUserValid = await userExists(userId);
  if (!isUserValid) {
    const error = new Error("User does not exist");
    error.status = 404; // Not Found
    throw error;
  }

  // Ensure the parts are valid
  const arePartsValid = await allPartsExist(items);
  if (!arePartsValid) {
    const error = new Error("One or more parts do not exist");
    error.status = 404; // Not Found
    throw error;
  }

  if (!orderData.orderDate) {
    orderData.orderDate = new Date().toISOString(); // Add registered date
  }

  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(orderData);
  return result.insertedId;
};

// Get all orders
const getOrders = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
};

// Get an order by ID
const getOrderById = async (orderId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(orderId)) {
    const error = new Error("Invalid ID format");
    error.status = 400; // Bad Request
    throw error;
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(orderId) });
};

// Update an order by ID
const updateOrderById = async (orderId, orderData) => {
  validateUpdate(orderData); // Validate data before update
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(orderId) },
    { $set: orderData }
  );
  return result.matchedCount > 0;
};

// Delete an order by ID
const deleteOrderById = async (orderId) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(orderId)) {
    const error = new Error("Invalid ID format");
    error.status = 400; // Bad Request
    throw error;
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(orderId) });
  return result.deletedCount > 0;
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
};
