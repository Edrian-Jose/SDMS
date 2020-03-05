const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("req");
});

router.get("/:id", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
