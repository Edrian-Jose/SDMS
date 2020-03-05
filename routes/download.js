const express = require("express");
const router = express.Router();

router.get("/sf10", async (req, res) => {
  res.status(200).send("req");
});

router.get("/sf1", async (req, res) => {
  res.status(200).send("req");
});

router.get("/reportCards", async (req, res) => {
  res.status(200).send("req");
});

router.get("/encodedGrades", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
