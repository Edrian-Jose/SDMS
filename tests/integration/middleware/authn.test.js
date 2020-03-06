const request = require("supertest");
const mongoose = require("mongoose");
const { Teacher } = require("../../../models/teacher");
const jwt = require("jsonwebtoken");
const config = require("config");

let server;
beforeEach(async () => {
  server = require("../../../index");
});

afterEach(async () => {
  await server.close();
});

describe("Authentication", () => {
  let token,
    roles = [0, 1];
  beforeEach(async () => {
    const user = {
      _id: (customerId = mongoose.Types.ObjectId()),
      roles: [0]
    };
    token = jwt.sign(user, config.get("jwtPrivateKey"));
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(server).get("/api/students");

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    const res = await request(server)
      .get("/api/students")
      .set("x-auth-token", "dgsdsd");

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await request(server)
      .get("/api/students")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });
});
