const Joi = require("joi");
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  request: {
    path: String,
    method: String,
    authorized: Boolean
  },
  response: {
    status: Number,
    message: String
  }
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
