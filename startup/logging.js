const winston = require("winston");
const config = require("config");
// require("winston-mongodb").MongoDB;
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, printf, colorize, simple } = format;
// require('winston-mongodb');

// Enable exception handling when you create your logger.

module.exports = function() {
  const infoFormat = printf(({ level, message, label, timestamp }) => {
    label = label == undefined ? "log" : label;
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

  winston.configure({
    transports: [
      new winston.transports.Console({
        level: "info",
        format: combine(colorize(), simple())
      }),
      new winston.transports.File({
        filename: "./logs/all.log",
        format: combine(timestamp(), infoFormat)
      }),
      new winston.transports.File({
        level: "info",
        filename: "./logs/info.log",
        format: combine(timestamp(), infoFormat)
      }),
      new winston.transports.File({
        level: "error",
        filename: "./logs/errors.log",
        handleExceptions: true
      })
      // new winston.transports.MongoDB({
      //   db: config.get("db"),
      //   level: "info",
      //   options: {
      //     useUnifiedTopology: true
      //   }
      // })
    ]
  });

  process.on("uncaughtException", ex => {
    const label = ex.label == undefined ? "uncaughtException" : ex.label;
    winston.log({
      level: "error",
      label: label,
      message: ex.message
    });
  });

  process.on("unhandledRejection", ex => {
    ex.label = "unhandledRejection";
    throw ex;
  });
};
