const Joi = require("joi");

module.exports.firstname = {
  type: String,
  uppercase: true,
  trim: true,
  required: true,
  minlength: 2,
  maxlength: 50
};

module.exports.name = {
  type: String,
  uppercase: true,
  trim: true,
  required: true,
  minlength: 2,
  maxlength: 20
};

module.exports.joi_name = Joi.string()
  .required()
  .uppercase()
  .trim()
  .min(2)
  .max(20);

module.exports.joi_firstname = Joi.string()
  .required()
  .uppercase()
  .trim()
  .min(2)
  .max(50);
