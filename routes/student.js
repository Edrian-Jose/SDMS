//Dependencies
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");

//Models
const { Student, validateStudent } = require("../models/student");
const { Teacher } = require("../models/teacher");
const { Section } = require("../models/section");
const {
  ScholasticRecord,
  validateScholasticRecord,
  validateGradeRecord
} = require("../models/scholastic_record");
const learning_areas = require("../plugins/learning_areas");
//Plugins
const { asyncForEach } = require("../plugins/asyncArray");
const { removeDuplicateIds } = require("../plugins/objectIds");

// View all students
router.get("/", async (req, res) => {
  const teacher = await Teacher.findById(req.user._id);
  //TODO: pass this logic to authorization middleware
  if (!teacher) {
    return res.send("Looks like your account id is invalid");
  }

  let yearNow = new Date().getFullYear();
  const advisorySections = await Section.find({
    adviser_id: teacher._id,
    $or: [{ "school_year.end": yearNow }, { "school_year.end": yearNow + 1 }]
  });

  const chairmanSections = await Section.find({
    chairman_id: teacher._id,
    $or: [{ "school_year.end": yearNow }, { "school_year.end": yearNow + 1 }]
  });

  const teachingSections = await Section.find({
    "subject_teachers.teacher_id": teacher._id,
    $or: [{ "school_year.end": yearNow }, { "school_year.end": yearNow + 1 }]
  });

  let handledSections = _.unionWith(
    chairmanSections,
    teachingSections,
    advisorySections,
    _.isEqual
  );

  const sectionStudentsArray = handledSections.map(section => section.students);
  let studentsId = [];
  sectionStudentsArray.forEach(studentsArray => {
    studentsArray.forEach(studentId => {
      if (!studentsId.includes(studentId)) {
        studentsId.push(studentId);
      }
    });
  });

  studentsId = removeDuplicateIds(studentsId);
  const students = [];
  await asyncForEach(studentsId, async id => {
    const document = await Student.findById(id);
    const section = await Section.findOne({ isRegular: true, students: id });
    students.push({
      _id: document._id,
      lrn: document.getLrn(),
      fullname: document.getFullName(),
      grade: section.grade_level,
      section: section.number
    });
  });

  res.send(students);
});

// Add info to students
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

// View student info
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

// Edit info to students
router.put("/:id", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send("Bad request, invalid student object");
  const duplicateLrn = await Student.findOne({
    _id: { $not: { $eq: req.params.id } },
    lrn: req.body.lrn
  });
  if (duplicateLrn)
    return res.status(400).send("Bad request, lrn already registered");

  const duplicateName = await Student.findOne({
    _id: { $not: { $eq: req.params.id } },
    "name.last": req.body.name.last,
    "name.first": req.body.name.first,
    "name.middle": req.body.name.middle,
    "name.extension": req.body.name.extension
  });
  if (duplicateName)
    return res.status(400).send("Bad request, name already registered");

  const student = await Student.findByIdAndUpdate(req.params.id, req.body);
  res.send(student);
});

// Add scholastic record
router.post("/:id", async (req, res) => {
  const { error } = validateScholasticRecord(req.body);
  if (error) return res.status(400).send("Bad request, invalid record object");

  const duplicateRecord = await ScholasticRecord.findOne({
    owner_id: req.body.owner_id,
    "school.id": req.body.school.id,
    grade_level: req.body.grade_level,
    section: req.body.section,
    "school_year.start": req.body.school_year.start
  });

  if (duplicateRecord)
    return res.status(400).send("Bad request, record already exist");

  const record = new ScholasticRecord(req.body);
  await record.save();
  res.send(record);
});

// Edit scholastic record
router.put("/:id/:recordId", async (req, res) => {
  const { error } = validateScholasticRecord(req.body);
  if (error) return res.status(400).send("Bad request, invalid record object");

  const duplicateRecord = await ScholasticRecord.findOne({
    _id: { $not: { $eq: req.params.recordId } },
    owner_id: req.body.owner_id,
    "school.id": req.body.school.id,
    grade_level: req.body.grade_level,
    section: req.body.section,
    "school_year.start": req.body.school_year.start
  });

  if (duplicateRecord)
    return res.status(400).send("Bad request, record already exist");

  const record = await ScholasticRecord.findByIdAndUpdate(
    req.params.recordId,
    req.body
  );
  res.send(record);
});

// Download SF10
router.get("/:id/downloads/sf10", async (req, res) => {
  res.status(200).send("req");
});

// Download reportCard
router.get("/:id/downloads/reportCard", async (req, res) => {
  res.status(200).send("req");
});

