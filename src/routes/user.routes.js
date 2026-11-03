const express = require("express");
const { getUsers } = require("../controller/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

const router = express.Router();

router.use(protect);
router.get("/", restrictTo("admin"), getUsers);

module.exports = router;