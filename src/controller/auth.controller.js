const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_key_sangat_aman", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || "user",
    created_by: req.body.userId || null,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    success: true,
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Harap masukkan email dan password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Email atau password salah", 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    token,
  });
});