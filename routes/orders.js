const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const { orderValidation, orderUpdateValidation, validateResults } = require("../middleware/validateOrder");

router.get("/", ordersController.getOrders);
router.get("/:id", ordersController.getOrderById);
router.post("/", ordersController.createOrder);

router.post("/", 
    orderValidation,            // Validation middleware for creating a car
    validateResults(),          // Middleware to check validation results
    ordersController.createOrder
  );
  
  // Update an existing car with validation
  router.put("/:id", 
    orderUpdateValidation,      // Validation middleware for updating a car
    validateResults(),          // Middleware to check validation results
    ordersController.updateOrderById
  );
//router.put("/:id", ordersController.updateOrderById);
router.delete("/:id", ordersController.deleteOrderById);

module.exports = router;
