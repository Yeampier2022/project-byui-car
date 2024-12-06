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
    email: { type: "string", format: "email", nullable: true }, // GitHub might not provide an email
    role: { type: "string", enum: ["client", "admin", "employee"] },
    githubId: { type: "string", pattern: "^[0-9]+$" }, // GitHub user ID (numeric)
    avatarUrl: { type: "string", format: "uri", nullable: true }, // Store GitHub avatar URL
    registeredDate: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
};

// Compile the schema for validation
const validateUser = ajv.compile(userSchema);

const collectionName = "users";

// Validate the user data
const validate = (userData) => {
  const valid = validateUser(userData);
  if (!valid) {
    const errors = validateUser.errors.map((err) => `${err.instancePath} ${err.message}`).join(", ");
    throw new Error(`Validation failed: ${errors}`);
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
    throw new Error("Invalid ID format");
  }
  return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
};

const getByGithubId = async (id) => {
  const db = mongodb.getDb();
  return db.collection(collectionName).findOne({ githubId: id });
};

const createUser = async (userData) => {
  validate(userData); // Validate data before insertion
  if (!userData.role) {
    userData.role = "client"
  }
  if (!userData.registeredDate) {
    userData.registeredDate = new Date().toISOString(); // Add registered date
  }
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).insertOne(userData);
  return result;
};

const updateUserById = async (id, userData) => {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }
  validate(userData); // Validate data before update
  const db = mongodb.getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    { $set: userData }
  );
  return result.modifiedCount > 0;
};

const deleteUserById = async (id) => {
  const db = mongodb.getDb();
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
};

module.exports = {
  getUsers,
  getUserById,
  getByGithubId,
  createUser,
  updateUserById,
  deleteUserById,
};