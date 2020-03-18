const express = require("express");
const router = express.Router();
const SystemLog = require("../models/log");
router.get("/", async (req, res) => {
  const logs = await SystemLog.find()
    .select({ accountId: 1, "response.status": 1, "response.message": 1 })
    .sort({ _id: -1 })
    .limit(100);
  //TODO: implement pagination
  const userName = req.user.name;
  const mappedLogs = logs.map(log => {
    const message = log.response.message.replace(userName, "You");
    const timestamp = log._id.getTimestamp();
    const status = log.response.status;
    return { message, timestamp, status, key: log._id };
  });
  res.send(mappedLogs);
});

router.get("/:id", async (req, res) => {
  const logs = await SystemLog.find({
    accountId: req.user._id
  })
    .select({
      accountId: 1,
      "response.status": 1,
      "response.message": 1
    })
    .sort({ _id: -1 })
    .limit(50);
  //TODO: implement pagination
  const userName = req.user.name;
  const mappedLogs = logs.map(log => {
    const message = log.response.message.replace(userName, "You");
    const timestamp = log._id.getTimestamp();
    const status = log.response.status;
    return {
      message,
      timestamp,
      status,
      key: log._id
    };
  });
  res.send(mappedLogs);
});

module.exports = router;
