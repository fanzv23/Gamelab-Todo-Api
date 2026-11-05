const { body, param, query } = require("express-validator");

const ALLOWED_SORT_FIELDS = ["created_at", "updated_at", "title", "completed"];

exports.createTodoValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul todo wajib diisi")
    .isLength({ max: 100 }).withMessage("Judul maksimal 100 karakter"),
  body("description").optional().isString().withMessage("Deskripsi harus berupa teks"),
  body("category")
    .notEmpty().withMessage("Kategori wajib diisi")
    .isMongoId().withMessage("ID kategori tidak valid"),
];

exports.updateTodoValidator = [
  param("id").isMongoId().withMessage("ID todo tidak valid"),
  body("title").optional().trim().notEmpty().withMessage("Judul tidak boleh kosong"),
  body("description").optional().isString().withMessage("Deskripsi harus berupa teks"),
  body("completed").optional().isBoolean().withMessage("completed harus true atau false"),
  body("category").optional().isMongoId().withMessage("ID kategori tidak valid"),
];

exports.idValidator = [
  param("id").isMongoId().withMessage("ID todo tidak valid"),
];

exports.listTodoValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page harus berupa angka bulat minimal 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("limit harus berupa angka antara 1 dan 50"),
  query("completed")
    .optional()
    .isIn(["true", "false"]).withMessage("completed harus true atau false"),
  query("category")
    .optional()
    .isMongoId().withMessage("ID kategori tidak valid"),
  query("sort")
    .optional()
    .custom((value) => {
      if (typeof value !== "string") return false;
      return value
        .split(",")
        .every((item) => ALLOWED_SORT_FIELDS.includes(item.replace(/^-/, "")));
    })
    .withMessage("sort hanya boleh berisi: created_at, updated_at, title, completed (awali dengan - untuk urutan terbalik)"),
  query("search")
    .optional()
    .isString().withMessage("search harus berupa teks")
    .trim()
    .isLength({ max: 100 }).withMessage("search maksimal 100 karakter"),
];