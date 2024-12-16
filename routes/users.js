const express = require("express");
const userController = require("../controllers/users");
const {
  userUpdateValidation,
  validateResults,
} = require("../middleware/validateUser");
const {
  isAuthenticated,
  authorizeRole,
  restrictRoleUpdate,
  authorizeRoleOrOwnership,
} = require("../middleware/utilities");
const { checkEmptyBody, checkEntityExists, checkForIdenticalData } = require('../middleware/validateRequest');
const User = require('../models/userModel');
const allowedFields = ['name', 'email', 'role'];

const router = express.Router();

// Routes
router.get(
  "/",
  isAuthenticated,
  authorizeRole("admin", "employee"), // Only admins and employees can access this route
  userController.getUsers
);

router.get("/:id",
  isAuthenticated,
  authorizeRole("admin", "employee"),
  userController.getUserById,
);

router.put(
  "/:id",
  isAuthenticated,
  restrictRoleUpdate(),         // Restrict role updates to admins        
  authorizeRoleOrOwnership("admin"),
  checkEmptyBody,
  checkEntityExists(User, 'getUserById'),
  checkForIdenticalData(allowedFields),
  userUpdateValidation,
  validateResults(),
  userController.updateUserById
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoleOrOwnership("admin"), // Owners or Admins can only delete resources
  userController.deleteUserById
);

module.exports = router;
