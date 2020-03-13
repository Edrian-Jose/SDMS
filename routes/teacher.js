const express = require("express");
const bcrypt = require("bcrypt");
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
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  const teacher = new Teacher(req.body);
  await teacher.save();
  const msg = `${
    req.user.name
  } register ${teacher.fullname()} in teachers database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teacher);
});
router.get("/:id", async (req, res) => {
  const teacher_information = await Teacher.findById(req.params.id);
  if (!teacher_information)
    return res.status(400).send("Bad request, employee doesn't exist.");
  const msg = `${
    req.user.name
  } query ${teacher_information.fullname()} data in database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teacher_information);
});
router.put("/:id", async (req, res) => {
  req.body.password = "default";
  const { error } = validateTeacher(req.body);
  if (error) return res.status(400).send("Bad request, invalid teacher object");

  let teacher = await Teacher.findById(req.params.id);

  const duplicateEmployeeNum = await Teacher.findOne({
    _id: { $not: { $eq: req.params.id } },
    employee_number: req.body.employee_number
  });

  if (duplicateEmployeeNum) {
    return res
      .status(400)
      .send("Bad request, employee_number already registered");
  }

  const duplicateTeacher = await Teacher.findOne({
    _id: { $not: { $eq: req.params.id } },
    "name.last": req.body.name.last,
    "name.first": req.body.name.first,
    "name.middle": req.body.name.middle
  });
  if (duplicateTeacher)
    return res.status(400).send("Bad request, name already registered");
  req.body.password = teacher.password;
  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body);
  const msg = `${req.user.name} updates ${teacher.fullname()} data in database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teacher);
});

router.put("/:id/resetpassword", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher)
    return res.status(400).send("Bad request, teacher doesn't exist");

  const salt = await bcrypt.genSalt(10);
  teacher.password = await bcrypt.hash(teacher.employee_number, salt);
  await teacher.save();
  const msg = `${req.user.name} resets ${teacher.fullname()} password`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(teacher.fullname());
});
router.post("/:id/logs", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
