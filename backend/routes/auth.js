const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');
const User = require('../models/User');

router.post('/register-tenant', async (req, res) => {
  const { companyName, adminName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email account identity already mapped.' });

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const organization = await Organization.create({ name: companyName, slug });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      organization_id: organization._id,
      name: adminName,
      email,
      password_hash: passwordHash,
      role: 'ADMIN'
    });

    const token = jwt.sign(
      { id: user._id, organizationId: organization._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
      organization: { id: organization._id, name: organization.name }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid identification credentials.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid identification credentials.' });

    const token = jwt.sign(
      { id: user._id, organizationId: user.organization_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;