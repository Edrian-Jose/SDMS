const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const moment = require("moment");
const config = require("config");
const { uniqueString, joi_string } = require("./_template_schemas.js");

const teacherSchema = new mongoose.Schema({
  name: {
    first: uniqueString,
    middle: uniqueString,
    last: uniqueString
  },
  birthdate: {
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
      sections: [mongoose.Schema.Types.ObjectId]
    }
  ]
});

teacherSchema.methods.generateAuthToken = function() {
  const unsignedObj = {
    _id: this._id,
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

const Teacher = mongoose.model("Teacher", teacherSchema);

function validateTeacher(teacher) {
  const schema = {
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
    employee_number: Joi.number()
      .required()
      .min(1)
      .max(9999999),
    password: Joi.string()
      .required()
      .min(7),
    assignments: Joi.array().items({
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
      sections: Joi.array()
        .items(Joi.objectId())
        .min(1)
    })
  };

  return Joi.validate(teacher, schema);
}

exports.Teacher = Teacher;
exports.validateTeacher = validateTeacher;
