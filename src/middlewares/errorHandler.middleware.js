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

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;