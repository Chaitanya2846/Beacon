const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  
  // Ownership
  owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  // Widget Customization
  settings: {
    primary_color: { type: String, default: '#1a1a1a' },
    widget_greeting: { type: String, default: 'Hello! How can I help you today?' },
    company_logo_url: { type: String, default: null }
  },

  // System Flags
  is_active: { 
    type: Boolean, 
    default: true 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Organization', OrganizationSchema);