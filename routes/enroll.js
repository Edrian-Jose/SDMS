const express = require("express");
const router = express.Router();
const { Enrollee, validateEnrollee } = require("../models/enrollee");

router.post("/", async (req, res) => {
  const { error } = validateEnrollee(req.body);
  if (error)
    return res.status(400).send("Bad request, object value is invalid");

  const enrolled = await Enrollee.findOne({ lrn: req.body.lrn });

  if (enrolled)
    return res.status(400).send("Bad request, enrollee is already enrolled");

  res.send("Hello");
});

router.delete("/:lrn", async (req, res) => {
  const enrolled = await Enrollee.findOne({ lrn: req.params.lrn });
  if (!enrolled)
    return res
      .status(400)
      .send("Bad request, deleting enrollee is not enrolled");

  res.status(200).send("req");
});

module.exports = router;
