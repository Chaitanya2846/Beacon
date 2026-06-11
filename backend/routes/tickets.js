const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth');

// Fetch all tickets matching the authenticated tenant context
router.get('/', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ organization_id: req.user.organizationId }).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update ticket state within a specific workspace boundary
router.patch('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organizationId },
      { $set: { status: req.body.status } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Target ticket entity not found within your workspace.' });
    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;