const express = require('express');
const { pool } = require('../../config/database');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = express.Router();

// Get platform statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const userStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
        COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) as verified_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
      FROM users
    `);

    // Get trading statistics
    const tradingStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as trades_24h,
        SUM(quantity * price) as total_volume,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN quantity * price ELSE 0 END) as volume_24h
      FROM trades
    `);

    // Get order statistics
    const orderStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_24h,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_orders,
        COUNT(CASE WHEN status = 'filled' THEN 1 END) as filled_orders
      FROM orders
    `);

    // Get wallet statistics
    const walletStatsResult = await pool.query(`
      SELECT 
        currency,
        SUM(balance) as total_balance,
        SUM(locked_balance) as total_locked,
        COUNT(DISTINCT user_id) as holders
      FROM wallets 
      GROUP BY currency
    `);

    res.json({
      users: userStatsResult.rows[0],
      trading: tradingStatsResult.rows[0],
      orders: orderStatsResult.rows[0],
      wallets: walletStatsResult.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users with pagination
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, first_name, last_name, phone, kyc_status, 
             two_fa_enabled, is_active, created_at, updated_at
      FROM users
    `;
    const params = [];
    const conditions = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      conditions.push(`kyc_status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status
router.put('/users/:userId/status', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { kycStatus, isActive } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (kycStatus !== undefined) {
      updates.push(`kyc_status = $${paramCount++}`);
      values.push(kycStatus);
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, kyc_status, is_active`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get pending transactions
router.get('/transactions/pending', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.email, u.first_name, u.last_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND t.type = $${paramCount++}`;
      params.push(type);
    }

    query += ` ORDER BY t.created_at ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ transactions: result.rows });

  } catch (error) {
    console.error('Pending transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pending transactions' });
  }
});

// Approve/reject transaction
router.put('/transactions/:transactionId/status', auth, adminAuth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, reason } = req.body;

    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get transaction details
    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not pending' });
    }

    // Start database transaction
    await pool.query('BEGIN');

    try {
      // Update transaction status
      await pool.query(
        'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, transactionId]
      );

      // If rejecting a withdrawal, return funds to user
      if (status === 'failed' && transaction.type === 'withdrawal') {
        await pool.query(
          'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
          [transaction.amount + transaction.fee, transaction.user_id, transaction.currency]
        );
      }

      await pool.query('COMMIT');

      res.json({
        message: `Transaction ${status} successfully`,
        transactionId,
        status
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Transaction status update error:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Get system health
router.get('/health', auth, adminAuth, async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await pool.query('SELECT NOW()');
    const dbStatus = dbCheck.rows.length > 0 ? 'healthy' : 'unhealthy';

    // Check Redis connection (if available)
    let redisStatus = 'unknown';
    try {
      const redis = require('../../config/redis').getRedisClient();
      await redis.ping();
      redisStatus = 'healthy';
    } catch (error) {
      redisStatus = 'unhealthy';
    }

    // Get system metrics
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'operational',
      services: {
        database: dbStatus,
        redis: redisStatus,
        api: 'healthy'
      },
      metrics
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'degraded',
      error: 'Health check failed'
    });
  }
});

// Get audit logs
router.get('/audit', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const offset = (page - 1) * limit;

    // This would typically come from a dedicated audit log table
    // For now, we'll return recent significant activities
    let query = `
      SELECT 
        'order' as action,
        user_id,
        symbol as details,
        created_at,
        'Order placed' as description
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;

    if (userId) {
      query += ` AND user_id = ${parseInt(userId)}`;
    }

    query += `
      UNION ALL
      SELECT 
        'transaction' as action,
        user_id,
        type || ' ' || currency || ' ' || amount as details,
        created_at,
        'Transaction processed' as description
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `;

    if (userId) {
      query += ` AND user_id = ${parseInt(userId)}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

    const result = await pool.query(query, [limit, offset]);

    res.json({ auditLogs: result.rows });

  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;