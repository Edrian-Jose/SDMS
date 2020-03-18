const Joi = require("joi");

module.exports = function validateUser(user) {
  const schema = {
    employee_number: Joi.number()
      .required()
      .min(1)
      .max(9999999),
    password: Joi.string()
      .required()
      .min(7)
  };

  return Joi.validate(user, schema);
};
