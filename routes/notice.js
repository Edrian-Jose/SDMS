const authn = require("../middleware/authn");
const { authz } = require("../middleware/authz");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send("req");
});

router.post("/", async (req, res) => {
  res.status(200).send("req");
});

router.delete("/:id", async (req, res) => {
  res.status(200).send("req");
});

router.put("/:id", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
