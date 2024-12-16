const { body, validationResult } = require('express-validator');
const partModel = require('../models/partModel');


// Validation for creating an order
const orderValidation = [
  body().custom(async(value, { req }) => {
    const allowedFields = ['userId', 'items', 'status', 'orderDate'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
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
  body().custom((value, { req, next }) => {
    const allowedFields = ['items', 'status'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
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
