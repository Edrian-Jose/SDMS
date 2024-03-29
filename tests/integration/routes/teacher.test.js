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

describe("POST /api/teachers/", () => {
  let token, teacher, admin, teacherDocument;
  beforeEach(async () => {
    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    };
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
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
    teacher.name.first = "Erika May";
    teacher.employee_number = 9999999;
    //token = new Teacher(admin).generateAuthToken();
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
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
    expect(parseInt(res.body.employee_number)).toBe(teacher.employee_number);
  });
});

describe("GET /api/teachers", () => {
  let token, teacher, admin, teacherDocument, teacherIds;
  beforeEach(async () => {
    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    };
    teacher = {
      name: {
        first: "Edrian",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 1,
      password: "1234567",
      assignments: [
        {
          category: "Subject Teacher"
        }
      ]
    };
    teacherIds = [];
    for (let i = 0; i < 10; i++) {
      teacherIds.push(mongoose.Types.ObjectId());
      teacher._id = teacherIds[i];
      teacher.employee_number++;
      teacher.name.first += "n";
      teacherDocument = new Teacher(teacher);
      await teacherDocument.save();
    }
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get("/api/teachers");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get("/api/teachers")
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  it("should return teachers if successful", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get("/api/teachers")
      .set("x-auth-token", token);
    expect(res.body.length).toBe(teacherIds.length);
  });
});

describe("GET /api/teachers/:id", () => {
  let token, teacher, admin, teacherDocument, teacherId;
  beforeEach(async () => {
    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    };
    teacher = {
      name: {
        first: "Edrian",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 1,
      password: "1234567",
      assignments: [
        {
          category: "Subject Teacher"
        }
      ]
    };
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
    teacherId = teacherDocument._id;
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).get(
      `/api/teachers/${teacherId.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get(`/api/teachers/${teacherId.toHexString()}`)
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  it("should return teacher info if successful", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .get(`/api/teachers/${teacherId.toHexString()}`)
      .set("x-auth-token", token);
    expect(res.body._id).toBe(teacherId.toHexString());
  });
});

describe("PUT /api/teachers/:id", () => {
  let token, teacher, admin, teacherDocument;
  beforeEach(async () => {
    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    };
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
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
    teacher.name.first = "Erika May";
    teacher.employee_number = 9999999;
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).put(
      `/api/teachers/${teacherDocument._id.toHexString()}`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherDocument._id.toHexString()}`)
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if teacher obj is invalid", async () => {
    token = new Teacher(admin).generateAuthToken();
    delete teacher.birthdate;
    const res = await request(server)
      .put(`/api/teachers/${teacherDocument._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(teacher);
    expect(res.status).toBe(400);
  });

  it("should return 400 if employee number is already registered", async () => {
    teacher.employee_number = 9999998;
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherDocument._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(teacher);

    expect(res.status).toBe(400);
  });

  it("should return 400 if teacher is already registered", async () => {
    teacher.name.first = "Edrian Jose";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherDocument._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(teacher);
    expect(res.status).toBe(400);
  });

  it("should return created teacher if successful", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherDocument._id.toHexString()}`)
      .set("x-auth-token", token)
      .send(teacher);
    expect(parseInt(res.body.employee_number)).toBe(teacher.employee_number);
  });
});

describe("PUT /api/teachers/:id/resetpassword", () => {
  let token, teacher, admin, teacherDocument, teacherId;
  beforeEach(async () => {
    admin = {
      _id: mongoose.Types.ObjectId().toHexString(),
      assignments: [{ category: "Admin" }]
    };
    teacher = {
      name: {
        first: "Edrian",
        middle: "De Guzman",
        last: "Ferrer"
      },
      birthdate: "2000-01-12T16:00:00.000Z",
      gender: "Male",
      employee_number: 1,
      password: "1234567",
      assignments: [
        {
          category: "Subject Teacher"
        }
      ]
    };
    teacherDocument = new Teacher(teacher);
    await teacherDocument.save();
    teacherId = teacherDocument._id;
  });

  afterEach(async () => {
    await Teacher.deleteMany({});
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).put(
      `/api/teachers/${teacherId.toHexString()}/resetpassword`
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    admin.assignments[0].category = "Subject Teacher";
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherId.toHexString()}/resetpassword`)
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  it("should return 400 if teacher doesn't exist", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(
        `/api/teachers/${mongoose.Types.ObjectId().toHexString()}/resetpassword`
      )
      .set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("should return teacher fullname if successful", async () => {
    token = new Teacher(admin).generateAuthToken();
    const res = await request(server)
      .put(`/api/teachers/${teacherId.toHexString()}/resetpassword`)
      .set("x-auth-token", token);
    expect(res.text).toBe(teacherDocument.fullname());
  });
});
