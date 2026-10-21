const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  judul: { 
    type: String, 
    required: true 
  },
  deskripsi: { 
    type: String 
  },
  is_completed: { 
    type: Boolean, 
    default: false 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },

  // Field Wajib 
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  archived: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Todo', todoSchema);