// Encode Grades
router.post("/:id/grades", async (req, res) => {
  let record;
  const { error } = validateGradeRecord(req.body);
  if (error)
    return res.status(400).send("Bad request, grade object is invalid");

  let yearNow = new Date().getFullYear();
  const section = await Section.findOne({
    students: req.params.id,
    $or: [{ "school_year.end": yearNow }, { "school_year.end": yearNow + 1 }],
    "subject_teachers.teacher_id": req.user._id,
    "subject_teachers.learning_area": req.body.learning_area
  });
  if (!section)
    return res
      .status(400)
      .send(
        "Bad request, student is not belong to any of your handled sections"
      );
  for (let i = section.grade_level - 1; i >= 7; i--) {
    const prevRecord = await ScholasticRecord.findOne({
      owner_id: req.params.id,
      grade_level: i,
      "subjects.learning_area": req.body.learning_area,
      "subjects.quarter_rating.3": { $exists: true }
    });
    if (!prevRecord)
      return res.status(400).send("Bad request, cannot find previous records");
  }

  if (req.body.quarter > 1) {
    record = await ScholasticRecord.findOne({
      owner_id: req.params.id,
      grade_level: section.grade_level,
      "school_year.start": section.school_year.start,
      completed: false,
      $and: [
        { "subjects.learning_area": req.body.learning_area },
        { "subjects.quarter_rating": { $size: req.body.quarter - 1 } }
      ]
    });
    if (!record) {
      const prevRecord = await ScholasticRecord.findOne({
        owner_id: req.params.id,
        grade_level: section.grade_level,
        "school_year.start": section.school_year.start,
        completed: true,
        $and: [
          { "subjects.learning_area": req.body.learning_area },
          { "subjects.quarter_rating": { $size: req.body.quarter - 1 } }
        ]
      });
      if (prevRecord) {
        prevRecord.completed = false;
        prevRecord.school = {
          name: "	Pres. Sergio Osmena, Sr. High School",
          id: 305296,
          district: "1",
          division: "2",
          region: "NCR"
        };
        //TODO replace assignment of school to query in database system settings
        prevRecord.section = `${section.number}-${section.name}`;
        prevRecord.adviser = await Teacher.findById(
          section.adviser_id
        ).fullname();
        delete prevRecord.scholastic_status;
        record = new ScholasticRecord(prevRecord);
      } else {
        return res
          .status(400)
          .send("Bad request, previous grades are not encoded yet");
      }
    }
  } else {
    record = new ScholasticRecord({
      owner_id: req.params.id,
      completed: false,
      school: {
        name: "	Pres. Sergio Osmena, Sr. High School",
        id: 305296,
        district: "1",
        division: "2",
        region: "NCR"
      },
      grade_level: section.grade_level,
      section: `${section.number}-${section.name}`,
      school_year: section.school_year,
      adviser: await Teacher.findById(section.adviser_id).fullname(),
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: [87]
        };
      })
    });
  }

  record = await ScholasticRecord.findOne({
    owner_id: req.params.id,
    grade_level: section.grade_level,
    "school_year.start": section.school_year.start,
    completed: false
  });

  const subjects = record.subjects.map(subject => {
    if (subject.learning_area == req.body.learning_area) {
      subject.quarter_rating[req.body.quarter - 1] = req.body.grade;
    }
    return subject;
  });
  record.subjects = subjects;
  await record.save();
  res.send(record);
});

// Untag encoded grades
router.delete("/:id/grades", async (req, res) => {
  const { error } = validateGradeRecord(req.body);
  if (error)
    return res.status(400).send("Bad request, grade object is invalid");

  let yearNow = new Date().getFullYear();
  const section = await Section.findOne({
    students: req.params.id,
    $or: [{ "school_year.end": yearNow }, { "school_year.end": yearNow + 1 }],
    "subject_teachers.teacher_id": req.user._id,
    "subject_teachers.learning_area": req.body.learning_area
  });
  if (!section)
    return res
      .status(400)
      .send(
        "Bad request, student is not belong to any of your handled sections"
      );

  const record = await ScholasticRecord.findOne({
    owner_id: req.params.id,
    grade_level: section.grade_level,
    "school_year.start": section.school_year.start,
    completed: false
  });
  if (!record) {
    return res.status(400).send("Bad request, cannot find current record");
  }
  const subject = record.subjects.find(subject => {
    return subject.learning_area == req.body.learning_area;
  });
  console.log(subject.quarter_rating.length, req.body.quarter);

  if (subject.quarter_rating.length != req.body.quarter) {
    return res
      .status(400)
      .send("Bad request, no grade found at quarter " + req.body.quarter);
  }

  const subjects = record.subjects.map(subject => {
    if (subject.learning_area == req.body.learning_area) {
      subject.quarter_rating.splice(req.body.quarter - 1, 1);
    }
    return subject;
  });
  record.subjects = subjects;
  await record.save();
  res.send(record);
});

module.exports = router;
