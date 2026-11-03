const express = require("express");
const controller = require("../controller/category.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createCategoryValidator, idValidator } = require("../validator/category.validator");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(controller.getCategories)
  .post(createCategoryValidator, validate, controller.createCategory);

router.route("/:id")
  .put(idValidator, validate, controller.updateCategory)
  .delete(idValidator, validate, controller.deleteCategory);

module.exports = router;