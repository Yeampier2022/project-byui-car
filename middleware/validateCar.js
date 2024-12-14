const { body, validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const Car = require('../models/carModel')

// Car validation for creating a car
const carValidation = [
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.status = 400;
      throw error;
    }

    const allowedFields = ['make', 'model', 'year', 'engineType', 'VIN', 'category'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.status = 400;
      throw error;
    }

    return true;
  }),

  body('make')
    .notEmpty()
    .withMessage('Make is required.')
    .isString()
    .withMessage('Make must be a string.'),

  body('model')
    .notEmpty()
    .withMessage('Model is required.')
    .isString()
    .withMessage('Model must be a string.'),

  body('year')
    .isInt({ min: 1886, max: new Date().getFullYear() })
    .withMessage('Year must be a valid year.'),

  body('engineType')
    .isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid'])
    .withMessage('Engine Type must be one of: Petrol, Diesel, Electric, Hybrid.'),

  body('VIN')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be 17 characters long.')
    .isString()
    .withMessage('VIN must be a string.'),

  body('category')
    .isIn(['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Convertible'])
    .withMessage('Category must be one of: Sedan, SUV, Truck, Coupe, Hatchback, Convertible.'),

  body('ownerId')
    .custom(async (ownerId, { req }) => {
      // Retrieve the owner ID from the session
      const sessionOwnerId = req.session?.user?._id;
      if (!sessionOwnerId) {
        const error = new Error('User not authenticated.');
        error.status = 401;
        throw error;
        next(error)
      }

      // Check if the ownerId from the session exists in the database
      const ownerExists = await userModel.getUserById(sessionOwnerId);
      if (!ownerExists) {
        const error = new Error('Owner with this ID does not exist.');
        error.status = 404;
        throw error;
      }

      return true;
    }),
];

// Car validation for updating a car
const carUpdateValidation = [
  body().custom(async (value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.status = 400;
      throw error;
    }

    const { id } = req.params;
    const existingCar = await Car.getCarById(id);

    if (!existingCar) {
      const error = new Error(`Car with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    const allowedFields = ['make', 'model', 'year', 'engineType', 'VIN', 'category'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const filteredExistingCar = Object.entries(existingCar.toObject())
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
      (key) => filteredRequestBody[key] === filteredExistingCar[key],
    );

    if (isIdentical) {
      const error = new Error('No changes detected. Update request ignored.');
      throw error;
    }

    return true;
  }),

  body('make')
    .optional()
    .isString()
    .withMessage('Make must be a string.'),

  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string.'),

  body('year')
    .optional()
    .isInt({ min: 1886, max: new Date().getFullYear() })
    .withMessage('Year must be a valid year.'),

  body('engineType')
    .optional()
    .isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid'])
    .withMessage('Engine Type must be one of: Petrol, Diesel, Electric, Hybrid.'),

  body('VIN')
    .optional()
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be 17 characters long.'),

  body('category')
    .optional()
    .isIn(['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Convertible'])
    .withMessage('Category must be one of: Sedan, SUV, Truck, Coupe, Hatchback, Convertible.')
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
  error.status = 422;
  return next(error);
};

module.exports = {
  carValidation,
  carUpdateValidation,
  validateResults,
};
