const { body, validationResult } = require('express-validator');

// User validation for creating a user
const userValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required.')
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
  body('githubId')
    .optional()
    .isInt()
    .withMessage('GitHub ID must be an integer.'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Invalid avatar URL format.')
];

// User validation for updating a user (optional fields allowed)
const userUpdateValidation = [
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
  body('githubId')
    .optional()
    .isInt()
    .withMessage('GitHub ID must be an integer.'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Invalid avatar URL format.')
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
  userValidation,
  userUpdateValidation,
  validateResults
};