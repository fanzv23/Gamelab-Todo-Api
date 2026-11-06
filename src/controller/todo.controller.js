const todoService = require("../services/todo.service");
const { logActivity } = require("../services/activityLog.service");
const catchAsync = require("../utils/catchAsync");

exports.createTodo = catchAsync(async (req, res, next) => {
  const todoData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user._id,
    created_by: req.user._id,
  };
  const newTodo = await todoService.createTodo(todoData);

  await logActivity({
    userId: req.user._id,
    action: "create",
    entityId: newTodo._id,
    description: `Membuat todo "${newTodo.title}"`,
  });

  res.status(201).json({
    success: true,
    data: { todo: newTodo },
  });
});

exports.getTodos = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  let completed;
  if (req.query.completed === "true") completed = true;
  if (req.query.completed === "false") completed = false;

  const category = req.query.category;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;

  const { todos, total } = await todoService.getTodosByUser(req.user._id, {
    page,
    limit,
    completed,
    category,
    search,
    sort,
  });

  res.status(200).json({
    success: true,
    results: todos.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: { todos },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const updated = await todoService.updateTodo(req.params.id, req.user._id, req.body);

  await logActivity({
    userId: req.user._id,
    action: "update",
    entityId: updated._id,
    description: `Mengubah todo "${updated.title}"`,
  });

  res.status(200).json({
    success: true,
    data: { todo: updated },
  });
});

exports.deleteTodo = catchAsync(async (req, res, next) => {
  const deleted = await todoService.deleteTodo(req.params.id, req.user._id);

  await logActivity({
    userId: req.user._id,
    action: "delete",
    entityId: deleted._id,
    description: `Menghapus todo "${deleted.title}"`,
  });

  res.status(200).json({ success: true, message: "Todo berhasil dihapus" });
});