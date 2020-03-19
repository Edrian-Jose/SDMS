const { getRouteConfig } = require("../../middleware/authz");

describe("AuthZ getRouteConfig", () => {
  let req, reqS;
  beforeEach(() => {
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
      { method: "POST", path: "/api/sections/id/add" },
      { method: "DELETE", path: "/api/sections/id/:studentId" },
      { method: "DELETE", path: "/api/sections/id" },
      { method: "POST", path: "/api/enroll" },
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

    req = {};
  });
  it("should not return a route config if req route is invalid", async () => {
    req.method = "GET";
    req.path = "/";
    expect(getRouteConfig(req)).toBeFalsy();
  });

  it("should return a route config if req is valid", async () => {
    reqS.forEach(req => {
      expect(getRouteConfig(req)).not.toBeFalsy();
    });
  });
});
