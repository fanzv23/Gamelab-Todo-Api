const express = require("express");
const todoController = require("../controller/todo.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createTodoValidator,
  updateTodoValidator,
  idValidator,
  listTodoValidator,
} = require("../validator/todo.validator");

const router = express.Router();

// Semua route di bawah ini diproteksi, wajib login
router.use(protect);

router
  .route("/")
  .get(listTodoValidator, validate, todoController.getTodos)
  .post(createTodoValidator, validate, todoController.createTodo);

router
  .route("/:id")
  .patch(updateTodoValidator, validate, todoController.updateTodo)
  .delete(idValidator, validate, todoController.deleteTodo);

module.exports = router;