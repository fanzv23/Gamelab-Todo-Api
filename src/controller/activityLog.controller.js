const ActivityLog = require("../model/ActivityLog");
const catchAsync = require("../utils/catchAsync");

exports.getLogs = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { archived: false };
  if (req.user.role !== "admin") filter.user_id = req.user._id;
  if (req.query.action) filter.action = req.query.action;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: logs.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: { logs },
  });
});