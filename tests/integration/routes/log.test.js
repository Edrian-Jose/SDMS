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

describe("GET /api/logs", () => {
  let teacher, user, admin, token;

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

    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      name: "FERRER, EDRIAN JOSE DE GUZMAN",
      assignments: [{ category: "Admin" }]
    };
    token = new Teacher(admin).generateAuthToken();
    await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);

    await request(server)
      .post("/api/login")
      .send(user);
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get("/api/logs");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get("/api/logs")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });
  it("should return logs if successful", async () => {
    const res = await request(server)
      .get("/api/logs")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/logs/:id", () => {
  let teacher, user, admin, token, teacherDoc;

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

    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      name: "FERRER, EDRIAN JOSE DE GUZMAN",
      assignments: [{ category: "Admin" }]
    };
    token = new Teacher(admin).generateAuthToken();
    teacherDoc = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);

    await request(server)
      .post("/api/login")
      .send(user);
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get(`/api/logs/${teacherDoc.body._id}`);
    expect(res.status).toBe(401);
    console.log(res.text);
  });

  it("should return 200 if authorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get(`/api/logs/${teacherDoc.body._id}`)
      .set("x-auth-token", token);
    console.log(res.text);
    expect(res.status).toBe(200);
  });

  it("should return logs if successful", async () => {
    const res = await request(server)
      .get(`/api/logs/${teacherDoc.body._id}`)
      .set("x-auth-token", token);
    // console.log(res.text);

    expect(res.status).toBe(200);
  });
});
