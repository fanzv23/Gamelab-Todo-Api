const Todo = require("../model/Todo");
const AppError = require("../utils/AppError");

async function createTodo(data) {
  return await Todo.create(data);
}

async function getTodosByUser(userId) {
  return await Todo.find({ user: userId }).populate("category", "name");
}

async function updateTodo(todoId, userId, updateData) {
  const todo = await Todo.findOne({ _id: todoId, user: userId });
  if (!todo) {
    throw new AppError("Todo tidak ditemukan atau kamu tidak memiliki akses", 404);
  }
  Object.assign(todo, updateData);
  return await todo.save();
}

async function deleteTodo(todoId, userId) {
  const todo = await Todo.findOneAndDelete({ _id: todoId, user: userId });
  if (!todo) {
    throw new AppError("Todo tidak ditemukan atau kamu tidak memiliki akses", 404);
  }
  return todo;
}

module.exports = { createTodo, getTodosByUser, updateTodo, deleteTodo };