const express = require("express");
const router = express.Router();
const Fawn = require("fawn");
const { Section, validateSection } = require("../models/section");
const { validateSectionsAdd, validateSectionsEdit } = require("../models/misc");
const { Enrollee } = require("../models/enrollee");
const { Teacher } = require("../models/teacher");
const { ScholasticRecord } = require("../models/scholastic_record");
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

  res.send(section);
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

  const duplicateSection = await Section.findOne({
    _id: {
      $not: {
        $eq: req.params.id
      }
    },
    grade_level: section.grade_level,
    number: req.body.number
  });

  if (duplicateSection) {
    return res
      .status(400)
      .send(
        `Another section, already owns the section number ${req.body.number}`
      );
  }

  if (req.body.number) section.number = req.body.number;
  if (req.body.name) section.name = req.body.name;

  const updatedSection = await section.save();

  res.send(updatedSection);
});

router.post("/:id/adviser", async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");

  const adviser = await Teacher.findById(req.body.id);
  if (!adviser)
    return res.status(400).send("Assigning an unregistered teacher");
  if (section.adviser_id)
    return res
      .status(400)
      .send("Section already has an adviser, untag it first");

  section.adviser_id = adviser._id;
  await section.save();
  res.send(section);
});

router.post("/:id/teacher", async (req, res) => {
  let section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");

  const adviser = await Teacher.findById(req.body.id);
  if (!adviser)
    return res.status(400).send("Assigning an unregistered teacher");
  let tagged = section.subject_teachers.find(subject_teacher => {
    return (
      subject_teacher.learning_area == req.body.learning_area &&
      subject_teacher.teacher_id
    );
  });
  if (tagged) {
    return res
      .status(400)
      .send(
        `Section already has a teacher in ${req.body.learning_area}, untag it first`
      );
  }

  section.subject_teachers.push({
    learning_area: req.body.learning_area,
    teacher_id: req.body.id
  });

  section = await section.save();
  res.send(section);
});

router.delete("/:id/adviser", async (req, res) => {
  let section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");

  const adviser = await Teacher.findById(req.body.id);
  if (!adviser)
    return res.status(400).send("Assigning an unregistered teacher");
  if (adviser._id.toHexString() !== section.adviser_id.toHexString())
    return res.status(400).send(`Adviser is not handling that section`);

  section = section.toObject();
  delete section.adviser_id;

  await Section.updateOne(
    { _id: req.params.id },
    { $unset: { adviser_id: "" } }
  );

  res.send(section);
});

router.delete("/:id/teacher", async (req, res) => {
  let section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");

  const teacher = await Teacher.findById(req.body.id);
  if (!teacher)
    return res.status(400).send("Assigning an unregistered teacher");
  let tagged = section.subject_teachers.find(subject_teacher => {
    return (
      subject_teacher.learning_area == req.body.learning_area &&
      subject_teacher.teacher_id == req.body.id
    );
  });
  if (!tagged)
    return res
      .status(400)
      .send(
        `Teacher is not teaching that section in ${req.body.learning_area}`
      );

  section.subject_teachers = section.subject_teachers.filter(steacher => {
    return steacher.learning_area != req.body.learning_area;
  });
  section = await section.save();
  res.send(section);
});

router.post("/add", async (req, res) => {
  const { error } = validateSectionsAdd(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let errors = [];
  const studentsClassified = [];
  await asyncForEach(req.body, async function(sec) {
    const section = await Section.findById(sec.section_id);
    if (!section) {
      errors.push("unregistered");
      return;
    }
    const chairman_id = req.user._id || "";
    if (section.chairman_id != chairman_id) {
      errors.push("unauthorized");
      return;
    }

    let enrolled = false;
    let classified = true;
    await asyncForEach(sec.students, async function(enrolled_id) {
      enrolled = await Enrollee.findById(enrolled_id);
      classified = await Section.findOne({ students: enrolled_id });
    });

    if (!enrolled) {
      errors.push("unenrolled");
      return;
    }
    if (classified) {
      errors.push("classified");
      return;
    }
    studentsClassified.push(...sec.students);
    section.students.push(...sec.students);
    await section.save();
  });

  if (errors.includes("unregistered")) {
    return res.status(400).send("Accessing an unregistered section");
  }

  if (errors.includes("unauthorized")) {
    return res
      .status(403)
      .send("Trying to access a section you're not handling");
  }

  if (errors.includes("unenrolled")) {
    return res.status(400).send("One of the student(s) is not enrolled");
  }

  if (errors.includes("classified")) {
    return res.status(400).send("One of the student(s) is already classified");
  }

  //if all test above are push the students to the section and save
  res.send(studentsClassified);
});

router.delete("/:id/:studentId", async (req, res) => {
  //query the section, if no section found -> error
  let section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");
  //test if the section chairman is this chairman
  if (section.chairman_id != req.user._id)
    return res
      .status(403)
      .send("Trying to access a section you're not handling");

  //test if the student includes in this section, if not error
  const classified = section.students.includes(req.params.studentId);
  if (!classified)
    return res.status(400).send("Student is not classified to the section");
  section.students = section.students.filter(id => id != req.params.studentId);
  section = await section.save();
  res.send(section);
});

router.delete("/:id", async (req, res) => {
  let section = await Section.findById(req.params.id);
  if (!section)
    return res.status(400).send("Accessing an unregistered section");

  if (section.chairman_id != req.user._id)
    return res
      .status(403)
      .send("Trying to access a section you're not handling");

  let recorded = false;
  await asyncForEach(section.students, async student => {
    if (recorded) return;
    recorded = await ScholasticRecord.findOne({
      owner_id: student._id,
      "school_year.start": section.school_year.start
    });
  });

  if (recorded) {
    return res
      .status(400)
      .send("Deleting the section will complicate some of the students record");
  }

  //TODO: insert allowDelete property to the returning GET /api/sections/:id , use test above

  //transaction start use Fawn
  const deleteSection = new Fawn.Task();
  const adviserSections = await Section.findOne({
    _id: {
      $not: {
        $eq: req.params.id
      }
    },
    adviser_id: section.adviser_id,
    "school_year.start": section.school_year.start
  });

  if (!adviserSections) {
    const adviser = await Teacher.findById(section.adviser_id);
    const assignments = adviser.assignments.filter(
      assignment => assignment.category == "Adviser"
    );
    deleteSection.update(
      "teachers",
      { _id: adviser._id },
      { $set: { assignments } }
    );
    console.log(`deleted adviser assignment of ${adviser.fullname()}`);
  }

  await asyncForEach(section.subject_teachers, async teacher => {
    const teacherSections = await Section.findOne({
      _id: {
        $not: {
          $eq: req.params.id
        }
      },
      "subject_teachers.teacher_id": teacher.teacher_id,
      "school_year.start": section.school_year.start
    });

    if (!teacherSections) {
      const teacherDocument = await Teacher.findById(teacher.teacher_id);
      const assignments = teacherDocument.assignments.filter(
        assignment => assignment.category == "Subject Teacher"
      );
      deleteSection.update(
        "teachers",
        { _id: teacherDocument._id },
        { $set: { assignments } }
      );
      console.log(
        `deleted teaching assignment of ${teacherDocument.fullname()}`
      );
    }
  });

  deleteSection.remove("sections", { _id: section._id });
  deleteSection.run();
  res.send(section);
});

module.exports = router;
