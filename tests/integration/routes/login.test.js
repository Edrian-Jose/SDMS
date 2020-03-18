const request = require("supertest");
const mongoose = require("mongoose");
const { Teacher } = require("../../../models/teacher");
const SystemLog = require("../../../models/log");

let server;
beforeEach(async () => {
  server = require("../../../index");
});

afterEach(async () => {
  await SystemLog.deleteMany({});
  await server.close();
});

describe("POST /api/login", () => {
  let teacher, user, token;

  beforeEach(async () => {
    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999998,
      password: "9999998"
    };

    user = {
      employee_number: 9999998,
      password: "9999998"
    };

    token = new Teacher({
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    }).generateAuthToken();

    await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 400 if invalid user is sent", async () => {
    delete user.password;
    const res = await request(server)
      .post("/api/login")
      .send(user);
    expect(res.status).toBe(400);
  });

  it("should return 400 if user is not registered", async () => {
    user.employee_number = 9999995;
    const res = await request(server)
      .post("/api/login")
      .send(user);
    expect(res.status).toBe(400);
  });

  it("should return 400 if password is invalid", async () => {
    user.password = "9999994";
    const res = await request(server)
      .post("/api/login")
      .send(user);
    expect(res.status).toBe(400);
  });

  it("should return 200 if login is successful", async () => {
    const res = await request(server)
      .post("/api/login")
      .send(user);

    expect(res.status).toBe(200);
  });
});
