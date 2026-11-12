const express = require("express");
const logger = require("./middlewares/logger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

// Import Swagger
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("./docs/openapi");

const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware global
app.use(logger);
app.use(express.json());

// Route dasar untuk cek server hidup
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Dokumentasi API (Swagger UI)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Router
app.use("/api/auth", authRoutes);
app.use("/api/todos", require("./routes/todo.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/logs", require("./routes/activityLog.routes"));
app.use("/api/activity-logs", require("./routes/activityLog.routes"));
app.use("/api/stats", require("./routes/stats.routes"));

// notFound dan errorHandler harus paling akhir
app.use(notFound);
app.use(errorHandler);

module.exports = app;