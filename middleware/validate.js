const validator = require("../helpers/validate");

const saveEmployee = async (req, res, next) => {
  const validateEmployee = {
    name: "required|string",
    lastname: "required|string",
    age: "required|integer",
    email: "required|email",
    departmen: "required|string",
  };

  validator(req.body, validateEmployee, {}, (err, status) => {
    if (!status) {
      res.status(400).json({
        status: 400,
        error: err,
      });
    } else {
      next();
    }
  });
};

module.exports = { saveEmployee };
