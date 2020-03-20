const request = require("supertest");
const mongoose = require("mongoose");
const learning_areas = require("../../../plugins/learning_areas");
const { Section } = require("../../../models/section");
const { Enrollee } = require("../../../models/enrollee");
const { Teacher } = require("../../../models/teacher");
const { ScholasticRecord } = require("../../../models/scholastic_record");
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

describe("GET /api/sections", () => {
  let token, user, userId, studentIds, sectionId;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Curriculum Chairman", grade_levels: [7] }]
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
      chairman_id: userId,
      students: [studentIds[0]]
    };
    token = new Teacher(user).generateAuthToken();
    await new Section(section).save();
    section.grade_level = 8;
    section.students = [studentIds[1]];
    await new Section(section).save();
    //token = new Teacher(user).generateAuthToken();
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get("/api/sections");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .get("/api/sections")
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });
  it("should return sections if successful", async () => {
    const res = await request(server)
      .get("/api/sections")
      .set("x-auth-token", token);

    expect(res.body.length).toBe(2);
  });
});

describe("GET /api/sections/:id", () => {
  let token, user, userId, studentIds, sectionDocument1, sectionDocument2;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Curriculum Chairman", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
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
      chairman_id: userId,
      students: [studentIds[0]]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.grade_level = 8;
    section.students = [studentIds[1]];
    sectionDocument2 = await new Section(section).save();
    //token = new Teacher(user).generateAuthToken();
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get(
      `/api/sections/${sectionDocument1._id.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .get(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .get(`/api/sections/${mongoose.Types.ObjectId().toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(400);
  });
  it("should return 403 if user is not the chairman of accessing section", async () => {
    user._id = mongoose.Types.ObjectId().toHexString();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .get(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return section if successful", async () => {
    const res = await request(server)
      .get(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.body._id).toBe(sectionDocument1._id.toHexString());
  });
});

describe("PUT /api/sections/:id", () => {
  let token, user, userId, studentIds, sectionDocument1, sectionDocument2, info;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Curriculum Chairman", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
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
      chairman_id: userId,
      students: [studentIds[0]]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.number = 2;
    section.students = [studentIds[1]];
    sectionDocument2 = await new Section(section).save();
    info = { number: 3, name: "" };
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).put(
      `/api/sections/${sectionDocument1._id.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .put(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in new info is invalid", async () => {
    info = { number: "", name: 0 };
    const res = await request(server)
      .put(`/api/sections/${mongoose.Types.ObjectId().toHexString()}`)
      .set("x-auth-token", token)
      .send(info);

    expect(res.status).toBe(400);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .put(`/api/sections/${mongoose.Types.ObjectId().toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(400);
  });

  it("should return 403 if user is not the chairman of accessing section", async () => {
    user._id = mongoose.Types.ObjectId().toHexString();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .put(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });
  it("should return 400 if section number already exist in the db", async () => {
    info.number = 2;
    const res = await request(server)
      .put(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(info);

    expect(res.status).toBe(400);
  });

  it("should return updated section if successful", async () => {
    info.number = 3;
    const res = await request(server)
      .put(`/api/sections/${sectionDocument1._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(info);

    expect(res.body.number).toBe(3);
  });
});

describe("POST /api/sections/add", () => {
  let token,
    user,
    studentIds,
    sectionId,
    sectionDocument1,
    students,
    studentDocument1,
    studentDocument2;
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
    studentDocument1 = await new Enrollee(student).save();
    student._id = studentIds[1];
    student.lrn = 2;
    student.name.first = "Erika May";
    studentDocument2 = await new Enrollee(student).save();

    section = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      name: "Earth",
      chairman_id: user._id,
      students: [studentIds[0]]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    //token = new Teacher(user).generateAuthToken();
    students = [
      {
        section_id: sectionDocument1._id,
        students: [studentDocument2._id]
      }
    ];
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(`/api/sections/add`);
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if section_add obj is invalid", async () => {
    token = new Teacher(user).generateAuthToken();
    delete students[0].section_id;
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);

    expect(res.status).toBe(400);
  });

  it("should return 400 if section is not registered", async () => {
    students[0].section_id = mongoose.Types.ObjectId();
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);
    expect(res.status).toBe(400);
  });

  it("should return 403 if user is not the chairman of accessing section", async () => {
    user._id = mongoose.Types.ObjectId().toHexString();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);
    expect(res.status).toBe(403);
  });

  it("should return 400 if one of the section student(s) is not enrolled", async () => {
    students[0].students[0] = mongoose.Types.ObjectId();
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);

    expect(res.status).toBe(400);
  });
  it("should return 400 if one of the section student(s) is already classified", async () => {
    students[0].students[0] = studentDocument1._id;
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);

    expect(res.status).toBe(400);
  });

  it("should return an array of classified students", async () => {
    const res = await request(server)
      .post(`/api/sections/add`)
      .set("x-auth-token", token)
      .send(students);

    expect(res.body.includes(studentDocument2._id.toHexString())).toBe(true);
  });
});

describe("POST /api/sections/:id/adviser", () => {
  let token,
    user,
    userId,
    studentIds,
    sectionDocument1,
    sectionDocument2,
    info,
    teacher,
    teacherDocument,
    teacherIds;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Admin", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    teacherIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    student = {
      _id: studentIds[0],
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999997"
    };
    teacherDocument = await new Teacher(teacher).save();
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
      chairman_id: userId,
      students: [studentIds[0]]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.number = 2;
    section.students = [studentIds[1]];
    section.adviser_id = teacherIds[1];
    sectionDocument2 = await new Section(section).save();
    info = { number: 3, name: "" };
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Teacher.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      `/api/sections/${sectionDocument1._id.toHexString()}/adviser`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .post(`/api/sections/${mongoose.Types.ObjectId().toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send(teacherIds[0].toHexString());

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not found", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id });
    expect(res.status).toBe(400);
  });

  it("should return 400 if section already has an adviser", async () => {
    const res = await request(server)
      .post(`/api/sections/${sectionDocument2._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString() });

    expect(res.status).toBe(400);
  });

  it("should return section if successful", async () => {
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString() });

    expect(res.body.adviser_id).toBe(teacherDocument._id.toHexString());
  });
});

describe("POST /api/sections/:id/teacher", () => {
  let token,
    user,
    userId,
    studentIds,
    sectionDocument1,
    sectionDocument2,
    info,
    teacher,
    teacherDocument,
    teacherIds;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Admin", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    teacherIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    student = {
      _id: studentIds[0],
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999997"
    };
    teacherDocument = await new Teacher(teacher).save();
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
      chairman_id: userId,
      students: [studentIds[0]],
      subject_teachers: [
        {
          learning_area: "English",
          teacher_id: teacherIds[0]
        }
      ]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.number = 2;
    section.students = [studentIds[1]];
    section.adviser_id = teacherIds[1];
    sectionDocument2 = await new Section(section).save();
    info = { number: 3, name: "" };
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Teacher.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      `/api/sections/${sectionDocument1._id.toHexString()}/teacher`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .post(`/api/sections/${mongoose.Types.ObjectId().toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id: teacherIds[0].toHexString(), learning_area: "Filipino" });

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not found", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const learning_area = "Filipino";
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id, learning_area });
    expect(res.status).toBe(400);
  });

  it("should return 400 if section already has a teacher in that learning area", async () => {
    const learning_area = "English";
    const res = await request(server)
      .post(`/api/sections/${sectionDocument2._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString(), learning_area });

    expect(res.status).toBe(400);
  });

  it("should return section if successful", async () => {
    const learning_area = "Filipino";
    const res = await request(server)
      .post(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString(), learning_area });

    const subject_teacher = res.body.subject_teachers.find(teacher => {
      return (
        teacher.teacher_id == teacherDocument._id.toHexString() &&
        teacher.learning_area == learning_area
      );
    });
    expect(subject_teacher).toBeTruthy();
  });
});

describe("DELETE /api/sections/:id/teacher", () => {
  let token,
    user,
    userId,
    studentIds,
    sectionDocument1,
    sectionDocument2,
    info,
    teacher,
    teacherDocument,
    teacherIds;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Admin", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    teacherIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    student = {
      _id: studentIds[0],
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999997"
    };
    teacherDocument = await new Teacher(teacher).save();
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
      chairman_id: userId,
      students: [studentIds[0]],
      subject_teachers: [
        {
          learning_area: "English",
          teacher_id: teacherIds[0]
        },
        {
          learning_area: "Filipino",
          teacher_id: teacherDocument._id
        }
      ]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.number = 2;
    section.students = [studentIds[1]];
    section.adviser_id = teacherIds[1];
    sectionDocument2 = await new Section(section).save();
    info = { number: 3, name: "" };
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Teacher.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      `/api/sections/${sectionDocument1._id.toHexString()}/teacher`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .delete(
        `/api/sections/${mongoose.Types.ObjectId().toHexString()}/teacher`
      )
      .set("x-auth-token", token)
      .send(teacherIds[0].toHexString());

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not found", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const learning_area = "Filipino";
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id, learning_area });
    expect(res.status).toBe(400);
  });

  it("should return 400 if teahcer is not the section  teacher in that learning area", async () => {
    const learning_area = "English";
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString(), learning_area });

    expect(res.status).toBe(400);
  });

  it("should return section if successful", async () => {
    const learning_area = "Filipino";
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/teacher`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString(), learning_area });

    const subject_teacher = res.body.subject_teachers.find(teacher => {
      return (
        teacher.teacher_id == teacherDocument._id.toHexString() &&
        teacher.learning_area == learning_area
      );
    });
    expect(subject_teacher).toBeFalsy();
  });
});

describe("DELETE /api/sections/:id/adviser", () => {
  let token,
    user,
    userId,
    studentIds,
    sectionDocument1,
    sectionDocument2,
    info,
    teacher,
    teacherDocument,
    teacherIds;
  beforeEach(async () => {
    userId = mongoose.Types.ObjectId().toHexString();
    user = {
      _id: userId,
      assignments: [{ category: "Admin", grade_levels: [7] }]
    };
    studentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    teacherIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
    student = {
      _id: studentIds[0],
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999997"
    };
    teacherDocument = await new Teacher(teacher).save();
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
      chairman_id: userId,
      adviser_id: teacherDocument._id,
      students: [studentIds[0]],
      subject_teachers: [
        {
          learning_area: "English",
          teacher_id: teacherIds[0]
        },
        {
          learning_area: "Filipino",
          teacher_id: teacherDocument._id
        }
      ]
    };
    token = new Teacher(user).generateAuthToken();
    sectionDocument1 = await new Section(section).save();
    section.number = 2;
    section.students = [studentIds[1]];
    section.adviser_id = teacherIds[1];
    sectionDocument2 = await new Section(section).save();
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Teacher.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      `/api/sections/${sectionDocument1._id.toHexString()}/adviser`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .delete(
        `/api/sections/${mongoose.Types.ObjectId().toHexString()}/adviser`
      )
      .set("x-auth-token", token)
      .send(teacherIds[0].toHexString());

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not found", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const learning_area = "Filipino";
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id });
    expect(res.status).toBe(400);
  });

  it("should return 400 if adviser is not handling that section", async () => {
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument2._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString() });

    expect(res.status).toBe(400);
  });

  it("should return section if successful", async () => {
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument1._id.toHexString()}/adviser`)
      .set("x-auth-token", token)
      .send({ id: teacherDocument._id.toHexString() });

    expect(res.body.adviser_id).toBeFalsy();
  });
});

describe("DELETE /api/sections/:id", () => {
  let token,
    user,
    section,
    record,
    adviser,
    teacher,
    studentId,
    adviserId,
    teacherId,
    sectionDocument,
    anotherSection,
    anotherSectionDocument,
    recordDocument,
    adviserDocument,
    teacherDocument;
  beforeEach(async () => {
    user = {
      _id: mongoose.Types.ObjectId(),
      assignments: [{ category: "Curriculum Chairman", grade_levels: [7] }]
    };
    token = new Teacher(user).generateAuthToken();

    teacher = {
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999998,
      password: "9999998",
      assignments: [{ category: "Subject Teacher", grade_levels: [7] }]
    };
    adviser = {
      name: {
        first: "Edrian",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 999999,
      password: "0999999",
      assignments: [{ category: "Adviser", grade_levels: [7] }]
    };
    teacherDocument = await new Teacher(teacher).save();
    adviserDocument = await new Teacher(adviser).save();

    adviserId = adviserDocument._id;
    teacherId = teacherDocument._id;
    studentId = mongoose.Types.ObjectId();

    section = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      name: "Earth",
      chairman_id: user._id,
      adviser_id: adviserId,
      students: [studentId],
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: teacherId
        }
      ]
    };
    anotherSection = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 2,
      name: "Mars",
      chairman_id: user._id,
      adviser_id: adviserId,
      students: [studentId],
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: teacherId
        }
      ]
    };

    record = {
      owner_id: studentId,
      completed: false,
      school: {
        name: "	Pres. Sergio Osmena, Sr. High School",
        id: 305296,
        district: "1",
        division: "2",
        region: "NCR"
      },
      grade_level: 7,
      section: "1-Earth",
      school_year: {
        start: 2019,
        end: 2020
      },
      adviser: "Juan Dela Cruz",
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: []
        };
      })
    };

    sectionDocument = await new Section(section).save();
    // anotherSectionDocument = await new Section(anotherSection).save();
    // recordDocument = await new ScholasticRecord(record).save();
  });

  afterEach(async () => {
    await Section.deleteMany({});
    await Teacher.deleteMany({});
    await ScholasticRecord.deleteMany({});
    await SystemLog.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).delete(
      `/api/sections/${sectionDocument._id.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument._id.toHexString()}`)
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  it("should return 400 in no section found", async () => {
    const res = await request(server)
      .delete(`/api/sections/${mongoose.Types.ObjectId().toHexString()}`)
      .set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("should return 400 if one of the students already has a scholastic_record", async () => {
    recordDocument = await new ScholasticRecord(record).save();
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument._id.toHexString()}`)
      .set("x-auth-token", token);
    console.log(res.text);
    expect(res.status).toBe(400);
  });

  it("should return 403 if user is not the chairman of delete section", async () => {
    user._id = mongoose.Types.ObjectId().toHexString();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return deleted section if successfully deleted", async () => {
    const res = await request(server)
      .delete(`/api/sections/${sectionDocument._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.body._id).toBe(sectionDocument._id.toHexString());
  });
});

describe("DELETE /api/sections/:id/:studentId", () => {
  let token,
    user,
    studentId,
    sectionId,
    sectionDocument,
    student,
    studentDocument;
  beforeEach(async () => {
    user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Curriculum Chairman" }]
    };
    token = new Teacher(user).generateAuthToken();
    student = {
      lrn: 1,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };

    //Populate two student in the database
    studentDocument = await new Enrollee(student).save();
    studentId = studentDocument._id;

    section = {
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 7,
      number: 1,
      name: "Earth",
      chairman_id: user._id,
      students: [studentId]
    };

    sectionDocument = await new Section(section).save();
    sectionId = sectionDocument._id;
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await Section.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).delete(
      `/api/sections/${sectionId}/${studentId}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    user.assignments[0].category = "Subject Teacher";
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionId}/${studentId}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if section is not registered", async () => {
    const res = await request(server)
      .delete(
        `/api/sections/${mongoose.Types.ObjectId().toHexString()}/${studentId}`
      )
      .set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("should return 403 if user is not the chairman of accessing section", async () => {
    user._id = mongoose.Types.ObjectId().toHexString();
    token = new Teacher(user).generateAuthToken();
    const res = await request(server)
      .delete(`/api/sections/${sectionId}/${studentId}`)
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  it("should return 400 if the student is not classified in that section", async () => {
    const res = await request(server)
      .delete(
        `/api/sections/${sectionId}/${mongoose.Types.ObjectId().toHexString()}`
      )
      .set("x-auth-token", token);

    expect(res.status).toBe(400);
  });

  it("should return the section where the student is unclassified", async () => {
    const res = await request(server)
      .delete(`/api/sections/${sectionId}/${studentId}`)
      .set("x-auth-token", token);

    expect(!res.body.students.includes(studentId)).toBe(true);
  });
});
