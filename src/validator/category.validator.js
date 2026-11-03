const { body, param } = require("express-validator");

exports.createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Nama kategori wajib diisi"),
];

exports.idValidator = [
  param("id").isMongoId().withMessage("ID tidak valid"),
];