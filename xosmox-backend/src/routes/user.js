const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, is_verified, two_factor_enabled, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, phone`;
    
    const result = await pool.query(query, values);
    
    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user activity
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get recent transactions
    const transactionsResult = await pool.query(
      `SELECT type, currency, amount, status, created_at 
       FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    // Get recent orders
    const ordersResult = await pool.query(
      `SELECT symbol, side, type, quantity, price, status, created_at 
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    res.json({
      transactions: transactionsResult.rows,
      orders: ordersResult.rows
    });

  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Enable/disable 2FA
router.post('/2fa/toggle', auth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    await pool.query(
      'UPDATE users SET two_fa_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [enabled, req.userId]
    );

    res.json({ 
      message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`,
      twoFaEnabled: enabled
    });

  } catch (error) {
    console.error('2FA toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle 2FA' });
  }
});

module.exports = router;