const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },

  name: String,

  email: {
    type: String,
    unique: true
  },

  password_hash: String,

  role: {
    type: String,
    enum: ['ADMIN', 'AGENT'],
    default: 'ADMIN'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);