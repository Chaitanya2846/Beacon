const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');
const User = require('../models/User');

router.post('/register-tenant', async (req, res) => {
  const { companyName, adminName, email, password } = req.body;
  
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email account identity already mapped.' });

    // Generate a URL-friendly slug from the company name
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // 1. Create the Organization first
    const organization = await Organization.create({ name: companyName, slug });

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create the Admin User linked to the new org
    const user = await User.create({
      organization_id: organization._id,
      name: adminName,
      email,
      password_hash: passwordHash,
      role: 'ADMIN'
    });

    // 4. Update the Organization to set the newly created user as the owner
    organization.owner_id = user._id;
    await organization.save();

    // 5. Return a simple success message (No token, enforcing the login flow)
    return res.status(201).json({
      message: 'Workspace deployed successfully. Please authenticate.'
    });

  } catch (error) {
    // Gracefully handle duplicate organization names (slug collision)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(400).json({ error: 'This Organization name is already registered. Please choose another.' });
    }
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

    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        organizationId: user.organization_id 
      } 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;