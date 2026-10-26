const express = require("express");
const router = express.Router();

// Contoh endpoint login sementara untuk tes
router.post("/login", (req, res) => {
  res.json({
    success: true,
    message: "Endpoint login berhasil diakses",
    data: {
      token: "dummy-jwt-token-sementara"
    }
  });
});

module.exports = router;