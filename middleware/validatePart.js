const { body, validationResult } = require('express-validator');

// Spare Part validation for creating a spare part
const sparePartValidation = [
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const allowedFields = ['name', 'description', 'price', 'stock', 'compatibleCars', 'category'];

    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    return true;
  }),

  body('name')
    .notEmpty()
    .withMessage('Name is required.')
    .isString()
    .withMessage('Name must be a string.')
    .isLength({ min: 1 })
    .withMessage('Name must be at least 1 character long.'),

  body('description')
    .notEmpty()
    .withMessage('Description is required.')
    .isString()
    .withMessage('Description must be a string.')
    .isLength({ min: 1 })
    .withMessage('Description must be at least 1 character long.'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number.'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.'),

  body('compatibleCars')
    .isArray({ min: 1 })
    .withMessage('Compatible cars must be an array with at least one car type.')
    .custom((value) => {
      const validCarTypes = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"];
      const invalidCarTypes = value.filter(carType => !validCarTypes.includes(carType));
      if (invalidCarTypes.length > 0) {
        throw new Error(`Compatible cars must be one of: ${validCarTypes.join(', ')}.`);
      }
      return true;
    }),

  body('category')
    .notEmpty()
    .withMessage('Category is required.')
    .isString()
    .withMessage('Category must be a string.')
    .isLength({ min: 1 })
    .withMessage('Category must be at least 1 character long.')
];

// Spare Part validation for updating a spare part
const sparePartUpdateValidation = [
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const allowedFields = ['name', 'description', 'price', 'stock', 'compatibleCars', 'category'];

    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    return true;
  }),

  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string.')
    .isLength({ min: 1 })
    .withMessage('Name must be at least 1 character long.'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string.')
    .isLength({ min: 1 })
    .withMessage('Description must be at least 1 character long.'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number.'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.'),

  body('compatibleCars')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Compatible cars must be an array with at least one car type.')
    .custom((value) => {
      const validCarTypes = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible"];
      const invalidCarTypes = value.filter(carType => !validCarTypes.includes(carType));
      if (invalidCarTypes.length > 0) {
        throw new Error(`Compatible cars must be one of: ${validCarTypes.join(', ')}.`);
      }
      return true;
    }),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string.')
    .isLength({ min: 1 })
    .withMessage('Category must be at least 1 character long.')
];

// Validation middleware to check for errors
const validateResults = () => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({ message: err.msg }));
    const errorMessage = extractedErrors.map((e) => e.message).join(', ');

    // Create and forward the error
    const error = new Error(errorMessage);
    error.statusCode = 422;
    return next(error);  // Forward to error handler
  }
  return next();  // Proceed if no validation errors
};

module.exports = {
  sparePartValidation,
  sparePartUpdateValidation,
  validateResults,
};
