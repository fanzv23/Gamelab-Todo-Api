const request = require("supertest");
const app = require("../src/app");
const User = require("../src/model/User");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");

beforeAll(async () => {
  await connectTestDB();
  await User.init(); // pastikan index unik email sudah terbentuk
});
beforeEach(clearTestDB);
afterAll(closeTestDB);

const userBaru = {
  name: "Tester",
  email: "tester@example.com",
  password: "rahasia123",
};

const daftar = (data = userBaru) =>
  request(app).post("/api/auth/register").send(data);

describe("POST /api/auth/register", () => {
  test("berhasil mendaftar: 201, ada token, password tidak ikut dikirim", async () => {
    const res = await daftar();
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.data.user.email).toBe("tester@example.com");
    expect(res.body.data.user.password).toBeUndefined();
  });

  test("role admin dari body diabaikan, user tetap berperan user", async () => {
    const res = await daftar({ ...userBaru, role: "admin" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.role).toBe("user");
  });

  test("email sudah terdaftar: 409", async () => {
    await daftar();
    const res = await daftar();
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("email sudah terdaftar");
  });

  test("email tidak valid: 400", async () => {
    const res = await daftar({ ...userBaru, email: "bukanemail" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email tidak valid");
  });

  test("password terlalu pendek: 400", async () => {
    const res = await daftar({ ...userBaru, password: "123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password minimal 6 karakter");
  });
});

describe("POST /api/auth/login", () => {
  test("login berhasil: 200 dan ada token", async () => {
    await daftar();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userBaru.email, password: userBaru.password });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  test("password salah: 401", async () => {
    await daftar();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userBaru.email, password: "salahbanget" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Email atau password salah");
  });

  test("email tidak terdaftar: 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "tidakada@example.com", password: "rahasia123" });
    expect(res.statusCode).toBe(401);
  });

  test("password kosong: 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userBaru.email });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password wajib diisi");
  });
});