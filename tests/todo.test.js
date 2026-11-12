const request = require("supertest");
const app = require("../src/app");
const Todo = require("../src/model/Todo");
const Category = require("../src/model/Category");
const ActivityLog = require("../src/model/ActivityLog");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");
const { daftarUser, buatKategori, buatTodo } = require("./helpers/api");

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const judulSemua = (res) => res.body.data.todos.map((t) => t.title);

let userA;
let userB;
let kategoriA;

beforeAll(async () => {
  await connectTestDB();
  await clearTestDB();
  userA = await daftarUser("User A", "a@example.com");
  userB = await daftarUser("User B", "b@example.com");
});

beforeEach(async () => {
  await Promise.all([
    Todo.deleteMany({}),
    Category.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  kategoriA = await buatKategori(userA.token, "Kuliah");
});

afterAll(closeTestDB);

describe("Akses dan pembuatan todo", () => {
  test("tanpa token: 401", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.statusCode).toBe(401);
  });

  test("membuat todo: 201 dan terhubung ke user serta kategori", async () => {
    const res = await buatTodo(userA.token, kategoriA, "Belajar Jest");
    expect(res.statusCode).toBe(201);
    expect(res.body.data.todo.title).toBe("Belajar Jest");
    expect(res.body.data.todo.user).toBe(userA.id);
    expect(res.body.data.todo.category).toBe(kategoriA);
    expect(res.body.data.todo.completed).toBe(false);
  });

  test("judul kosong: 400", async () => {
    const res = await buatTodo(userA.token, kategoriA, "");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Judul todo wajib diisi");
  });

  test("ID kategori tidak valid: 400", async () => {
    const res = await buatTodo(userA.token, "ngawur", "Tes");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("ID kategori tidak valid");
  });
});

