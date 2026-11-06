const { query } = require("express-validator");

exports.listLogValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page harus berupa angka bulat minimal 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("limit harus berupa angka antara 1 dan 50"),
  query("action")
    .optional()
    .isIn(["create", "update", "delete"]).withMessage("action harus create, update, atau delete"),
];