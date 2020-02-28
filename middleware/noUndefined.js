var findObjectValue = function(obj, value) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] == value) {
        return obj;
      }
    }
  }

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (typeof obj[i] == "object") {
        var foundLabel = findObjectValue(obj[i], value);
        if (foundLabel) {
          return foundLabel;
        }
      }
    }
  }
  return null;
};

module.exports.lookValue = findObjectValue;
module.exports.noUndefined = function(req, res, next) {
  if (findObjectValue(req, undefined) != null) {
    throw new Error("Undefined values are not accepted");
  }
  next();
};
