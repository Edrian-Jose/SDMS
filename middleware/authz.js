const role_access = require("../config/role_access");

function getRouteConfig(req) {
  const path = req.path;
  const method = req.method;
  const route = role_access.find(route => {
    const sameMethod = route.method == method;
    const samePath = path.match(route.path);
    return sameMethod && samePath;
  });
  return route;
}
module.exports.getRouteConfig = getRouteConfig;
module.exports.authz = function(req, res, next) {
  try {
    const user = req.user;
    const config = getRouteConfig(req);
    if (!config) return res.status(404).send("Endpoint not found");
    let isAuthorized = false;
    user.roles.forEach(role => {
      isAuthorized = isAuthorized || config.user_access[role];
    });
    if (!isAuthorized)
      throw new Error("Role of the user is unauthorized for the endpoint");
    else next();
  } catch (ex) {
    return res.status(403).send("Unauthorized");
  }
};
