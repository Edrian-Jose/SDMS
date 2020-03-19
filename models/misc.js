const Joi = require("joi");

module.exports.validateSectionsAdd = sec => {
  const schema = Joi.array().items(
    Joi.object({
      section_id: Joi.objectId().required(),
      students: Joi.array().items(Joi.objectId())
    })
  );

  return Joi.validate(sec, schema);
};

module.exports.validateSectionsEdit = sec => {
  const schema = {
    number: Joi.number()
      .min(1)
      .max(15)
      .integer(),
    name: Joi.string()
  };

  return Joi.validate(sec, schema);
};
