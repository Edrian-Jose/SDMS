const Joi = require("joi");
const mongoose = require("mongoose");
const { uniqueString, string, joi_string } = require("./_template_schemas.js");

const enrolleeSchema = new mongoose.Schema({
  lrn: {
    type: Number,
    unique: true,
    max: 999999999999,
    min: 1,
    required: true,
    get: lrn => {
      return new Array(12).join("0").slice(-12) + lrn;
    }
  },
  name: {
    last: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 2
    },
    first: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 2
    },
    middle: {
      type: String,
      uppercase: true,
      trim: true,
      minlength: 2
    },
    extension: {
      type: String,
      optional: true
    }
  },
  classification: {
    grade_level: {
      type: Number,
      required: true,
      min: 7,
      max: 10
    },
    section: {
      type: Number,
      min: 1,
      max: 15
    }
  },
  dataProcessed: {
    type: Boolean,
    required: true,
    default: false
  }
});

enrolleeSchema.methods.getFullName = function() {
  const last = (this.name.last ? this.name.last : this.name.middle) + ", ";
  const first = this.name.first + " ";
  const ext = this.name.ext ? this.name.ext + " " : "";
  const middle =
    (this.name.last && this.name.middle ? this.name.middle : "") + " ";
  return last + first + ext + middle;
};

const Enrollee = mongoose.model("Enrollee", enrolleeSchema);

function validateEnrollee(enrollee) {
  const schema = {
    lrn: Joi.number()
      .max(999999999999)
      .min(1)
      .integer()
      .required(),
    name: Joi.object({
      last: Joi.string()
        .uppercase()
        .trim()
        .min(2),
      first: Joi.string()
        .uppercase()
        .trim()
        .min(2),
      middle: Joi.string()
        .uppercase()
        .trim()
        .min(2),
      extension: Joi.string().optional()
    }),
    classification: Joi.object({
      grade_level: Joi.number()
        .required()
        .min(7)
        .max(10)
        .integer(),
      section: Joi.number()
        .min(1)
        .max(15)
        .integer()
    }).with("section", "grade_level"),
    dataProcessed: Joi.boolean().default(false)
  };
  return Joi.validate(enrollee, schema);
}

module.exports.Enrollee = Enrollee;
module.exports.validateEnrollee = validateEnrollee;
