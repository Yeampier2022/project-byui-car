const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const { orderValidation, orderUpdateValidation, validateResults } = require("../middleware/validateOrder");
const {
  isAuthenticated,
  authorizeRole,
} = require("../middleware/utilities");

router.get("/",isAuthenticated, authorizeRole("admin", "employee"), ordersController.getOrders);
router.get("/:id",isAuthenticated, authorizeRole("admin", "employee"), ordersController.getOrderById);

router.post("/",
  isAuthenticated,
  orderValidation,            // Validation middleware for creating a car
  validateResults(),          // Middleware to check validation results
  ordersController.createOrder
);

router.put("/:id",
  isAuthenticated,
  authorizeRole("admin", "employee"),
  orderUpdateValidation,      // Validation middleware for updating a car
  validateResults(),          // Middleware to check validation results
  ordersController.updateOrderById
);
router.delete("/:id",isAuthenticated, authorizeRole("admin", "employee"), ordersController.deleteOrderById);

module.exports = router;
