const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  request: {
    path: String,
    method: String
  },
  response: {
    status: Number,
    message: String
  }
});
logSchema.statics.createLog = function(req, res, message) {
  const log = {
    request: {
      path: req.originalUrl,
      method: req.method
    },
    response: {
      status: res.statusCode,
      message: message
    }
  };
  if (req.user) {
    log.accountId = req.user._id;
  }
  return log;
};
const SystemLog = mongoose.model("System-Log", logSchema);

module.exports = SystemLog;
