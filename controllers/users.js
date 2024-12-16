const userModel = require("../models/userModel");

const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const createUser = async (req, res, next) => {
  try {
    const userId = await userModel.createUser(req.body);
    res.status(201).json({ message: "User created", id: userId });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const success = await userModel.updateUserById(req.params.id, req.body);
    if (!success) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const success = await userModel.deleteUserById(req.params.id);
    if (!success) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);  // Pass error to the global error handler
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    next(error);  // Pass error to the global error handler
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
};