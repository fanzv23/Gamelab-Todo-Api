const express = require("express");
const logger = require("./middlewares/logger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware global
app.use(logger);
app.use(express.json());

// Route dasar untuk cek server hidup
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Router
app.use("/api/auth", authRoutes);
app.use("/api/todos", require("./routes/todo.routes"));

// notFound dan errorHandler harus paling akhir
app.use(notFound);
app.use(errorHandler);

module.exports = app;