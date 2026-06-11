const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  file_name: { type: String, required: true },
  cloudinary_url: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  error_log: { type: String },
  createdAt: { type: Date, default: Date.now }
});

DocumentSchema.index({ organization_id: 1 });

module.exports = mongoose.model('Document', DocumentSchema);