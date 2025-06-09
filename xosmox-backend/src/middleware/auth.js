const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xosmox-secret');
    
    // Verify user still exists
    const userResult = await pool.query(
      'SELECT id, email, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    const user = userResult.rows[0];
    
    // Note: We'll allow unverified users for now
    // if (!user.is_verified) {
    //   return res.status(401).json({ error: 'Please verify your email first.' });
    // }

    req.userId = user.id;
    req.userEmail = user.email;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

module.exports = auth;