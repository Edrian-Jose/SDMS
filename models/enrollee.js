const Joi = require("joi");
const mongoose = require("mongoose");
const { uniqueString, string, joi_string } = require("./_template_schemas.js");

const enrolleeSchema = {
  lrn: {
    type: number,
    unique: true,
    max: 999999999999,
    min: 1,
    required: true
  },
  name: {
    last: uniqueString,
    first: uniqueString,
    middle: uniqueString,
    extension: {
      type: String,
      optional: true,
      min: 3,
      max: 3
    }
  },
  record_id: mongoose.Schema.Types.ObjectId
};

const Enrollee = mongoose.Model("Enrollee", enrolleeSchema);

function validateEnrollee(enrollee) {
  const schema = {
    lrn: Joi.number()
      .max(999999999999)
      .min(1)
      .integer()
      .required(),
    name: Joi.object({
      last: joi_string,
      first: joi_string,
      middle: joi_string,
      extension: Joi.string()
        .optional()
        .length(3)
    }),
    record_id: Joi.objectId().optional()
  };
  return Joi.validate(enrollee, schema);
}

module.exports.Enrollee = Enrollee;
module.exports.validateEnrollee = validateEnrollee;
