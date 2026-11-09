const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, closeTestDB } = require("./helpers/db");

beforeAll(connectTestDB);
afterAll(closeTestDB);

describe("Dasar aplikasi", () => {
  test("GET / mengembalikan 200 dan pesan API berjalan", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Todo API is running");
  });

  test("route yang tidak ada mengembalikan 404", async () => {
    const res = await request(app).get("/api/ngawur");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});