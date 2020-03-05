const request = require("supertest");
const mongoose = require("mongoose");
const { Teacher } = require("../../../models/teacher");

describe("POST /api/teachers/", () => {
  let server, token, teacher, admin, teacherDocument;
  beforeEach(async () => {
    server = require("../../../index");
    admin = {
      _id: (customerId = mongoose.Types.ObjectId().toHexString()),
      assignments: [{ category: "Admin" }]
    };
    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      employee_number: 9999998,
      password: "9999998"
    };
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
    teacher.name.first = "Erika May";
    teacher.employee_number = 9999999;
    //token = new Teacher(admin).generateAuthToken();
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
    await server.close();
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post("/api/teachers");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if teacher obj is invalid", async () => {
    token = new Teacher(admin).generateAuthToken();
    delete teacher.birthdate;
    const res = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);
    expect(res.status).toBe(400);
  });

  it("should return 400 if employee number is already registered", async () => {
    teacher.employee_number = 9999998;
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is already registered", async () => {
    teacher.name.first = "Edrian Jose";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);
    expect(res.status).toBe(400);
  });

  it("should return created teacher if successful", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .post("/api/teachers")
      .set("x-auth-token", token)
      .send(teacher);
    expect(res.body.employee_number).toBe(teacher.employee_number);
  });
  //if unauthenticated /
  //if unauthorized /
  //if teacher obj is invalid /
  //if employee number already registered /
  //if teacher already registered /
  //if successful execution
});
