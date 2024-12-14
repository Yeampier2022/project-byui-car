const { body, validationResult } = require('express-validator');
const User = require('../models/userModel')

// User validation for updating a user (optional fields allowed)
const userUpdateValidation = [
  body().custom(async (value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      const error = new Error('Request body cannot be empty.');
      error.status = 400;
      throw error;
    }

    const allowedFields = ['name', 'email', 'role'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const { id } = req.params;
    const existingUser = await User.getUserById(id); 

    if (!existingUser) {
      const error = new Error(`User with ID ${id} not found.`);
      error.status = 404;
      throw error;
    }

    const filteredExistingUser = Object.entries(existingUser.toObject())
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
      (key) => filteredRequestBody[key] === filteredExistingUser[key],
    );

    if (isIdentical) {
      const error = new Error('No changes detected. Update request ignored.');
      throw error;
    }

    return true;
  }),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string.'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format.'),
  body('role')
    .optional()
    .isIn(['client', 'admin', 'employee'])
    .withMessage('Invalid role.'),
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
  error.status = 422; // Unprocessable Entity
  return next(error);
};

module.exports = {
  userUpdateValidation,
  validateResults
};