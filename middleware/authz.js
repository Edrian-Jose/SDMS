const config = require("config");

module.exports = function(req, res, next) {
  try {
    //get the user rights level from the db, access_rights(field)
    //get the url of the api
    //from the config file determine if the user rights is in the array of authorized rights level

    next();
  } catch (ex) {
    res.status(401).send("Unauthorized");
  }
};
