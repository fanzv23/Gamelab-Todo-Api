const User = require("../model/User");
const catchAsync = require("../utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ archived: false });
  res.status(200).json({ success: true, results: users.length, data: { users } });
});