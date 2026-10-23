const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Kamu belum login! Silakan login terlebih dahulu untuk mengakses.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key_sangat_aman");

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User yang memiliki token ini sudah tidak ada.", 401));
  }

  req.user = currentUser;
  next();
});