const express = require("express");
const router = express.Router();
const { Section, validateSection } = require("../models/section");
const { Enrollee } = require("../models/enrollee");
const { asyncForEach } = require("../plugins/asyncArray");
router.get("/", async (req, res) => {
  res.status(200).send("req");
});

router.post("/", async (req, res) => {
  //TODO: if enrollee has already infos
  const { error } = validateSection(req.body);
  if (error)
    return res.status(400).send("Bad request, section object is invalid");

  const duplicateSection = await Section.findOne({
    "school_year.start": req.body.school_year.start,
    "school_year.end": req.body.school_year.end,
    grade_level: req.body.grade_level,
    number: req.body.number
  });
  if (duplicateSection)
    return res.status(400).send("Bad request, section already exist");

  let enrolled = true;
  await asyncForEach(req.body.students, async function(enrolled_id) {
    enrolled = await Enrollee.findById(enrolled_id);
  });
  if (!enrolled) {
    return res
      .status(400)
      .send("Bad request, one of the section student(s) is not enrolled");
  }

  let classified = false;
  await asyncForEach(req.body.students, async function(enrolled_id) {
    classified = await Section.findOne({ students: enrolled_id });
  });

  if (classified) {
    return res
      .status(400)
      .send("Bad request, one of the section student(s) is already classified");
  }

  const section = new Section(req.body);
  await section.save();
  res.send(section);
});

router.get("/:id", async (req, res) => {
  res.status(200).send("req");
});

router.post("/:id/:studentId", async (req, res) => {
  res.status(200).send("req");
});

router.delete("/:id/:studentId", async (req, res) => {
  res.status(200).send("req");
});

router.delete("/:id", async (req, res) => {
  //TODO: delete also it's references to assigned teachers
  res.status(200).send("req");
});

module.exports = router;
