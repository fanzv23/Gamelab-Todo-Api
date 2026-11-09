const Todo = require("../model/Todo");
const User = require("../model/User");
const Category = require("../model/Category");
const catchAsync = require("../utils/catchAsync");

exports.getStats = catchAsync(async (req, res, next) => {
  const [totalUsers, totalCategories, totalTodos, completedTodos, todosPerCategory] =
    await Promise.all([
      User.countDocuments({ archived: false }),
      Category.countDocuments({ archived: false }),
      Todo.countDocuments({ archived: false }),
      Todo.countDocuments({ archived: false, completed: true }),
      Todo.aggregate([
        { $match: { archived: false } },
        { $group: { _id: "$category", total: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $project: { _id: 0, category: "$category.name", total: 1 } },
        { $sort: { total: -1 } },
      ]),
    ]);

  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      categories: totalCategories,
      todos: {
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
        completionRate,
      },
      todosPerCategory,
    },
  });
});