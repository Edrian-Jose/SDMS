const request = require("supertest");
const mongoose = require("mongoose");
const { Student } = require("../../../models/student");
const { Teacher } = require("../../../models/teacher");
const { Section } = require("../../../models/section");
const { ScholasticRecord } = require("../../../models/scholastic_record");
const SystemLog = require("../../../models/log");
const learning_areas = require("../../../plugins/learning_areas");

let server;
beforeEach(async () => {
  server = require("../../../index");
});

afterEach(async () => {
  await SystemLog.deleteMany({});
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
      lrn: 3,
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
    student.lrn = 3;
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/students")
      .set("x-auth-token", token)
      .send(student);

    expect(res.status).toBe(400);
  });

  it("should return 400 if student is already registered", async () => {
    student.name.first = "Edrian JosE";
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

    expect(parseInt(res.body.lrn)).toBe(student.lrn);
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
      gender: "Male",
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
      gender: "Male",
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
      gender: "Male",
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

    expect(res.body._id).toBe(studentId.toHexString());
  });
});

describe("POST /api/students/:id", () => {
  let token,
    teacher,
    studentId,
    student,
    studentDocument,
    record,
    recordDocument;

  beforeEach(async () => {
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
    recordDocument = new ScholasticRecord(record);
    await recordDocument.save();
    record.grade_level = 8;
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await ScholasticRecord.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      "/api/students/" + studentId.toHexString()
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();

    const res = await request(server)
      .post("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if record obj is invalid", async () => {
    token = new Teacher(teacher).generateAuthToken();
    delete record.owner_id;
    const res = await request(server)
      .post("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(record);
    expect(res.status).toBe(400);
  });

  it("should return 400 if record already exist", async () => {
    token = new Teacher(teacher).generateAuthToken();
    record.grade_level = 7;
    const res = await request(server)
      .post("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(record);

    expect(res.status).toBe(400);
  });

  it("should return record obj if successful", async () => {
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/students/" + studentId.toHexString())
      .set("x-auth-token", token)
      .send(record);

    expect(res.body.owner_id).toBe(studentId.toHexString());
  });
});

describe("PUT /api/students/:id/recordId", () => {
  // if record obj is invalid
  // if new record is already exists
  // if successful
  let token,
    teacher,
    studentId,
    student,
    studentDocument,
    recordId,
    record,
    recordDocument;

  beforeEach(async () => {
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
    recordDocument = new ScholasticRecord(record);
    await recordDocument.save();

    record.grade_level = 8;
    recordDocument = new ScholasticRecord(record);
    await recordDocument.save();
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await ScholasticRecord.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).put(
      `/api/students/${studentId.toHexString()}/${recordDocument._id.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();

    const res = await request(server)
      .put(
        `/api/students/${studentId.toHexString()}/${recordDocument._id.toHexString()}`
      )
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if record obj is invalid", async () => {
    token = new Teacher(teacher).generateAuthToken();
    delete record.owner_id;
    const res = await request(server)
      .put(
        `/api/students/${studentId.toHexString()}/${recordDocument._id.toHexString()}`
      )
      .set("x-auth-token", token)
      .send(record);
    expect(res.status).toBe(400);
  });

  it("should return 400 if record already exist", async () => {
    token = new Teacher(teacher).generateAuthToken();
    record.grade_level = 7;
    const res = await request(server)
      .put(
        `/api/students/${studentId.toHexString()}/${recordDocument._id.toHexString()}`
      )
      .set("x-auth-token", token)
      .send(record);

    expect(res.status).toBe(400);
  });

  it("should return record obj if successful", async () => {
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .put(
        `/api/students/${studentId.toHexString()}/${recordDocument._id.toHexString()}`
      )
      .set("x-auth-token", token)
      .send(record);

    expect(res.body._id).toBe(recordDocument._id.toHexString());
  });
});

describe("POST /api/students/:id/grades", () => {
  let steacherid,
    ateacherid,
    cteacherid,
    ateacher,
    steacher,
    cteacher,
    student1id,
    student2id,
    student1,
    student2,
    section1,
    section2,
    grade1,
    grade2;
  beforeEach(async () => {
    steacherid = mongoose.Types.ObjectId();
    ateacherid = mongoose.Types.ObjectId();
    cteacherid = mongoose.Types.ObjectId();
    student1id = mongoose.Types.ObjectId();
    student2id = mongoose.Types.ObjectId();
    steacher = new Teacher({
      _id: steacherid,
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999998,
      password: "9999998",
      assignments: [
        {
          category: "Subject Teacher"
        }
      ]
    });
    token = steacher.generateAuthToken();
    await steacher.save();
    ateacher = new Teacher({
      _id: ateacherid,
      name: {
        first: "Edriann Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999998",
      assignments: [
        {
          category: "Adviser"
        }
      ]
    });
    await ateacher.save();
    cteacher = new Teacher({
      _id: cteacherid,
      name: {
        first: "Edriann Josee",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999996,
      password: "9999998",
      assignments: [
        {
          category: "Curriculum Chairman"
        }
      ]
    });
    await ateacher.save();
    student1 = new Student({
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
    });
    await student1.save();
    student2 = new Student({
      lrn: 2,
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
    });
    await student2.save();
    section1 = new Section({
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 8,
      number: 1,
      adviser_id: ateacherid,
      chairman_id: cteacherid,
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: steacherid
        },
        {
          learning_area: "English",
          teacher_id: ateacherid
        }
      ],
      students: [student1._id]
    });
    section2 = new Section({
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
          learning_area: "English",
          teacher_id: ateacherid
        }
      ],
      students: [student2._id]
    });

    record1 = new ScholasticRecord({
      owner_id: student1._id,
      completed: true,
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
        start: 2018,
        end: 2019
      },
      adviser: "Juan Dela Cruz",
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: [87, 88, 90, 85]
        };
      })
    });

    record2 = new ScholasticRecord({
      owner_id: student1._id,
      completed: false,
      school: {
        name: "	Pres. Sergio Osmena, Sr. High School",
        id: 305296,
        district: "1",
        division: "2",
        region: "NCR"
      },
      grade_level: 8,
      section: "1-Earth",
      school_year: {
        start: 2019,
        end: 2020
      },
      adviser: "Juan Dela Cruz",
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: [87]
        };
      })
    });

    grade1 = {
      learning_area: "Filipino",
      quarter: 2,
      grade: 95
    };
    grade2 = {
      learning_area: "Filipino",
      quarter: 1,
      grade: 90
    };
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Section.deleteMany({});
    await ScholasticRecord.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).post(
      `/api/students/${student1._id.toHexString()}/grades`
    );
    expect(res.status).toBe(401);
  });

  it("should return 400 if record obj is invalid", async () => {
    delete grade1.grade;
    const res = await request(server)
      .post(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not handlling the student", async () => {
    section1.subject_teachers[0].learning_area = "Mathematics";
    await section1.save();
    await section2.save();
    await record1.save();
    await record2.save();
    const res = await request(server)
      .post(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    expect(res.status).toBe(400);
  });

  it("should return 400 if previous record we're incomplete", async () => {
    await section1.save();
    await section2.save();
    const res = await request(server)
      .post(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    expect(res.status).toBe(400);
  });

  it("should return 400 if previous grades we're not encoded yet", async () => {
    await section1.save();
    await section2.save();
    await record1.save();
    const res = await request(server)
      .post(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);

    expect(res.status).toBe(400);
  });
  it("should return record object with grades if successfu", async () => {
    await section1.save();
    await section2.save();
    await record1.save();
    await record2.save();
    const res = await request(server)
      .post(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    const subject = res.body.subjects.find(subject => {
      return subject.learning_area == grade1.learning_area;
    });
    expect(subject.quarter_rating[grade1.quarter - 1]).toBe(grade1.grade);
  });
});

describe("DELETE /api/students/:id/grades", () => {
  let steacherid,
    ateacherid,
    cteacherid,
    ateacher,
    steacher,
    cteacher,
    student1id,
    student2id,
    student1,
    student2,
    section1,
    section2,
    grade1,
    grade2;
  beforeEach(async () => {
    steacherid = mongoose.Types.ObjectId();
    ateacherid = mongoose.Types.ObjectId();
    cteacherid = mongoose.Types.ObjectId();
    student1id = mongoose.Types.ObjectId();
    student2id = mongoose.Types.ObjectId();
    steacher = new Teacher({
      _id: steacherid,
      name: {
        first: "Edrian Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999998,
      password: "9999998",
      assignments: [
        {
          category: "Subject Teacher"
        }
      ]
    });
    token = steacher.generateAuthToken();
    await steacher.save();
    ateacher = new Teacher({
      _id: ateacherid,
      name: {
        first: "Edriann Jose",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999997,
      password: "9999998",
      assignments: [
        {
          category: "Adviser"
        }
      ]
    });
    await ateacher.save();
    cteacher = new Teacher({
      _id: cteacherid,
      name: {
        first: "Edriann Josee",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 9999996,
      password: "9999998",
      assignments: [
        {
          category: "Curriculum Chairman"
        }
      ]
    });
    await ateacher.save();
    student1 = new Student({
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
    });
    await student1.save();
    student2 = new Student({
      lrn: 2,
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
    });
    await student2.save();
    section1 = new Section({
      school_year: {
        start: 2019,
        end: 2020
      },
      grade_level: 8,
      number: 1,
      adviser_id: ateacherid,
      chairman_id: cteacherid,
      subject_teachers: [
        {
          learning_area: "Filipino",
          teacher_id: steacherid
        },
        {
          learning_area: "English",
          teacher_id: ateacherid
        }
      ],
      students: [student1._id]
    });
    section2 = new Section({
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
          learning_area: "English",
          teacher_id: ateacherid
        }
      ],
      students: [student2._id]
    });

    record1 = new ScholasticRecord({
      owner_id: student1._id,
      completed: true,
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
        start: 2018,
        end: 2019
      },
      adviser: "Juan Dela Cruz",
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: [87, 88, 90, 85]
        };
      })
    });

    record2 = new ScholasticRecord({
      owner_id: student1._id,
      completed: false,
      school: {
        name: "	Pres. Sergio Osmena, Sr. High School",
        id: 305296,
        district: "1",
        division: "2",
        region: "NCR"
      },
      grade_level: 8,
      section: "1-Earth",
      school_year: {
        start: 2019,
        end: 2020
      },
      adviser: "Juan Dela Cruz",
      subjects: learning_areas.map(area => {
        return {
          learning_area: area,
          quarter_rating: [87]
        };
      })
    });

    grade1 = {
      learning_area: "Filipino",
      quarter: 2,
      grade: 95
    };
    grade2 = {
      learning_area: "Filipino",
      quarter: 1,
      grade: 90
    };

    await record1.save();
    // await record2.save();
    const record3 = new ScholasticRecord({
      school: {
        name: "Pres. Sergio Osmena, Sr. High School",
        id: 305296,
        district: "1",
        division: "2",
        region: "NCR"
      },
      school_year: { start: 2019, end: 2020 },
      remedials: { subjects: [] },
      completed: false,
      owner_id: student1._id,
      grade_level: 8,
      section: "1-Earth",
      adviser: "Juan Dela Cruz",
      subjects: [
        {
          quarter_rating: [87, 95],
          learning_area: "Filipino"
        },
        {
          quarter_rating: [87],
          learning_area: "English"
        },
        {
          quarter_rating: [87],
          learning_area: "Mathematics"
        },
        {
          quarter_rating: [87],
          learning_area: "Science"
        },
        {
          quarter_rating: [87],
          learning_area: "Araling Panlipunan (AP)"
        },
        {
          quarter_rating: [87],
          learning_area: "Edukasyon sa Pagpapakatao (EsP)"
        },
        {
          quarter_rating: [87],
          learning_area: "Technology and Livelihood Education (TLE)"
        },
        {
          quarter_rating: [87],
          learning_area: "MAPEH"
        },
        {
          quarter_rating: [87],
          learning_area: "Music"
        },
        {
          quarter_rating: [87],
          learning_area: "Arts"
        },
        {
          quarter_rating: [87],
          learning_area: "Physical Education"
        },
        {
          quarter_rating: [87],
          learning_area: "Health"
        }
      ]
    });
    await record3.save();
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Section.deleteMany({});
    await ScholasticRecord.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).delete(
      `/api/students/${student1._id.toHexString()}/grades`
    );
    expect(res.status).toBe(401);
  });

  it("should return 400 if record obj is invalid", async () => {
    delete grade1.grade;
    const res = await request(server)
      .delete(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is not handlling the student", async () => {
    section1.subject_teachers[0].learning_area = "Mathematics";
    await section1.save();
    await section2.save();
    const res = await request(server)
      .delete(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);
    expect(res.status).toBe(400);
  });

  it("should return record object with deleted grade if successful", async () => {
    await section1.save();
    await section2.save();
    const res = await request(server)
      .delete(`/api/students/${student1._id.toHexString()}/grades`)
      .set("x-auth-token", token)
      .send(grade1);

    const subject = res.body.subjects.find(subject => {
      return subject.learning_area == grade1.learning_area;
    });
    expect(subject.quarter_rating[grade1.quarter - 1]).toBeFalsy();
  });
});
