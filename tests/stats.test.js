const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");
const { daftarUser, buatKategori, buatTodo } = require("./helpers/api");

const API_KEY_UJI = "kunci-uji-stats";
let user;

beforeAll(async () => {
  process.env.API_KEY = API_KEY_UJI;
  await connectTestDB();
  await clearTestDB();

  user = await daftarUser("Tester Stats", "stats@example.com");
  const kategori = await buatKategori(user.token, "Kuliah");

  const pertama = await buatTodo(user.token, kategori, "Satu");
  await buatTodo(user.token, kategori, "Dua");
  await buatTodo(user.token, kategori, "Tiga");

  await request(app)
    .patch(`/api/todos/${pertama.body.data.todo._id}`)
    .set({ Authorization: `Bearer ${user.token}` })
    .send({ completed: true });
});

afterAll(closeTestDB);

describe("GET /api/stats (dilindungi API Key)", () => {
  test("tanpa header x-api-key: 401", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe(
      "API Key wajib disertakan pada header x-api-key"
    );
  });

  test("API Key salah: 403", async () => {
    const res = await request(app)
      .get("/api/stats")
      .set("x-api-key", "kunci-salah");
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("API Key tidak valid");
  });

  test("token login (JWT) saja tidak cukup: 401", async () => {
    const res = await request(app)
      .get("/api/stats")
      .set({ Authorization: `Bearer ${user.token}` });
    expect(res.statusCode).toBe(401);
  });

  test("API Key benar: 200 dan ringkasan data sesuai", async () => {
    const res = await request(app)
      .get("/api/stats")
      .set("x-api-key", API_KEY_UJI);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.users).toBe(1);
    expect(res.body.data.categories).toBe(1);
    expect(res.body.data.todos).toEqual({
      total: 3,
      completed: 1,
      pending: 2,
      completionRate: 33,
    });
    expect(res.body.data.todosPerCategory).toEqual([
      { category: "Kuliah", total: 3 },
    ]);
  });
});