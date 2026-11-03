const express = require("express");
const { register, login } = require("../controller/auth.controller");
const { registerValidator, loginValidator } = require("../validator/auth.validator");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

module.exports = router;