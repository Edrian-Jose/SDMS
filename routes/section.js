const express = require("express");
const router = express.Router();
const { Section, validateSection } = require("../models/section");
const { validateSectionsAdd, validateSectionsEdit } = require("../models/misc");
const { Enrollee } = require("../models/enrollee");
const SystemLog = require("../models/log");
const { asyncForEach } = require("../plugins/asyncArray");

router.get("/", async (req, res) => {
  const sections = await Section.find({ chairman_id: req.user._id });
  res.send(sections);
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

  let enrolled = false;
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
  //TODO: test if student is enrolled in the same grade level as the section it was classified

  const section = new Section(req.body);
  await section.save();
  const msg = `${req.user.name} registers/creates the section ${
    section.grade_level
  }-${section.number} ${
    section.name ? "(" + section.name + ")" : ""
  } in sections database`;
  await new SystemLog(SystemLog.createLog(req, res, msg)).save();
  res.send(section);
});

router.get("/:id", async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");
  //test if the section chairman is this chairman
  const chairman_id = req.user._id;
  if (section.chairman_id != chairman_id)
    return res
      .status(403)
      .send("Trying to access a section you're not handling");

  const duplicateSection = await Section.findOne({
    _id: {
      $not: {
        $eq: req.params.id
      }
    },
    grade_level: section.grade_level,
    number: req.body.number
  });

  if (duplicateSection)
    return res
      .status(400)
      .send(
        `Another section, already owns the section number ${req.body.number}`
      );

  if (req.body.number) section.number = req.body.number;
  if (req.body.name) section.name = req.body.name;
  const updatedSection = await section.save();
  //if all pass send the section
  res.send(updatedSection);
});

router.put("/:id", async (req, res) => {
  const { error } = validateSectionsEdit(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");
  //test if the section chairman is this chairman
  const chairman_id = req.user._id;
  if (section.chairman_id != chairman_id)
    return res
      .status(403)
      .send("Trying to access a section you're not handling");
  //if found, error
  //if all pass put
  res.status(200).send("req");
});

router.post("/:id/adviser", async (req, res) => {
  //query for the section, if not found -> error
  //query for the teacher, if not found -> error
  //if all pass add adviser_id to the section
  res.status(200).send("req");
});

router.post("/:id/teacher", async (req, res) => {
  //query for the section, if not found -> error
  //query for the teacher, if not found -> error
  //test if section already has a teacher for that learning area
  //if all pass add teacher_id and learning area to the section
  res.status(200).send("req");
});

router.delete("/:id/adviser", async (req, res) => {
  //query for the section, if not found -> error
  //query for the teacher, if not found -> error
  //test if teacher is the adviser of that sections
  //if all pass delete adviser_id
  res.status(200).send("req");
});

router.delete("/:id/teacher", async (req, res) => {
  //query for the section, if not found -> error
  //query for the teacher, if not found -> error
  //test if teacher is the teacher for that learning area
  //if all pass delete teacher_id
  res.status(200).send("req");
});

router.post("/:id/add", async (req, res) => {
  //for each sectionsadd in req.body
  //query the section, if no section found -> error
  //test if the section chairman is this chairman
  //test if students is not enrolled
  //test if students w'ere already classified
  //if all test above are push the students to the section and save
  res.status(200).send("req");
});

router.delete("/:id/:studentId", async (req, res) => {
  //query the student, if not found -> error
  //query the section, if no section found -> error
  //test if the section chairman is this chairman
  //test if the student includes in this section, if not error
  //if all pass delete the student

  res.status(200).send("req");
});

router.delete("/:id", async (req, res) => {
  //TODO: delete also it's references to assigned teachers
  //query the section, if no section found -> error
  //test if the section chairman is this chairman
  //for each section students query a scholastic record with school year now , if found error

  //transaction start
  //get the adviser_id
  //get all sections on which adviser_id is assigned, not this section
  //if no other sections adviser is assigned to, delete adviser category
  //get the subject teachers teacher_id
  //get all sections on which teacher_id is assigned, not this section
  //if not other sections on which teacher_id is assigned, delete subject teacher category
  //delete section
  //transaction end
  res.status(200).send("req");
});

module.exports = router;
