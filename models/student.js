const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");

const { uniqueString, string, joi_string } = require("./_template_schemas.js");

const studentSchema = {
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
  sex: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 10,
    uppercase: true,
    enum: ["MALE", "FEMALE"]
  },
  birthdate: {
    type: Date,
    required: true,
    max: moment().subtract(10, "years")
  },
  mother_tongue: string,
  ip: {
    type: Boolean,
    optional: true
  },
  religion: string,
  address: {
    house: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    barangay: {
      type: String,
      trim: true,
      required: true
    },
    municipality: {
      type: String,
      trim: true,
      required: true
    },
    province: {
      type: string,
      required: true,
      trim: true
    }
  },
  parents_name: {
    father: string,
    mothers_maiden: string
  },
  guardian: {
    name: string,
    relationship: string,
    contact: Number
  }
};

const Student = mongoose.Model("Student", studentSchema);

function validateStudent(student) {
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
    sex: Joi.string()
      .required()
      .uppercase()
      .valid("MALE", "FEMALE"),
    birthdate: Joi.date()
      .required()
      .max(moment().subtract(10, "years")),
    mother_tongue: joi_string,
    ip: Joi.boolean().optional(),
    religion: joi_string,
    address: Joi.object({
      house: Joi.string()
        .required()
        .trim()
        .min(2),
      barangay: Joi.string()
        .trim()
        .required(),
      municipality: Joi.string()
        .trim()
        .required(),
      province: Joi.string()
        .required()
        .trim()
    }),
    parents_name: Joi.object({
      father: joi_string,
      mothers_maiden: joi_string
    }),
    guardian: Joi.object({
      name: joi_string,
      relationship: joi_string,
      contact: Joi.number()
    })
  };

  return Joi.validate(student, schema);
}

exports.Student = Student;
exports.validateStudent = validateStudent;
