const { pool } = require('../../config/database');

const adminAuth = async (req, res, next) => {
  try {
    // Check if user has admin privileges
    // In a real application, you'd have a roles/permissions system
    const adminEmails = [
      'admin@xosmox.com',
      'support@xosmox.com'
    ];

    if (!adminEmails.includes(req.userEmail)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Additional admin verification could be added here
    // For example, checking a roles table or admin flags

    next();

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Admin authentication failed.' });
  }
};

module.exports = adminAuth;