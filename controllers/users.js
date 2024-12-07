const userModel = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const userId = await userModel.createUser(req.body);
    res.status(201).json({ message: "User created", userId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const success = await userModel.updateUserById(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const success = await userModel.deleteUserById(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
};
