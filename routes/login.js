const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const validate = require("../models/user");
const { Teacher } = require("../models/teacher");
const SystemLog = require("../models/log");
const moment = require("moment");
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await Teacher.findOne({
    employee_number: req.body.employee_number
  });
  if (!user) return res.status(400).send("Unregistered employee number");
  req.user = { _id: user._id };
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    const msg = `${user.fullname()} is trying to login with an invalid password`;
    await new SystemLog(SystemLog.createLog(req, res, msg)).save();
    return res.status(400).send("Invalid employee number or password");
  }

  const msg = `${user.fullname()} logged in at ${moment().format("LLL")}`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(user.generateAuthToken());
});

router.delete("/:id", async (req, res) => {
  user = req.user;
  const msg = `${user.name} logged out at ${moment().format("LLL")}`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send("You've been successfully logged out!");
});

module.exports = router;
