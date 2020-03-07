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
    section1,
    section2,
    studentDocument,
    steacher,
    ateacher,
    cteacher,
    steacherid,
    ateacherid,
    cteacherid,
    teacherDocument;
  beforeEach(async () => {
    steacherid = mongoose.Types.ObjectId();
    ateacherid = mongoose.Types.ObjectId();
    cteacherid = mongoose.Types.ObjectId();
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

    steacher = {
      _id: steacherid,
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
          category: "Subject Teacher"
        }
      ]
    };

    ateacher = {
      _id: ateacherid,
      name: {
        first: "Edriann Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      employee_number: 9999997,
      password: "9999998",
      assignments: [
        {
          category: "Adviser"
        }
      ]
    };

    cteacher = {
      _id: cteacherid,
      name: {
        first: "Edriann Josee",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      employee_number: 9999996,
      password: "9999998",
      assignments: [
        {
          category: "Curriculum Chairman"
        }
      ]
    };

    section1 = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      adviser_id: ateacherid,
      chairman_id: cteacherid,
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: steacherid
        },
        {
          learning_area: "Filipino",
          teacher_id: ateacherid
        }
      ],
      students: [studentIds[0], studentIds[1], studentIds[2]]
    };

    section2 = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      adviser_id: steacherid,
      chairman_id: cteacherid,
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: steacherid
        }
      ],
      students: [studentIds[1], studentIds[2], studentIds[3]]
    };
    await new Section(section1).save();
    await new Section(section2).save();
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
    teacherDocument = new Teacher(steacher);
    token = teacherDocument.generateAuthToken();
    await teacherDocument.save();
    const res = await request(server)
      .get("/api/students")
      .set("x-auth-token", token);

    expect(res.body.length).toBe(4);
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

describe("PUT /api/students/:id", () => {
  let token, student, studentId, teacher;
  beforeEach(async () => {
    server = require("../../../index");
    teacher = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Adviser" }, { category: "Subject Teacher" }]
    };
    studentId = mongoose.Types.ObjectId();
    student = {
      _id: studentId,
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
    delete student._id;
    student.lrn = 2;
    student.name.first = "Erika";
    studentDocument = new Student(student);
    await studentDocument.save();
    student.lrn = 1;
    student.name.first = "Edrian Jose";
  });

  afterEach(async () => {
    await Student.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).put(
      "/api/students/" + studentId.toHexString()
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();

    const res = await request(server)
      .put("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if student obj is invalid", async () => {
    token = new Teacher(teacher).generateAuthToken();
    delete student.parents_name;
    const res = await request(server)
      .put("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(student);
    expect(res.status).toBe(400);
  });

  it("should return 400 if lrn is changed and it is already registered", async () => {
    student.lrn = 2;
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .put("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(student);

    expect(res.status).toBe(400);
  });

  it("should return 400 if student name is changed and it is already registered", async () => {
    student.name.first = "Erika";
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .put("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(student);
    expect(res.status).toBe(400);
  });

  it("should return updated student if successful", async () => {
    student.birthdate = "2000-01-13T16:00:00.000Z";
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .put("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(student);

    expect(res.body.birthdate).toBe(student.birthdate);
  });
});
