const request = require("supertest");
const mongoose = require("mongoose");
const { Section } = require("../../../models/section");
const { Enrollee } = require("../../../models/enrollee");
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

describe("POST /api/sections", () => {
  let token, user, studentIds, sectionId;
  beforeEach(async () => {
    user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Curriculum Chairman" }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    sectionId = mongoose.Types.ObjectId();
    student = {
      _id: studentIds[0],
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    //Populate two student in the database
    await new Enrollee(student).save();
    student._id = studentIds[1];
    student.lrn = 2;
    student.name.first = "Erika May";
    await new Enrollee(student).save();

    section = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      name: "Earth",
      students: [studentIds[0]]
    };

    //token = new Teacher(user).generateAuthToken();
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post("/api/sections");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();

    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if section obj is invalid", async () => {
    token = new Teacher(user).generateAuthToken();
    delete section.school_year;
    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token)
      .send(section);
    expect(res.status).toBe(400);
  });

  it("should return 400 if section is already registered", async () => {
    await new Section(section).save();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token)
      .send(section);
    expect(res.status).toBe(400);
  });

  it("should return 400 if one of the section student(s) is not enrolled", async () => {
    section.students[0] = mongoose.Types.ObjectId();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token)
      .send(section);

    expect(res.status).toBe(400);
  });
  it("should return 400 if one of the section student(s) is already classified", async () => {
    token = new Teacher(user).generateAuthToken();
    await new Section(section).save();
    section.grade_level++;
    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token)
      .send(section);
    expect(res.status).toBe(400);
  });

  it("should return created section if successful", async () => {
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post("/api/sections")
      .set("x-auth-token", token)
      .send(section);

    expect(res.body).toStrictEqual(
      expect.objectContaining({
        school_year: expect.objectContaining({
          start: 2019,
          end: 2020
        }),
        grade_level: 7,
        number: 1,
        name: "Earth"
      })
    );
  });
  //if user is unauthenticated
  //if user is unauthorized
  //if section obj is invalid
  //if section already exist with same name and number
  //if one of the students is not enrolled
  //if one of the students is already classified
  //if successful
});
