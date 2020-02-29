const Joi = require("joi");
const mongoose = require("mongoose");

function validateSection(section) {
  const schema = {
    isRegular: Joi.boolean().default(true),
    school_year: Joi.object({
      start: Joi.number().required(),
      end: Joi.number().required()
    }),
    year_level: Joi.number()
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
    adviser_id: Joi.objectId,
    subject_teachers: Joi.array().items(
      Joi.object({
        learning_area: Joi.string()
          .required()
          .trim()
          .valid("Filipino"),
        //TODO: add the other learning areas options to Joi validation
        id: Joi.objectId
      })
    ),
    students: Joi.array().items(mongoose.Schema.Types.ObjectId)
  };

  return Joi.validate(section, schema);
}

exports.Section = Section;
exports.validateSection = validateSection;
