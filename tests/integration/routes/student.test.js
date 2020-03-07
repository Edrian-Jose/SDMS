const request = require("supertest");
const mongoose = require("mongoose");
const { Student } = require("../../../models/student");
const { Teacher } = require("../../../models/teacher");
const { Section } = require("../../../models/section");
let server;
beforeEach(async () => {
  server = require("../../../index");
});

afterEach(async () => {
  await server.close();
});

describe("POST /api/students", () => {
  let token, student, teacher;
  beforeEach(async () => {
    server = require("../../../index");
    teacher = {
      _id: mongoose.Types.ObjectId().toHexString(),
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

describe("GET /api/students", () => {
  let token,
    student,
    section,
    studentDocument,
    sectionDocument,
    teacher,
    teacherDocument;
  beforeEach(async () => {
    student = {
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian",
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
    //Populate 10 students
    const studentIds = [];
    for (let i = 0; i < 10; i++) {
      studentIds.push(mongoose.Types.ObjectId());
      student._id = studentIds[i];
      student.lrn++;
      student.name.first += "n";
      studentDocument = new Student(student);
      await studentDocument.save();
    }

    section = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 6,
      number: 0,
      students: []
    };

    //Populate 10 sections
    const sectionIds = [];
    for (let i = 0; i < 10; i++) {
      sectionIds.push(mongoose.Types.ObjectId());
      section._id = sectionIds[i];
      section.grade_level =
        section.grade_level == 10 ? 7 : section.grade_level + 1;
      section.number++;
      section.students[0] = studentIds[i];
      sectionDocument = new Section(section);
      await sectionDocument.save();
    }

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      employee_number: 9999998,
      password: "9999998",
      assignments: [
        {
          category: "Subject Teacher",
          sections: [sectionIds[0], sectionIds[1]]
        },
        {
          category: "Adviser",
          sections: [sectionIds[2]]
        }
      ]
    };
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await Section.deleteMany({});
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get("/api/students");
    expect(res.status).toBe(401);
  });

  it("should return students if authorized", async () => {
    teacherDocument = new Teacher(teacher);
    token = teacherDocument.generateAuthToken();
    await teacherDocument.save();
    const res = await request(server)
      .get("/api/students")
      .set("x-auth-token", token);

    expect(res.status).toBe(200);
  });

  //if user is unauthenticated
  //return filtered user objs if authorized
});

describe("GET /api/students/:id", () => {
  let token, student, studentId, teacher;
  beforeEach(async () => {
    studentId = mongoose.Types.ObjectId();
    student = {
      _id: studentId,
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian",
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

    teacher = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Adviser" }, { category: "Subject Teacher" }]
    };
    await new Student(student).save();
    token = new Teacher(teacher).generateAuthToken();
  });

  afterEach(async () => {
    await Student.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get(
      "/api/students/" + studentId.toHexString()
    );
    expect(res.status).toBe(401);
  });

  it("should return 400 when id is invalid", async () => {
    const res = await request(server)
      .get("/api/students/dasas")
      .set("x-auth-token", token);

    expect(res.status).toBe(400);
  });

  it("should return 400 when student does not exist", async () => {
    const res = await request(server)
      .get("/api/students/" + mongoose.Types.ObjectId().toHexString())
      .set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("should return student when successful", async () => {
    const res = await request(server)
      .get("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token);

    expect(res.body._id).toBe(studentId.toHexString());
  });
});
