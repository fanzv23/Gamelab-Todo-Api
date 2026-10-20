const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nama_kategori: { 
    type: String, 
    required: true 
  },
  deskripsi_kategori: { 
    type: String 
  },

  // --- 5 Field Wajib dari Aturan Gamelab ---
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  archived: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Category', categorySchema);