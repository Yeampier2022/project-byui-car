const express = require("express");
const ordersController = require("../controllers/orders");
const { orderValidation, orderUpdateValidation, validateResults } = require("../middleware/validateOrder");
const { isAuthenticated, authorizeRole } = require("../middleware/utilities");
const { checkEmptyBody, checkEntityExists, checkForIdenticalData } = require('../middleware/validateRequest');
const Order = require('../models/orderModel');
const allowedFields = ['items', 'status'];

const router = express.Router();

// Get all orders (restricted to admins and employees)
router.get("/", 
  isAuthenticated, 
  authorizeRole("admin", "employee"), 
  ordersController.getOrders
);

// Get a single order by ID (restricted to admins and employees)
router.get("/:id", 
  isAuthenticated, 
  authorizeRole("admin", "employee"), 
  ordersController.getOrderById
);

// Create a new order
router.post("/",
  isAuthenticated,
  checkEmptyBody,
  orderValidation,            // Validation middleware for creating an order
  validateResults(),          // Middleware to check validation results
  ordersController.createOrder
);

// Update an order
router.put("/:id",
  isAuthenticated,
  authorizeRole("admin", "employee"),
  checkEmptyBody,
  checkEntityExists(Order, 'getOrderById'),
  checkForIdenticalData(allowedFields),
  orderUpdateValidation,      // Validation middleware for updating an order
  validateResults(),          // Middleware to check validation results
  ordersController.updateOrderById
);

// Delete an order
router.delete("/:id", 
  isAuthenticated, 
  authorizeRole("admin", "employee"), 
  ordersController.deleteOrderById
);

module.exports = router;
