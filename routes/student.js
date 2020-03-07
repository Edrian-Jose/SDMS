const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { Student, validateStudent } = require("../models/student");
const { Teacher } = require("../models/teacher");
const { Section } = require("../models/section");
const { asyncForEach } = require("../plugins/asyncArray");

router.get("/", async (req, res) => {
  const teacher = await Teacher.findById(req.user._id);
  if (!teacher) {
    return res.send("Looks like your account id is invalid");
  }
  const sectionIds = [];
  teacher.assignments.forEach(assignment => {
    assignment.sections.forEach(sectionId => {
      sectionIds.push(sectionId);
    });
  });

  const students = [];
  await asyncForEach(sectionIds, async sectionId => {
    const section = await Section.findById(sectionId);
    const studentIds = section.students;
    await asyncForEach(studentIds, async studentId => {
      const studentDoc = await Student.findById(studentId);
      students.push({
        _id: studentDoc._id,
        lrn: studentDoc.getLrn(),
        fullname: studentDoc.getFullName(),
        grade: section.grade_level,
        section: section.number
      });
    });
  });
  res.send(students);
});

router.post("/", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send("Bad request, invalid student object");

  const duplicateLrn = await Student.findOne({ lrn: req.body.lrn });
  if (duplicateLrn)
    return res.status(400).send("Bad request, lrn already registered");

  const duplicateStudent = await Student.findOne({
    "name.last": req.body.name.last,
    "name.first": req.body.name.first,
    "name.middle": req.body.name.middle,
    "name.extension": req.body.name.extension
  });
  if (duplicateStudent)
    return res.status(400).send("Bad request, name already registered");

  const student = new Student(req.body);
  await student.save();
  res.send(student);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Bad request, id is not a valid object-id");
  const student = await Student.findById(req.params.id);
  if (!student)
    return res
      .status(400)
      .send("Bad request, student with the given id cannot found");
  res.send(student);
});

router.put("/:id", async (req, res) => {
  res.status(200).send("req");
});
router.post("/:id", async (req, res) => {
  res.status(200).send("req");
});

router.get("/:id/downloads/sf10", async (req, res) => {
  res.status(200).send("req");
});

router.get("/:id/downloads/reportCard", async (req, res) => {
  res.status(200).send("req");
});

router.post("/:id/grades", async (req, res) => {
  res.status(200).send("req");
});

router.delete("/:id/grades", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
