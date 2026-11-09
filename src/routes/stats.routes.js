const express = require("express");
const { getStats } = require("../controller/stats.controller");
const apiKey = require("../middlewares/apiKey.middleware");

const router = express.Router();

router.get("/", apiKey, getStats);

module.exports = router;