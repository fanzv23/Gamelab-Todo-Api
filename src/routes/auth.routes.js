const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  res.json({ message: "Endpoint login aktif" });
});

module.exports = router;