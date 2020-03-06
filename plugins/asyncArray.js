module.exports.asyncForEach = async function(array, callback) {
  for await (const iterator of array) {
    await callback(iterator);
  }
};
