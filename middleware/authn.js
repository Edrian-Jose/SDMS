const jwt = require("jsonwebtoken");
const config = require("config");
const SystemLog = require("../models/log");

module.exports = async function(req, res, next) {
  if (req.originalUrl === "/api/login") return next();

  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;

    next();
  } catch (ex) {
    return res.status(400).send("Invalid token.");
  }
};
