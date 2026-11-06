const ActivityLog = require("../model/ActivityLog");

async function logActivity({ userId, action, entityId, description }) {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity: "todo",
      entity_id: entityId,
      description,
      created_by: userId,
    });
  } catch (err) {
    // Kegagalan mencatat log tidak boleh menggagalkan request utama
    console.error("Gagal mencatat activity log:", err.message);
  }
}

module.exports = { logActivity };