describe("Daftar todo: pagination, filter, sorting, search", () => {
  test("pagination halaman 1 dan 2", async () => {
    for (const judul of ["Satu", "Dua", "Tiga"]) {
      await buatTodo(userA.token, kategoriA, judul);
    }

    const h1 = await request(app)
      .get("/api/todos?page=1&limit=2")
      .set(auth(userA.token));
    expect(h1.statusCode).toBe(200);
    expect(h1.body.results).toBe(2);
    expect(h1.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const h2 = await request(app)
      .get("/api/todos?page=2&limit=2")
      .set(auth(userA.token));
    expect(h2.body.results).toBe(1);
    expect(h2.body.pagination.page).toBe(2);
  });

  test("filter completed true dan false", async () => {
    const t1 = await buatTodo(userA.token, kategoriA, "Selesai");
    await buatTodo(userA.token, kategoriA, "Belum selesai");
    await request(app)
      .patch(`/api/todos/${t1.body.data.todo._id}`)
      .set(auth(userA.token))
      .send({ completed: true });

    const selesai = await request(app)
      .get("/api/todos?completed=true")
      .set(auth(userA.token));
    expect(selesai.body.pagination.total).toBe(1);
    expect(judulSemua(selesai)).toEqual(["Selesai"]);

    const belum = await request(app)
      .get("/api/todos?completed=false")
      .set(auth(userA.token));
    expect(belum.body.pagination.total).toBe(1);
    expect(judulSemua(belum)).toEqual(["Belum selesai"]);
  });

  test("filter berdasarkan kategori", async () => {
    const kategoriPribadi = await buatKategori(userA.token, "Pribadi");
    await buatTodo(userA.token, kategoriA, "Tugas kuliah");
    await buatTodo(userA.token, kategoriPribadi, "Urusan pribadi");

    const res = await request(app)
      .get(`/api/todos?category=${kategoriPribadi}`)
      .set(auth(userA.token));
    expect(res.body.pagination.total).toBe(1);
    expect(judulSemua(res)).toEqual(["Urusan pribadi"]);
  });

  test("search tidak membedakan huruf besar dan kecil", async () => {
    await buatTodo(userA.token, kategoriA, "Belajar Jest");
    await buatTodo(userA.token, kategoriA, "Beli susu");

    const res = await request(app)
      .get("/api/todos?search=belajar")
      .set(auth(userA.token));
    expect(res.body.pagination.total).toBe(1);
    expect(judulSemua(res)).toEqual(["Belajar Jest"]);
  });

  test("sorting judul A ke Z dan Z ke A", async () => {
    for (const judul of ["Charlie", "Alpha", "Bravo"]) {
      await buatTodo(userA.token, kategoriA, judul);
    }

    const naik = await request(app)
      .get("/api/todos?sort=title")
      .set(auth(userA.token));
    expect(judulSemua(naik)).toEqual(["Alpha", "Bravo", "Charlie"]);

    const turun = await request(app)
      .get("/api/todos?sort=-title")
      .set(auth(userA.token));
    expect(judulSemua(turun)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  test("page bukan angka: 400", async () => {
    const res = await request(app)
      .get("/api/todos?page=abc")
      .set(auth(userA.token));
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("page harus berupa angka bulat minimal 1");
  });

  test("limit terlalu besar: 400", async () => {
    const res = await request(app)
      .get("/api/todos?limit=999")
      .set(auth(userA.token));
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("limit harus berupa angka antara 1 dan 50");
  });
});

describe("Ubah dan hapus todo", () => {
  test("mengubah todo: 200", async () => {
    const dibuat = await buatTodo(userA.token, kategoriA, "Judul lama");
    const id = dibuat.body.data.todo._id;

    const res = await request(app)
      .patch(`/api/todos/${id}`)
      .set(auth(userA.token))
      .send({ title: "Judul baru", completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.todo.title).toBe("Judul baru");
    expect(res.body.data.todo.completed).toBe(true);
  });

  test("mengubah todo milik user lain: 404", async () => {
    const dibuat = await buatTodo(userA.token, kategoriA, "Punya A");
    const id = dibuat.body.data.todo._id;

    const res = await request(app)
      .patch(`/api/todos/${id}`)
      .set(auth(userB.token))
      .send({ title: "Dibajak" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(
      "Todo tidak ditemukan atau kamu tidak memiliki akses"
    );
  });

  test("menghapus todo: 200 (soft delete), lalu menghapus lagi: 404", async () => {
    const dibuat = await buatTodo(userA.token, kategoriA, "Akan dihapus");
    const id = dibuat.body.data.todo._id;

    const hapus = await request(app)
      .delete(`/api/todos/${id}`)
      .set(auth(userA.token));
    expect(hapus.statusCode).toBe(200);
    expect(hapus.body.message).toBe("Todo berhasil dihapus");

    const diDb = await Todo.findById(id);
    expect(diDb.archived).toBe(true);

    const daftar = await request(app).get("/api/todos").set(auth(userA.token));
    expect(daftar.body.pagination.total).toBe(0);

    const lagi = await request(app)
      .delete(`/api/todos/${id}`)
      .set(auth(userA.token));
    expect(lagi.statusCode).toBe(404);
  });
});

describe("Activity log", () => {
  test("membuat todo tercatat di log milik pembuatnya", async () => {
    await buatTodo(userA.token, kategoriA, "Dicatat");

    const res = await request(app).get("/api/logs").set(auth(userA.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data.logs[0].action).toBe("create");
  });

  test("user lain tidak melihat log milik orang lain", async () => {
    await buatTodo(userA.token, kategoriA, "Dicatat");

    const res = await request(app).get("/api/logs").set(auth(userB.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.total).toBe(0);
  });

  test("alias /api/activity-logs bisa diakses user biasa", async () => {
    await buatTodo(userA.token, kategoriA, "Dicatat");

    const res = await request(app)
      .get("/api/activity-logs")
      .set(auth(userA.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe("Validasi kategori pada todo", () => {
  const kategoriPalsu = "6ae974bc4ed88a7073550e1c";

  test("POST dengan kategori yang tidak ada: 404", async () => {
    const res = await buatTodo(userA.token, kategoriPalsu, "Tes");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Kategori tidak ditemukan atau bukan milik kamu");
  });

  test("POST dengan kategori milik user lain: 404", async () => {
    const kategoriB = await buatKategori(userB.token, "Punya B");
    const res = await buatTodo(userA.token, kategoriB, "Tes");
    expect(res.statusCode).toBe(404);
  });

  test("PATCH dengan kategori yang tidak ada: 404", async () => {
    const dibuat = await buatTodo(userA.token, kategoriA, "Punya A");
    const res = await request(app)
      .patch(`/api/todos/${dibuat.body.data.todo._id}`)
      .set(auth(userA.token))
      .send({ category: kategoriPalsu });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Kategori tidak ditemukan atau bukan milik kamu");
  });
});