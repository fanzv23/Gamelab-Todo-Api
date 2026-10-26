const express = require("express");
const todoController = require("../controller/todo.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Semua route di bawah ini diproteksi, wajib login
router.use(protect);

router.route("/").get(todoController.getTodos).post(todoController.createTodo);

router.route("/:id").patch(todoController.updateTodo).delete(todoController.deleteTodo);

module.exports = router;