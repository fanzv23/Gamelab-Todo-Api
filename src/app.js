const express = require("express");
const logger = require("./middlewares/logger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

// Middleware global — urutan pemasangan penting!
app.use(logger);
app.use(express.json());

// Route dasar untuk cek server hidup
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Middleware notFound — menangkap route yang tidak terdaftar
app.use(notFound);

// Middleware errorHandler — HARUS dipasang paling akhir
app.use(errorHandler);

module.exports = app;