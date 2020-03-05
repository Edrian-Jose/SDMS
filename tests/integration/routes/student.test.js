const request = require("supertest");
const mongoose = require("mongoose");
const { Student } = require("../../../models/student");
const { Teacher } = require("../../../models/teacher");

describe("POST /api/students", () => {
  let server, token, student, teacher;
  beforeEach(async () => {
    server = require("../../../index");
    teacher = {
      _id: (customerId = mongoose.Types.ObjectId().toHexString()),
      assignments: [{ category: "Adviser" }, { category: "Subject Teacher" }]
    };

    student = {
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      },
      sex: "Male",
      birthdate: "2000-01-12T16:00:00.000Z",
      mother_tongue: "Tagalog",
      parents_name: {
        father: "Ed",
        mothers_maiden: "Ma Imelda Cardeño De Guzman"
      },
      guardian: {
        name: "Ma Imelda Ferrer",
        relationship: "Mother"
      }
    };
    studentDocument = new Student(student);
    await studentDocument.save();
    student.lrn = 2;
    student.name.first = "Erika";
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await server.close();
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post("/api/students");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();

    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if student obj is invalid", async () => {
    token = new Teacher(teacher).generateAuthToken();
    delete student.parents_name;
    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token)
      .send(student);
    expect(res.status).toBe(400);
  });

  it("should return 400 if lrn is already registered", async () => {
    student.lrn = 1;
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token)
      .send(student);

    expect(res.status).toBe(400);
  });

  it("should return 400 if student is already registered", async () => {
    student.name.first = "Edrian Jose";
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token)
      .send(student);
    expect(res.status).toBe(400);
  });

  it("should return created student if successful", async () => {
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token)
      .send(student);
    expect(res.body.lrn).toBe(student.lrn);
  });
});
