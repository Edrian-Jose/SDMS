const Joi = require("joi");

module.exports.uniqueString = {
  type: String,
  uppercase: true,
  trim: true,
  required: true,
  minlength: 2
};

module.exports.string = {
  type: String,
  uppercase: true,
  trim: true,
  required: true,
  minlength: 2
};

module.exports.joi_string = Joi.string()
  .required()
  .uppercase()
  .trim()
  .min(2);

const school = {
  name: {
    type: String,
    required: true,
    default: "Pres. Sergio Osmeña Junior High School",
    minlength: 5
  }
};
