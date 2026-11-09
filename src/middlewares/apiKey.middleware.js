const crypto = require("crypto");
const AppError = require("../utils/AppError");

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = (req, res, next) => {
  const expected = process.env.API_KEY;
  if (!expected) {
    return next(new AppError("API Key belum dikonfigurasi di server", 500));
  }

  const provided = req.headers["x-api-key"];
  if (!provided) {
    return next(new AppError("API Key wajib disertakan pada header x-api-key", 401));
  }
  if (!safeEqual(provided, expected)) {
    return next(new AppError("API Key tidak valid", 403));
  }

  next();
};