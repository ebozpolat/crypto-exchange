const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../config/database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Get all wallets for user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT currency, balance, locked_balance, address FROM wallets WHERE user_id = $1',
      [req.userId]
    );

    res.json({ wallets: result.rows });
  } catch (error) {
    console.error('Wallets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Get wallet balances (alias for compatibility)
router.get('/balances', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT currency, balance, locked_balance FROM wallets WHERE user_id = $1',
      [req.userId]
    );

    res.json({ balances: result.rows });
  } catch (error) {
    console.error('Balances fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

// Get specific wallet
router.get('/:currency', auth, async (req, res) => {
  try {
    const { currency } = req.params;
    
    const result = await pool.query(
      'SELECT currency, balance, locked_balance, address FROM wallets WHERE user_id = $1 AND currency = $2',
      [req.userId, currency.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ wallet: result.rows[0] });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Generate deposit address
router.post('/:currency/address', auth, async (req, res) => {
  try {
    const { currency } = req.params;
    
    // Generate a mock address (in production, this would integrate with blockchain)
    const address = generateMockAddress(currency.toUpperCase());
    
    await pool.query(
      'UPDATE wallets SET address = $1 WHERE user_id = $2 AND currency = $3',
      [address, req.userId, currency.toUpperCase()]
    );

    res.json({ 
      message: 'Deposit address generated',
      address,
      currency: currency.toUpperCase()
    });

  } catch (error) {
    console.error('Address generation error:', error);
    res.status(500).json({ error: 'Failed to generate address' });
  }
});

// Deposit (simulate)
router.post('/:currency/deposit', auth, [
  body('amount').isFloat({ min: 0.00000001 }),
  body('txHash').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currency } = req.params;
    const { amount, txHash } = req.body;

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Update wallet balance
      await pool.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
        [amount, req.userId, currency.toUpperCase()]
      );

      // Record transaction
      await pool.query(
        'INSERT INTO transactions (user_id, type, currency, amount, status, tx_hash) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.userId, 'deposit', currency.toUpperCase(), amount, 'completed', txHash || generateMockTxHash()]
      );

      await pool.query('COMMIT');

      res.json({ 
        message: 'Deposit processed successfully',
        amount,
        currency: currency.toUpperCase()
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Withdraw
router.post('/:currency/withdraw', auth, [
  body('amount').isFloat({ min: 0.00000001 }),
  body('address').isString().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currency } = req.params;
    const { amount, address } = req.body;

    // Check wallet balance
    const walletResult = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [req.userId, currency.toUpperCase()]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];
    const fee = calculateWithdrawalFee(currency.toUpperCase(), amount);
    const totalAmount = parseFloat(amount) + fee;

    if (wallet.balance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Update wallet balance
      await pool.query(
        'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3',
        [totalAmount, req.userId, currency.toUpperCase()]
      );

      // Record transaction
      await pool.query(
        'INSERT INTO transactions (user_id, type, currency, amount, fee, status, tx_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [req.userId, 'withdrawal', currency.toUpperCase(), amount, fee, 'pending', generateMockTxHash()]
      );

      await pool.query('COMMIT');

      res.json({ 
        message: 'Withdrawal request submitted',
        amount,
        fee,
        currency: currency.toUpperCase(),
        address
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get transaction history
router.get('/:currency/transactions', auth, async (req, res) => {
  try {
    const { currency } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT type, amount, fee, status, tx_hash, created_at 
       FROM transactions 
       WHERE user_id = $1 AND currency = $2 
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`,
      [req.userId, currency.toUpperCase(), limit, offset]
    );

    res.json({ transactions: result.rows });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Helper functions
function generateMockAddress(currency) {
  const prefixes = {
    'BTC': '1',
    'ETH': '0x',
    'USDT': '0x',
    'USD': 'USD'
  };
  
  const prefix = prefixes[currency] || '0x';
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return prefix + randomPart;
}

function generateMockTxHash() {
  return '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function calculateWithdrawalFee(currency, amount) {
  const fees = {
    'BTC': 0.0005,
    'ETH': 0.005,
    'USDT': 1.0,
    'USD': 5.0
  };
  
  return fees[currency] || 0.001;
}

module.exports = router;