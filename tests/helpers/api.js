const request = require("supertest");
const app = require("../../src/app");

async function daftarUser(nama, email, password = "rahasia123") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: nama, email, password });
  return { token: res.body.token, id: res.body.data.user._id };
}

async function buatKategori(token, name = "Kuliah") {
  const res = await request(app)
    .post("/api/categories")
    .set({ Authorization: `Bearer ${token}` })
    .send({ name });
  return res.body.data.category._id;
}

function buatTodo(token, categoryId, title = "Todo uji", extra = {}) {
  return request(app)
    .post("/api/todos")
    .set({ Authorization: `Bearer ${token}` })
    .send({ title, category: categoryId, ...extra });
}

module.exports = { daftarUser, buatKategori, buatTodo };