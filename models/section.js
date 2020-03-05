const Joi = require("joi");
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  isRegular: {
    type: Boolean,
    default: true
  },
  school_year: {
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    }
  },
  grade_level: {
    type: Number,
    required: true,
    min: 7,
    max: 10
  },
  number: {
    type: Number,
    min: 1,
    max: 15
  },
  name: {
    type: String,
    optional: true,
    trim: true,
    minlength: 2
  },
  adviser_id: mongoose.Schema.Types.ObjectId,
  subject_teachers: [
    {
      learning_area: {
        type: String,
        required: true,
        trim: true,
        enum: ["Filipino"]
        //TODO: add the other learning areas options to schema
      },
      id: mongoose.Schema.Types.ObjectId
    }
  ],
  students: [mongoose.Schema.Types.ObjectId]
});

const Section = mongoose.model("Section", sectionSchema);
function validateSection(section) {
  const schema = {
    isRegular: Joi.boolean().default(true),
    school_year: Joi.object({
      start: Joi.number().required(),
      end: Joi.number().required()
    }),
    grade_level: Joi.number()
      .required()
      .min(7)
      .max(10),
    number: Joi.number()
      .required()
      .min(1)
      .max(15),
    name: Joi.string()
      .optional()
      .trim()
      .min(2),
    adviser_id: Joi.objectId(),
    subject_teachers: Joi.array().items(
      Joi.object({
        learning_area: Joi.string()
          .required()
          .trim()
          .valid("Filipino"),
        //TODO: add the other learning areas options to Joi validation
        id: Joi.objectId()
      })
    ),
    students: Joi.array().items(Joi.objectId())
  };

  return Joi.validate(section, schema);
}

exports.Section = Section;
exports.validateSection = validateSection;
