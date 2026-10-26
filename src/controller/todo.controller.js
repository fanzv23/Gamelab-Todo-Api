const todoService = require("../services/todo.service");
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
  res.status(201).json({
    success: true,
    data: { todo: newTodo },
  });
});

exports.getTodos = catchAsync(async (req, res, next) => {
  const todos = await todoService.getTodosByUser(req.user._id);
  res.status(200).json({
    success: true,
    results: todos.length,
    data: { todos },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const updated = await todoService.updateTodo(req.params.id, req.user._id, req.body);
  res.status(200).json({
    success: true,
    data: { todo: updated },
  });
});

exports.deleteTodo = catchAsync(async (req, res, next) => {
  await todoService.deleteTodo(req.params.id, req.user._id);
  res.status(204).json({
    success: true,
    data: null,
  });
});