const express = require("express");
const logger = require("./middlewares/logger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

// 1. Impor router auth yang sudah kamu buat
const authRoutes = require("./routes/auth.routes"); // Sesuaikan path jika foldernya berbeda

const app = express();

// Middleware global — urutan pemasangan penting!
app.use(logger);
app.use(express.json());

// Route dasar untuk cek server hidup
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// 2. Pasang router auth di sini (sebelum notFound)
app.use("/api/auth", authRoutes);

// Middleware notFound — menangkap route yang tidak terdaftar
app.use(notFound);

// Middleware errorHandler — HARUS dipasang paling akhir
app.use(errorHandler);

module.exports = app;