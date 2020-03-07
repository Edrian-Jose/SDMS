const Joi = require("joi");
const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  owner_id: mongoose.Schema.Types.ObjectId,
  school: {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    id: {
      type: Number,
      required: true,
      min: 1
    },
    district: {
      type: String,
      required: true,
      minlength: 1
    },
    division: {
      type: String,
      required: true,
      minlength: 1
    },
    region: {
      type: string,
      required: true,
      minlength: 1
    }
  },
  grade_level: {
    type: Number,
    required: true,
    min: 7,
    max: 10
  },
  section: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
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
  adviser: {
    type: String,
    trim: true,
    required: true
  },
  subjects: [
    {
      learning_area: {
        type: String,
        required: true,
        trim: true,
        enum: ["Filipino"]
        //TODO: add the other learning areas options to schema
      },
      quarter_rating: [
        {
          type: Number,
          required: true,
          min: 0,
          max: 100
        }
      ],
      quarter_rating_ave: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      remarks: { type: String, required: true, default: "Passed" }
    }
  ],
  gen_average: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  scholastic_status: {
    type: String,
    required: true
  },
  remedials: {
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    subjects: [
      {
        learning_area: {
          type: String,
          required: true,
          trim: true,
          enum: ["Filipino"]
          //TODO: add the other learning areas options to schema
        },
        final_rating: { type: Number, required: true, min: 0, max: 100 },
        remedial_rating: { type: Number, required: true, min: 0, max: 100 },
        recomputed_grade: { type: Number, required: true, min: 0, max: 100 },
        remarks: { type: String, required: true, default: "Passed" }
      }
    ]
  }
});

const ScholaticRecord = mongoose.model("Scholatic-Record", recordSchema);

function validateRecord(record) {
  const schema = {
    school: Joi.object({
      name: Joi.string()
        .required()
        .trim()
        .min(2),
      id: Joi.number()
        .required()
        .min(2)
        .integer(),
      district: Joi.string()
        .required()
        .min(1),
      division: Joi.string()
        .required()
        .min(1),
      region: Joi.string()
        .required()
        .min(1)
    }),
    grade_level: Joi.number()
      .required()
      .min(7)
      .max(10)
      .integer(),
    section: Joi.string()
      .required()
      .trim()
      .min(2),
    school_year: Joi.object({
      start: Joi.number().required(),
      end: Joi.number().required()
    }),
    adviser: Joi.string()
      .trim()
      .required(),
    subjects: Joi.array().items(
      Joi.object({
        learning_area: Joi.string()
          .required()
          .trim()
          .valid("Filipino"),
        //TODO: add the other learning areas options to Joi validation
        quarter_rating: Joi.array().items(
          Joi.number()
            .required()
            .min(0)
            .max(100)
            .integer()
        ),
        quarter_rating_ave: Joi.number()
          .required()
          .min(0)
          .max(100)
          .integer(),
        remarks: Joi.string()
          .required()
          .default("Passed")
      })
    ),
    gen_average: Joi.number()
      .required()
      .min(0)
      .max(100)
      .integer(),
    scholastic_status: Joi.string().required(),
    remedials: Joi.object({
      start_date: Joi.date().required(),
      end_date: Joi.date().required(),
      subjects: Joi.array().items(
        Joi.object({
          learning_area: Joi.string()
            .required()
            .trim()
            .valid("Filipino"),
          //TODO: add the other learning areas options to Joi validation
          final_rating: Joi.number()
            .required()
            .min(0)
            .max(100)
            .integer(),
          recomputed_grade: Joi.number()
            .required()
            .min(0)
            .max(100)
            .integer(),
          remarks: Joi.string()
            .required()
            .default("Passed")
        })
      )
    }).optional()
  };
  return Joi.validate(record, schema);
}

module.exports.ScholaticRecord = ScholaticRecord;
module.exports.validateScholasticRecord = validateRecord;
