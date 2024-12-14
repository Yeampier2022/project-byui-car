const { body, validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const partModel = require('../models/partModel');
const Order = require('../models/orderModel');


// Validation for creating an order
const orderValidation = [
  // Check if the body is not empty and validate allowed fields
  body().custom(async(value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.status = 400;
      throw error;
    }

    const allowedFields = ['userId', 'items', 'status', 'orderDate'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    const { id } = req.params;
    const existingOrder = await Order.getOrderById(id); 

    if (!existingOrder) {
      const error = new Error(`Order with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const isModified = allowedFields.some(
      (field) => req.body[field] !== undefined && req.body[field] !== existingOrder[field]
    );

    if (!isModified) {
      const error = new Error('No changes detected. Update request ignored.');
      error.status = 400;
      throw error;
    }

    return true;
  }),

  body('userId')
    .custom(async (userId, { req }) => {
      // Retrieve the use ID from the session
      const sessionUserId = req.session?.user?._id;
      if (!sessionUserId) {
        const error = new Error('User not authenticated.');
        error.status = 401;
        throw error;
      }

      // Check if the useId from the session exists in the database
      const userExists = await userModel.getUserById(sessionUserId);
      if (!userExists) {
        const error = new Error('User with this ID does not exist.');
        error.status = 404;
        throw error;
      }

      return true;
    }),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array.')
    .custom(async (items) => {
      // Validate individual items
      const invalidItem = items.find(
        (item) =>
          !item.partId ||
          !item.quantity ||
          !/^[a-fA-F0-9]{24}$/.test(item.partId) ||
          typeof item.quantity !== 'number' ||
          item.quantity < 1
      );
      if (invalidItem) {
        throw new Error(
          'Each item must contain a valid partId and quantity (positive integer).'
        );
      }

      // Check if all partIds exist in the database
      const partIds = items.map((item) => item.partId);
      const allExist = await partModel.getSparePartsByIds(partIds);
      if (!allExist) {
        throw new Error('One or more partId values do not exist in the database.');
      }

      return true;
    }),

  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['Pending', 'Shipped', 'Completed'])
    .withMessage('Status must be one of: Pending, Shipped, Completed.'),

  body('orderDate')
    .optional()
    .isISO8601()
    .withMessage('Order date must be a valid ISO 8601 date.'),
];

// Validation for updating an order
const orderUpdateValidation = [
  body().custom(async(value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.status = 400;
      throw error;
    }

    const { id } = req.params;
    const existingOrder = await Order.getOrderById(id);

    if (!existingOrder) {
      const error = new Error(`Order with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    const allowedFields = ['items', 'status'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const filteredExistingOrder = Object.entries(existingOrder.toObject())
      .filter(([key]) => allowedFields.includes(key))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const filteredRequestBody = Object.entries(req.body)
      .filter(([key]) => allowedFields.includes(key))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const isIdentical = Object.keys(filteredRequestBody).every(
      (key) => filteredRequestBody[key] === filteredExistingOrder[key],
    );

    if (isIdentical) {
      const error = new Error('No changes detected. Update request ignored.');
      throw error;
    }

    return true;
  }),

  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array.')
    .custom(async (items) => {
      // Validate individual items
      const invalidItem = items.find(
        (item) =>
          !item.partId ||
          !item.quantity ||
          !/^[a-fA-F0-9]{24}$/.test(item.partId) ||
          typeof item.quantity !== 'number' ||
          item.quantity < 1
      );
      if (invalidItem) {
        throw new Error(
          'Each item must contain a valid partId and quantity (positive integer).'
        );
      }

      // Check if all partIds exist in the database
      const partIds = items.map((item) => item.partId);
      const allExist = await partModel.getSparePartsByIds(partIds);
      if (!allExist) {
        throw new Error('One or more partId values do not exist in the database.');
      }

      return true;
    }),

  body('status')
    .optional()
    .isIn(['Pending', 'Shipped', 'Completed'])
    .withMessage('Status must be one of: Pending, Shipped, Completed.'),
];

// Middleware to handle validation results
const validateResults = () => (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({ message: err.msg }));
  const errorMessage = extractedErrors.map((e) => e.message).join(', ');

  const error = new Error(errorMessage);
  error.status = 422; // Unprocessable Entity
  return next(error);
};

module.exports = {
  orderValidation,
  orderUpdateValidation,
  validateResults,
};
