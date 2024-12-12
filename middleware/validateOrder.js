const { body, validationResult } = require('express-validator');

// Order validation for creating an order
const orderValidation = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required.')
    .isMongoId()
    .withMessage('Client ID must be a valid ObjectId.'),
  body('partId')
    .notEmpty()
    .withMessage('Part ID is required.')
    .isMongoId()
    .withMessage('Part ID must be a valid ObjectId.'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required.')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['pending', 'completed', 'canceled'])
    .withMessage('Status must be one of: pending, completed, canceled.'),
];

// Order validation for updating an order (optional fields allowed)
const orderUpdateValidation = [
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('Client ID must be a valid ObjectId.'),
  body('partId')
    .optional()
    .isMongoId()
    .withMessage('Part ID must be a valid ObjectId.'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer.'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'canceled'])
    .withMessage('Status must be one of: pending, completed, canceled.'),
];

// Validation middleware to check for errors
const validateResults = () => (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({ message: err.msg }));
  const errorMessage = extractedErrors.map((e) => e.message).join(', ');

  const error = new Error(errorMessage);
  error.statusCode = 422; // Unprocessable Entity
  return next(error);
};

module.exports = {
  orderValidation,
  orderUpdateValidation,
  validateResults,
};