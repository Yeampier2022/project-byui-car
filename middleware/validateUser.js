const { body, validationResult } = require('express-validator');

// User validation for updating a user (optional fields allowed)
const userUpdateValidation = [
  body().custom(async (value, { req }) => {
    const allowedFields = ['name', 'email', 'role'];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
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