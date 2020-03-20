const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");
const Fawn = require("fawn");

module.exports = function() {
  const db = config.get("db");

  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(() => {
      winston.info(`Connected to ${db}...`);
      Fawn.init(mongoose);
      winston.info(`Initialized Fawn`);
    });
};
