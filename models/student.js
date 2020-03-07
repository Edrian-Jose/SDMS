const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment");

const { uniqueString, string, joi_string } = require("./_template_schemas.js");

const studentSchema = new mongoose.Schema({
  lrn: {
    type: Number,
    unique: true,
    max: 999999999999,
    min: 1,
    required: true
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
      required: true,
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
  religion: {
    type: String,
    uppercase: true,
    default: "UNSPECIFIED",
    trim: true,
    required: true,
    minlength: 2
  },
  address: {
    house: {
      type: String,
      default: "UNSPECIFIED",
      required: true,
      trim: true,
      minlength: 2
    },
    barangay: {
      type: String,
      default: "UNSPECIFIED",
      trim: true,
      required: true
    },
    municipality: {
      type: String,
      default: "UNSPECIFIED",
      trim: true,
      required: true
    },
    province: {
      type: String,
      default: "UNSPECIFIED",
      required: true,
      trim: true
    }
  },
  parents_name: {
    father: {
      type: String,
      uppercase: true,
      trim: true,
      default: "UNSPECIFIED",
      required: true,
      minlength: 2
    },
    mothers_maiden: {
      type: String,
      uppercase: true,
      trim: true,
      default: "UNSPECIFIED",
      required: true,
      minlength: 2
    }
  },
  guardian: {
    name: string,
    relationship: string,
    contact: Number
  }
});

studentSchema.methods.getFullName = function() {
  const last = (this.name.last ? this.name.last : this.name.middle) + ", ";
  const first = this.name.first + " ";
  const ext = this.name.ext ? this.name.ext + " " : "";
  const middle =
    (this.name.last && this.name.middle ? this.name.middle : "") + " ";
  return last + first + ext + middle;
};

studentSchema.methods.getLrn = function() {
  const lrn = this.lrn;
  let lrnString = new Array(12).join("0").slice(-12) + lrn;
  return lrnString;
};
const Student = mongoose.model("Student", studentSchema);

function validateStudent(student) {
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
        .required()
        .uppercase()
        .trim()
        .min(2),
      middle: Joi.string()
        .uppercase()
        .trim()
        .min(2),
      extension: Joi.string()
        .optional()
        .length(3)
    })
      .required()
      .or("last", "middle"),
    sex: Joi.string()
      .required()
      .uppercase()
      .valid("MALE", "FEMALE"),
    birthdate: Joi.date()
      .required()
      .max(
        moment()
          .subtract(10, "years")
          .toJSON()
      ),
    mother_tongue: joi_string,
    ip: Joi.boolean().optional(),
    religion: Joi.string()
      .uppercase()
      .trim()
      .min(2),
    address: Joi.object({
      house: Joi.string()
        .trim()
        .min(2),
      barangay: Joi.string().trim(),
      municipality: Joi.string().trim(),
      province: Joi.string().trim()
    }),
    parents_name: Joi.object({
      father: Joi.string()
        .uppercase()
        .trim()
        .min(2),
      mothers_maiden: Joi.string()
        .uppercase()
        .trim()
        .min(2)
    })
      .required()
      .or("father", "mothers_maiden"),
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
