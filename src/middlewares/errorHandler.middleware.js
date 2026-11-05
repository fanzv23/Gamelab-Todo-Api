function errorHandler(err, req, res, next) {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token tidak valid. Silakan login ulang.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token sudah kedaluwarsa. Silakan login ulang.";
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field || "Data"} sudah terdaftar`;
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Nilai tidak valid untuk ${err.path}`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;