const express = require("express");
const router = express.Router();
const { Enrollee, validateEnrollee } = require("../models/enrollee");

router.post("/", async (req, res) => {
  const { error } = validateEnrollee(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const enrolled = await Enrollee.findOne({ lrn: req.body.lrn });

  if (enrolled)
    return res.status(400).send("Bad request, enrollee is already enrolled");

  const enrollee = new Enrollee(req.body);
  await enrollee.save();

  res.send({
    lrn: enrollee.lrn,
    name: enrollee.getFullName(),
    classification: enrollee.classification
  });
});

router.get("/:lrn", async (req, res) => {
  const enrollee = await Enrollee.findOne({ lrn: req.params.lrn });
  if (!enrollee) return res.send(null);
  res.send(enrollee);
});

router.delete("/:lrn", async (req, res) => {
  const enrolled = await Enrollee.findOne({ lrn: req.params.lrn });
  if (!enrolled)
    return res
      .status(400)
      .send("Bad request, deleting enrollee is not enrolled");

  enrolled.remove();
  res.send({
    lrn: enrolled.lrn,
    name: enrolled.getFullName(),
    classification: enrolled.classification
  });
});

module.exports = router;
