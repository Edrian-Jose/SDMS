const Joi = require("joi");
const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  //TODO: on encoding of grades it will find a record with completed is falsem if nothing founf it will create a record
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
      type: String,
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
    required: true,
    trim: true
  },
  subjects: [
    {
      learning_area: {
        type: String,
        required: true,
        trim: true,
        enum: [
          "Filipino",
          "English",
          "Mathematics",
          "Science",
          "Araling Panlipunan (AP)",
          "Edukasyon sa Pagpapakatao (EsP)",
          "Technology and Livelihood Education (TLE)",
          "MAPEH",
          "Music",
          "Arts",
          "Physical Education",
          "Health"
        ]
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
        min: 0,
        max: 100
      },
      remarks: { type: String }
    }
  ],
  gen_average: {
    type: Number,
    min: 0,
    max: 100
  },
  scholastic_status: {
    type: String
  },
  remedials: {
    start_date: { type: Date },
    end_date: { type: Date },
    subjects: [
      {
        learning_area: {
          type: String,
          required: true,
          trim: true,
          enum: [
            "Filipino",
            "English",
            "Mathematics",
            "Science",
            "Araling Panlipunan (AP)",
            "Edukasyon sa Pagpapakatao (EsP)",
            "Technology and Livelihood Education (TLE)",
            "MAPEH",
            "Music",
            "Arts",
            "Physical Education",
            "Health"
          ]
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
    owner_id: Joi.objectId().required(),
    completed: Joi.boolean().default(true),
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
    //TODO: insert values to optional values below when downloading sf10
    adviser: Joi.string()
      .trim()
      .required(),
    subjects: Joi.array().items(
      Joi.object({
        learning_area: Joi.string()
          .required()
          .trim()
          .valid(
            "Filipino",
            "English",
            "Mathematics",
            "Science",
            "Araling Panlipunan (AP)",
            "Edukasyon sa Pagpapakatao (EsP)",
            "Technology and Livelihood Education (TLE)",
            "MAPEH",
            "Music",
            "Arts",
            "Physical Education",
            "Health"
          ),
        quarter_rating: Joi.array().items(
          Joi.number()
            .min(0)
            .max(100)
            .integer()
        ),
        quarter_rating_ave: Joi.number()
          .min(0)
          .max(100)
          .integer(),
        remarks: Joi.string()
      })
    ),
    gen_average: Joi.number()
      .min(0)
      .max(100)
      .integer(),
    scholastic_status: Joi.string(),
    remedials: Joi.object({
      start_date: Joi.date().required(),
      end_date: Joi.date().required(),
      subjects: Joi.array().items(
        Joi.object({
          learning_area: Joi.string()
            .required()
            .trim()
            .valid(
              "Filipino",
              "English",
              "Mathematics",
              "Science",
              "Araling Panlipunan (AP)",
              "Edukasyon sa Pagpapakatao (EsP)",
              "Technology and Livelihood Education (TLE)",
              "MAPEH",
              "Music",
              "Arts",
              "Physical Education",
              "Health"
            ),
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
