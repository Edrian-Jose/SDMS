const express = require("express");
const router = express.Router();
const { Teacher, validateTeacher } = require("../models/teacher");
const SystemLog = require("../models/log");
router.get("/", async (req, res) => {
  const teacher_list = await Teacher.find({ active: true }).select({
    name: 1,
    "assignments.category": 1
  });
  const teachers = teacher_list.map(teacher => {
    return {
      name: teacher.fullname(),
      postions: teacher.assignments.map(assignment => assignment.category)
    };
  });
  const msg = `${req.user.name} queries all active teachers in database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teachers);
});
router.post("/", async (req, res) => {
  const { error } = validateTeacher(req.body);
  if (error) return res.status(400).send("Bad request, invalid teacher object");

  const duplicateEmployeeNum = await Teacher.findOne({
    employee_number: req.body.employee_number
  });

  if (duplicateEmployeeNum) {
    return res
      .status(400)
      .send("Bad request, employee_number already registered");
  }

  const duplicateTeacher = await Teacher.findOne({
    "name.last": req.body.name.last,
    "name.first": req.body.name.first,
    "name.middle": req.body.name.middle
  });
  if (duplicateTeacher)
    return res.status(400).send("Bad request, name already registered");
  //TODO: encrypt password
  const teacher = new Teacher(req.body);
  await teacher.save();
  const msg = `${
    req.user.name
  } register ${teacher.fullname()} in teachers database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teacher);
});
router.get("/:id", async (req, res) => {
  res.status(200).send("req");
});
router.put("/:id", async (req, res) => {
  res.status(200).send("req");
});
router.put("/:id/resetpassword", async (req, res) => {
  res.status(200).send("req");
});
router.post("/:id/logs", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
