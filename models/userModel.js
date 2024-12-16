const mongodb = require("../database/database");
const { ObjectId } = require("mongodb");
const Ajv = require("ajv");
const addFormats = require("ajv-formats"); // Import ajv-formats

// Initialize AJV for JSON validation
const ajv = new Ajv();
addFormats(ajv); // Enable format validators

// Define the JSON schema for the Users collection
const userSchema = {
  type: "object",
  required: ["name", "role"],
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", nullable: true },
    role: { type: "string", enum: ["client", "admin", "employee"] },
    githubId: { type: "string", pattern: "^[0-9]+$" },
    avatarUrl: { type: "string", format: "uri", nullable: true },
    registeredDate: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
};

const userUpdateSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", nullable: true },
    role: { type: "string", enum: ["client", "admin", "employee"] },
  },
  additionalProperties: false,
};

// Compile the schema for validation
const validateUser = ajv.compile(userSchema);
const validateUpdateUser = ajv.compile(userUpdateSchema);

const collectionName = "users";
const modelName = "User";

// Validate the user data
const validate = (userData) => {
  const valid = validateUser(userData);
  if (!valid) {
    const errors = validateUser.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422; // Unprocessable Entity
    throw error;
  }
};

const validateUpdate = (userData) => {
  const valid = validateUpdateUser(userData);
  if (!valid) {
    const errors = validateUpdateUser.errors
      .map((err) => `${err.instancePath} ${err.message}`)
      .join(", ");
    const error = new Error(`Validation failed: ${errors}`);
    error.status = 422; // Unprocessable Entity
    throw error;
  }
};

// MongoDB CRUD operations for Users
const getUsers = async () => {
  const db = mongodb.getDb();
  return db.collection(collectionName).find().toArray();
};

const getUserById = async (id) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400; // Bad Request
    throw error;
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
};

const getByGithubId = async (id) => {
  const db = mongodb.getDb();
  if (!/^\d+$/.test(id)) { // Regex checks if the ID consists of only digits
    const error = new Error("Invalid GitHub ID format");
    error.status = 400; // Bad Request
    throw error;
  }

  return db.collection(collectionName).findOne({ githubId: id });
};

const createUser = async (userData) => {
  validate(userData); // Validate data before insertion
  if (!userData.role) {
    userData.role = "client";
  }
  if (!userData.registeredDate) {
    userData.registeredDate = new Date().toISOString(); // Add registered date
  }
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(userData);
  if (!result.acknowledged) {
    const error = new Error("Failed to create user");
    error.status = 500;
    throw error;
  }
  return result.insertedId;
};

const updateUserById = async (id, userData) => {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400; // Bad Request
    throw error;
  }
  validateUpdate(userData); // Validate data before update
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    { $set: userData }
  );
  if (result.matchedCount === 0) {
    const error = new Error("User not found");
    error.status = 404; // Not Found
    throw error;
  }
  return result.modifiedCount > 0;
};

const deleteUserById = async (id) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400; // Bad Request
    throw error;
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    const error = new Error("User not found");
    error.status = 404; // Not Found
    throw error;
  }
  return result.deletedCount > 0;
};

module.exports = {
  getUsers,
  getUserById,
  getByGithubId,
  createUser,
  updateUserById,
  deleteUserById,
  modelName
};