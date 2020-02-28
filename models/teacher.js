const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");

const {
  firstname,
  name,
  joi_name,
  joi_firstname
} = require("./_template_schemas.js");

const teacherSchema = {
  name: {
    first: firstname,
    middle: name,
    last: name
  },
  birthday: {
    type: Date,
    required: true,
    max: moment().subtract(10, "years")
  },
  employee_number: {
    type: Number,
    min: 1,
    max: 9999999,
    required: true
  },
  password: {
    type: String,
    minlength: 7,
    required: true
  },
  assignment: [
    {
      category: {
        type: String,
        default: "Subject Teacher",
        enum: [
          "Subject Teacher",
          "Adviser",
          "Registrar",
          "Admin",
          "Curriculum Chairman"
        ],
        trim: true
      },
      authorization_level: Number
    }
  ]
};

const Teacher = mongoose.Model("Teacher", teacherSchema);

function validateTeacher(teacher) {
  const schema = {
    name: Joi.object({
      first: joi_firstname,
      middle: joi_name,
      last: joi_name
    }),
    birthday: Joi.date()
      .required()
      .max(moment().subtract(10, "years")),
    employee_number: Joi.number()
      .required()
      .min(1)
      .max(9999999),
    password: Joi.string()
      .required()
      .min(7),
    assignment: Joi.array().items({
      category: Joi.string()
        .trim()
        .default("Subject Teacher")
        .valid(
          "Subject Teacher",
          "Adviser",
          "Registrar",
          "Admin",
          "Curriculum Chairman"
        )
    })
  };

  return Joi.validate(teacher, schema);
}

exports.Teacher = Teacher;
exports.validateTeacher = validateTeacher;
