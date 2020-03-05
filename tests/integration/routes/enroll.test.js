const request = require("supertest");
const mongoose = require("mongoose");
const { Enrollee } = require("../../../models/enrollee");
const { Teacher } = require("../../../models/teacher");

describe("POST /api/enroll", () => {
  let server;
  let token, teacher, enrollee, enrolleeDocument;

  beforeEach(() => {
    server = require("../../../index");
    teacher = {
      _id: (customerId = mongoose.Types.ObjectId().toHexString()),
      assignments: [{ category: "Curriculum Chairman" }]
    };
    enrollee = {
      lrn: 999999999998,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await server.close();
  });

  it("should return 401 if unauthenticated", async () => {
    //token = new Teacher(teacher).generateAuthToken();
    const res = await request(server).post("/api/enroll");
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/enroll")
      .set("x-auth-token", token);
    expect(res.status).toBe(403);
  });

  //   it("should return 500 if request object has undefined values", async () => {
  //     enrollee.lrn = undefined;
  //     token = new Teacher(teacher).generateAuthToken();
  //     const res = await request(server)
  //       .post("/api/enroll")
  //       .set("x-auth-token", token)
  //       .send(enrollee);
  //     expect(res.status).toBe(500);
  //   });

  it("should return 400 if object is invalid", async () => {
    enrollee.lrn = -1;
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/enroll")
      .set("x-auth-token", token)
      .send(enrollee);
    expect(res.status).toBe(400);
  });

  it("should return 400 if enrollee is already enrolled", async () => {
    enrolleeDocument = new Enrollee(enrollee);
    await enrolleeDocument.save();
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/enroll")
      .set("x-auth-token", token)
      .send(enrollee);
    expect(res.status).toBe(400);
  });

  it("should return enrolled student if enrollee is valid", async () => {
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .post("/api/enroll")
      .set("x-auth-token", token)
      .send(enrollee);
    expect(res.body.lrn).toBe(enrollee.lrn);
  });
});

describe("DELETE /api/enrollee", () => {
  let server;
  let token, teacher, enrollee, enrolleId, enrolleeDocument;

  beforeEach(async () => {
    server = require("../../../index");
    teacher = {
      _id: (customerId = mongoose.Types.ObjectId().toHexString()),
      assignments: [
        {
          category: "Curriculum Chairman"
        }
      ]
    };
    enrolleId = mongoose.Types.ObjectId();
    enrollee = {
      _id: enrolleId,
      lrn: 999999999998,
      name: {
        last: "Ferrer",
        first: "Edrian Jose",
        middle: "De Guzman"
      }
    };
    enrolleeDocument = new Enrollee(enrollee);
    await enrolleeDocument.save();
  });

  afterEach(async () => {
    await Enrollee.deleteMany({});
    await server.close();
  });

  it("should return 401 if unauthenticated", async () => {
    const res = await request(server).delete(
      "/api/enroll/" + enrolleId.toHexString()
    );
    expect(res.status).toBe(401);
  });

  it("should return 403 if unauthorized", async () => {
    teacher.assignments[0].category = "Subject Teacher";
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .delete("/api/enroll/" + enrolleId.toHexString())
      .set("x-auth-token", token);

    expect(res.status).toBe(403);
  });

  it("should return 400 if deleting enrollee is not in the database", async () => {
    token = new Teacher(teacher).generateAuthToken();
    --enrollee.lrn;
    const res = await request(server)
      .delete("/api/enroll/" + enrollee.lrn)
      .set("x-auth-token", token);

    expect(res.status).toBe(400);
  });
  it("should return deleted enrollee is successful", async () => {
    token = new Teacher(teacher).generateAuthToken();
    const res = await request(server)
      .delete("/api/enroll/" + enrollee.lrn)
      .set("x-auth-token", token);

    expect(res.body.lrn).toBe(enrollee.lrn);
  });
});
