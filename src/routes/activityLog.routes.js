const express = require("express");
const { getLogs } = require("../controller/activityLog.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { listLogValidator } = require("../validator/activityLog.validator");

const router = express.Router();

router.use(protect);
router.get("/", listLogValidator, validate, getLogs);

module.exports = router;