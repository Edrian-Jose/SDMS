const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");
const { uniqueString, joi_unique_string } = require("./_template_schemas.js");

const teacherSchema = {
  name: {
    first: uniqueString,
    middle: uniqueString,
    last: uniqueString
  },
  birthday: {
    type: Date,
    required: true
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
      first: joi_unique_string,
      middle: joi_unique_string,
      last: joi_unique_string
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
