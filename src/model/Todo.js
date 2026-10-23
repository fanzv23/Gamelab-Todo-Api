const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    archived: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Todo", todoSchema);