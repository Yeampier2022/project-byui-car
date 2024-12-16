const checkEmptyBody = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    const error = new Error('Request body cannot be empty.');
    error.status = 400;
    return next(error);
  }
  next();
};

// Middleware to check if the entity exists (generic for any model)
const checkEntityExists = (model, getByIdMethod) => async (req, res, next) => {
  const { id } = req.params;
  const existingEntity = await model[getByIdMethod](id);

  if (!existingEntity) {
    const error = new Error(`${model.modelName} with ID ${id} not found.`);
    error.status = 404;
    return next(error);
  }

  req.existingEntity = existingEntity; // Attach entity data to request for further use
  next();
};

// Middleware to check for identical data in the request body and existing entity
const checkForIdenticalData = (allowedFields) => (req, res, next) => {
  const filteredExistingEntity = Object.entries(req.existingEntity)
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
    (key) => filteredRequestBody[key] === filteredExistingEntity[key],
  );

  if (isIdentical) {
    const error = new Error('No changes detected. Update request ignored.');
    error.status = 400;
    return next(error);
  }

  next();
};

module.exports = {
  checkEmptyBody,
  checkEntityExists,
  checkForIdenticalData,
};
