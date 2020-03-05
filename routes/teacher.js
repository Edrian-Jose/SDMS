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
router.get("/:id", async (req, res) => {
  res.status(200).send("req");
});
router.put("/:id", async (req, res) => {
  res.status(200).send("req");
});
router.put("/:id/resetpassword", async (req, res) => {
  res.status(200).send("req");
});
router.post("/:id/logs", async (req, res) => {
  res.status(200).send("req");
});

module.exports = router;
