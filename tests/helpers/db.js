const mongoose = require("mongoose");

const TEST_DB_NAME = "todo_api_test";

function pastikanDatabaseTest() {
  if (mongoose.connection.name !== TEST_DB_NAME) {
    throw new Error(`Test hanya boleh memakai database ${TEST_DB_NAME}`);
  }
}

async function connectTestDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI belum diatur di .env");
  await mongoose.connect(uri, { dbName: TEST_DB_NAME });
  pastikanDatabaseTest();
}

async function clearTestDB() {
  pastikanDatabaseTest();
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

async function closeTestDB() {
  try {
    pastikanDatabaseTest();
    await mongoose.connection.dropDatabase();
  } catch (err) {
    console.error("Gagal menghapus database test:", err.message);
  }
  await mongoose.connection.close();
}

module.exports = { connectTestDB, clearTestDB, closeTestDB };