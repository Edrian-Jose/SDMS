const express = require("express");
const helmet = require("helmet");
const student = require("../routes/student");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(helmet());
  app.use(express.json());
  //app.use("/api/student", student);
  //app.use('/api/genres', genres);
  app.use(error);
};
