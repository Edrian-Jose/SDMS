const express = require("express");
const router = express.Router();
const { Student, validateStudent } = require("../models/student");
router.get("/", async (req, res) => {
  res.status(200).send("req");
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

  res.status(200).send("req");
});

router.get("/:id", async (req, res) => {
  res.status(200).send("req");
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
