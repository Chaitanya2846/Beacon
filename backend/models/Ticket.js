const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  session_id: { type: String, required: true },
  status: { type: String, enum: ['UNASSIGNED', 'OPEN', 'RESOLVED'], default: 'UNASSIGNED' },
  initial_customer_query: { type: String, required: true },
  assigned_agent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});

TicketSchema.index({ organization_id: 1, status: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);