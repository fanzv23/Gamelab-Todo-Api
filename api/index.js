require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../src/app");

let connecting;

function connect() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      connecting = null;
      throw err;
    });
  }
  return connecting;
}

module.exports = async (req, res) => {
  try {
    await connect();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Database tidak dapat dihubungi" });
  }
  return app(req, res);
};