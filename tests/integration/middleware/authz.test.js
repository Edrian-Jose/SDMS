const request = require("supertest");
const mongoose = require("mongoose");
const { Teacher } = require("../../../models/teacher");
const role_access = require("../../../plugins/role_access");
const { getRouteConfig } = require("../../../middleware/authz");
const jwt = require("jsonwebtoken");
const config = require("config");

let server;
async function asyncForEach(array, callback) {
  for (const iterator of array) {
    await callback(iterator);
  }
}

beforeEach(() => {
  server = require("../../../index");
});

afterEach(async () => {
  await server.close();
  server = null;
});
describe("Authorization", () => {
  let token,
    roles = [];
  reqS = [
    { method: "GET", path: "/api/students" },
    { method: "POST", path: "/api/students" },
    { method: "GET", path: "/api/students/id" },
    { method: "PUT", path: "/api/students/id" },
    { method: "POST", path: "/api/students/id" },
    { method: "GET", path: "/api/students/id/downloads/sf10" },
    { method: "GET", path: "/api/students/id/downloads/reportcard" },
    { method: "POST", path: "/api/students/id/grades" },
    { method: "DELETE", path: "/api/students/id/grades" },
    { method: "GET", path: "/api/teachers" },
    { method: "POST", path: "/api/teachers" },
    { method: "GET", path: "/api/teachers/id" },
    { method: "PUT", path: "/api/teachers/id" },
    { method: "PUT", path: "/api/teachers/id/resetpassword" },
    { method: "POST", path: "/api/teachers/id/logs" },
    { method: "GET", path: "/api/sections" },
    { method: "POST", path: "/api/sections" },
    { method: "GET", path: "/api/sections/id" },
    { method: "POST", path: "/api/sections/id/:studentId" },
    { method: "DELETE", path: "/api/sections/id/:studentId" },
    { method: "DELETE", path: "/api/sections/id" },
    { method: "POST", path: "/api/enroll" },
    { method: "DELETE", path: "/api/enroll" },
    { method: "GET", path: "/api/notices" },
    { method: "POST", path: "/api/notices" },
    { method: "DELETE", path: "/api/notices/id" },
    { method: "PUT", path: "/api/notices/id" },
    { method: "GET", path: "/api/downloads/sf10" },
    { method: "GET", path: "/api/downloads/sf1" },
    { method: "GET", path: "/api/downloads/reportCards" },
    { method: "GET", path: "/api/downloads/encodedGrades" },
    { method: "GET", path: "/api/logs" },
    { method: "GET", path: "/api/logs/id" }
  ];
  beforeEach(() => {
    token = null;
    roles = [];
  });

  it("should return 404 if path is invalid", async () => {
    roles.push(0);
    const user = {
      _id: mongoose.Types.ObjectId(),
      roles: roles
    };
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .get("/api/invalid")
      .set("x-auth-token", token);

    expect(res.status).toBe(404);
  });

  it("should return 403 if unauthorized", async () => {
    const user = {
      _id: mongoose.Types.ObjectId(),
      roles: [0]
    };
    token = jwt.sign(user, config.get("jwtPrivateKey"));
    const res = await request(server)
      .get("/api/teachers")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 200 if trying to login", async () => {
    const res = await request(server).post("/api/login");

    expect(res.status).toBe(200);
  });

  // it("should return 200 if authorized", async () => {
  //   reqS = await reqS.map(req => {
  //     const routeConfig = getRouteConfig({
  //       method: req.method,
  //       path: req.path
  //     });
  //     req.user_access = routeConfig.user_access;
  //     return req;
  //   });
  //   let authz = true;
  //   const expectedStatus = 200;
  //   const findingValid = expectedStatus == 200;

  //   usersAllRoles = [0, 1, 2, 3, 4];
  //   await asyncForEach(usersAllRoles, async roleNumber => {
  //     const reqf = await reqS.filter(req => {
  //       if (req.user_access[roleNumber] == findingValid) {
  //         return req;
  //       }
  //     });

  //     const user = {
  //       _id: (mongoose.Types.ObjectId()),
  //       roles: [roleNumber]
  //     };
  //     const token = jwt.sign(user, config.get("jwtPrivateKey"));
  //     await asyncForEach(reqf, async req => {
  //       let res;

  //       switch (req.method) {
  //         case "GET":
  //           res = await request(server)
  //             .get(req.path)
  //             .set("x-auth-token", token);
  //           break;
  //         case "POST":
  //           res = await request(server)
  //             .post(req.path)
  //             .set("x-auth-token", token);
  //           break;
  //         case "PUT":
  //           res = await request(server)
  //             .put(req.path)
  //             .set("x-auth-token", token);
  //           break;
  //         case "DELETE":
  //           res = await request(server)
  //             .delete(req.path)
  //             .set("x-auth-token", token);
  //           break;
  //         default:
  //           res = await request(server)
  //             .get(req.path)
  //             .set("x-auth-token", token);
  //           break;
  //       }

  //       authz = authz && res.status == expectedStatus;
  //     });
  //   });

  //   expect(authz).toBe(true);
  // });
});
