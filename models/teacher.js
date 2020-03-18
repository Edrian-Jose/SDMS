const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const moment = require("moment");
const config = require("config");
const { uniqueString, joi_string } = require("./_template_schemas.js");

const teacherSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  name: {
    first: uniqueString,
    middle: uniqueString,
    last: uniqueString
  },
  birthdate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    uppercase: true,
    required: true,
    enum: ["MALE", "FEMALE"]
  },
  employee_number: {
    type: Number,
    min: 1,
    max: 9999999,
    required: true,
    unique: true,
    get: v => {
      return new Array(7).join("0").slice(-7) + v;
    }
  },
  password: {
    type: String,
    minlength: 7,
    required: true
  },
  assignments: [
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
      grade_level: [
        {
          type: Number,
          min: 7,
          max: 10
        }
      ]
    }
  ]
});

teacherSchema.methods.generateAuthToken = function() {
  const unsignedObj = {
    _id: this._id,
    name: this.fullname(),
    roles: this.assignments.map(assignment => {
      switch (assignment.category) {
        case "Adviser":
          return 1;
          break;
        case "Curriculum Chairman":
          return 2;
          break;
        case "Registrar":
          return 3;
          break;
        case "Admin":
          return 4;
          break;
        default:
          return 0;
          break;
      }
    })
  };
  const token = jwt.sign(unsignedObj, config.get("jwtPrivateKey"));
  return token;
};

teacherSchema.methods.fullname = function() {
  const last = (this.name.last ? this.name.last : this.name.middle) + ", ";
  const first = this.name.first + " ";
  const middle =
    (this.name.last && this.name.middle ? this.name.middle : "") + " ";
  return last + first + middle;
};

const Teacher = mongoose.model("Teacher", teacherSchema);

function validateTeacher(teacher) {
  const schema = {
    active: Joi.boolean().default(true),
    name: Joi.object({
      first: joi_string,
      middle: joi_string,
      last: joi_string
    }),
    birthdate: Joi.date()
      .required()
      .max(
        moment()
          .subtract(18, "years")
          .toJSON()
      ),
    gender: Joi.string()
      .uppercase()
      .required()
      .valid("MALE", "FEMALE"),
    employee_number: Joi.number()
      .required()
      .min(1)
      .max(9999999),
    password: Joi.string()
      .required()
      .min(7),
    assignments: Joi.array().items(
      Joi.object({
        category: Joi.string()
          .trim()
          .default("Subject Teacher")
          .valid(
            "Subject Teacher",
            "Adviser",
            "Registrar",
            "Admin",
            "Curriculum Chairman"
          ),
        grade_levels: Joi.array
          .items(
            Joi.number()
              .required()
              .min(7)
              .max(10)
              .integer()
          )
          .optional()
      })
    )
  };

  return Joi.validate(teacher, schema);
}

exports.Teacher = Teacher;
exports.validateTeacher = validateTeacher;
