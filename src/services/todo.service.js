const Todo = require("../model/Todo");
const AppError = require("../utils/AppError");

const ALLOWED_SORT_FIELDS = ["created_at", "updated_at", "title", "completed"];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Contoh sort: "title", "-title", "-created_at,title"
function buildSort(sort) {
  const sortOption = {};
  if (sort) {
    sort.split(",").forEach((item) => {
      const desc = item.startsWith("-");
      const field = desc ? item.slice(1) : item;
      if (ALLOWED_SORT_FIELDS.includes(field)) {
        sortOption[field] = desc ? -1 : 1;
      }
    });
  }
  if (Object.keys(sortOption).length === 0) sortOption.created_at = -1;
  sortOption._id = 1;
  return sortOption;
}

async function createTodo(data) {
  return await Todo.create(data);
}

async function getTodosByUser(
  userId,
  { page = 1, limit = 10, completed, category, search, sort } = {}
) {
  const filter = { user: userId, archived: false };
  if (completed !== undefined) filter.completed = completed;
  if (category) filter.category = category;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    Todo.find(filter)
      .populate("category", "name")
      .sort(buildSort(sort))
      .skip(skip)
      .limit(limit),
    Todo.countDocuments(filter),
  ]);

  return { todos, total };
}

async function updateTodo(todoId, userId, updateData) {
  const todo = await Todo.findOne({ _id: todoId, user: userId, archived: false });
  if (!todo) {
    throw new AppError("Todo tidak ditemukan atau kamu tidak memiliki akses", 404);
  }

  const allowedFields = ["title", "description", "completed", "category"];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) todo[field] = updateData[field];
  });
  todo.updated_by = userId;

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