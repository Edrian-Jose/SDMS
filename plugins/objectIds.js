module.exports.removeDuplicateIds = function(objectIDs) {
  const ids = {};
  objectIDs.forEach(_id => (ids[_id.toString()] = _id));
  return Object.values(ids);
};
