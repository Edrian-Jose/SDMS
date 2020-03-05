const express = require("express");
const helmet = require("helmet");
const authn = require("../middleware/authn");
const { authz } = require("../middleware/authz");
const student = require("../routes/student");
const teacher = require("../routes/teacher");
const section = require("../routes/section");
const notice = require("../routes/notice");
const log = require("../routes/log");
const enroll = require("../routes/enroll");
const download = require("../routes/download");
const login = require("../routes/login");

const error = require("../middleware/error");

module.exports = function(app) {
  app.use(helmet());
  app.use(express.json());
  app.use("/api/login", login);
  app.use(authn);
  app.use(authz);
  app.use("/api/students", student);
  app.use("/api/teachers", teacher);
  app.use("/api/sections", section);
  app.use("/api/enroll", enroll);
  app.use("/api/notices", notice);
  app.use("/api/downloads", download);
  app.use("/api/logs", log);
  app.use(error);
};
