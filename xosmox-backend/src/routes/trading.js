const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../../config/database');
const auth = require('../middleware/auth');
const TradingEngine = require('../services/trading-engine');
const router = express.Router();

const tradingEngine = new TradingEngine();

// Place order
router.post('/order', auth, [
  body('symbol').isString().isLength({ min: 3 }),
  body('side').isIn(['buy', 'sell']),
  body('type').isIn(['market', 'limit']),
  body('quantity').isFloat({ min: 0.00000001 }),
  body('price').optional().isFloat({ min: 0.00000001 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symbol, side, type, quantity, price } = req.body;

    // Validate symbol format (e.g., BTCUSDT)
    if (!isValidSymbol(symbol)) {
      return res.status(400).json({ error: 'Invalid trading symbol' });
    }

    // For limit orders, price is required
    if (type === 'limit' && !price) {
      return res.status(400).json({ error: 'Price is required for limit orders' });
    }

    // Check user balances
    const [baseCurrency, quoteCurrency] = parseSymbol(symbol);
    const requiredCurrency = side === 'buy' ? quoteCurrency : baseCurrency;
    const requiredAmount = side === 'buy' ? (price || 0) * quantity : quantity;

    const walletResult = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [req.userId, requiredCurrency]
    );

    if (walletResult.rows.length === 0 || walletResult.rows[0].balance < requiredAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Lock funds
      await pool.query(
        'UPDATE wallets SET balance = balance - $1, locked_balance = locked_balance + $1 WHERE user_id = $2 AND currency = $3',
        [requiredAmount, req.userId, requiredCurrency]
      );

      // Get trading pair ID
      const pairResult = await pool.query(
        'SELECT id FROM trading_pairs WHERE base_currency || quote_currency = $1',
        [symbol.toUpperCase()]
      );

      if (pairResult.rows.length === 0) {
        throw new Error('Trading pair not found');
      }

      const tradingPairId = pairResult.rows[0].id;

      // Create order
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, trading_pair_id, side, order_type, quantity, price, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [req.userId, tradingPairId, side, type, quantity, price, 'pending']
      );

      const order = orderResult.rows[0];

      // Process order through trading engine
      const executionResult = await tradingEngine.processOrder(order);

      await pool.query('COMMIT');

      res.status(201).json({
        message: 'Order placed successfully',
        order: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: order.quantity,
          price: order.price,
          status: order.status,
          createdAt: order.created_at
        },
        execution: executionResult
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user orders
router.get('/orders', auth, async (req, res) => {
  try {
    const { status, symbol, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE user_id = $1';
    const params = [req.userId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (symbol) {
      query += ` AND symbol = $${paramCount++}`;
      params.push(symbol.toUpperCase());
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ orders: result.rows });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Cancel order
router.delete('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'open' && order.status !== 'partial') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Calculate locked amount to release
      const [baseCurrency, quoteCurrency] = parseSymbol(order.symbol);
      const lockedCurrency = order.side === 'buy' ? quoteCurrency : baseCurrency;
      const remainingQuantity = order.quantity - order.filled_quantity;
      const lockedAmount = order.side === 'buy' ? 
        (order.price || 0) * remainingQuantity : 
        remainingQuantity;

      // Release locked funds
      await pool.query(
        'UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2 AND currency = $3',
        [lockedAmount, req.userId, lockedCurrency]
      );

      // Update order status
      await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', orderId]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get trade history
router.get('/trades', auth, async (req, res) => {
  try {
    const { symbol, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, o.symbol, o.side 
      FROM trades t 
      JOIN orders o ON (t.buy_order_id = o.id OR t.sell_order_id = o.id)
      WHERE (t.buyer_id = $1 OR t.seller_id = $1)
    `;
    const params = [req.userId];
    let paramCount = 2;

    if (symbol) {
      query += ` AND t.symbol = $${paramCount++}`;
      params.push(symbol.toUpperCase());
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ trades: result.rows });

  } catch (error) {
    console.error('Trades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get order book
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { depth = 20 } = req.query;

    if (!isValidSymbol(symbol)) {
      return res.status(400).json({ error: 'Invalid trading symbol' });
    }

    // Get buy orders (bids)
    const bidsResult = await pool.query(
      `SELECT price, SUM(quantity - filled_quantity) as quantity 
       FROM orders 
       WHERE symbol = $1 AND side = 'buy' AND status IN ('open', 'partial') 
       GROUP BY price 
       ORDER BY price DESC 
       LIMIT $2`,
      [symbol.toUpperCase(), depth]
    );

    // Get sell orders (asks)
    const asksResult = await pool.query(
      `SELECT price, SUM(quantity - filled_quantity) as quantity 
       FROM orders 
       WHERE symbol = $1 AND side = 'sell' AND status IN ('open', 'partial') 
       GROUP BY price 
       ORDER BY price ASC 
       LIMIT $2`,
      [symbol.toUpperCase(), depth]
    );

    res.json({
      symbol: symbol.toUpperCase(),
      bids: bidsResult.rows,
      asks: asksResult.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Order book fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// Helper functions
function isValidSymbol(symbol) {
  // Basic validation for trading pairs like BTCUSDT, ETHBTC, etc.
  return /^[A-Z]{3,10}[A-Z]{3,10}$/.test(symbol.toUpperCase());
}

function parseSymbol(symbol) {
  // Simple parsing - in production, you'd have a proper symbol registry
  const upperSymbol = symbol.toUpperCase();
  
  // Common quote currencies
  const quoteCurrencies = ['USDT', 'BTC', 'ETH', 'USD'];
  
  for (const quote of quoteCurrencies) {
    if (upperSymbol.endsWith(quote)) {
      const base = upperSymbol.slice(0, -quote.length);
      return [base, quote];
    }
  }
  
  // Default fallback
  const mid = Math.floor(upperSymbol.length / 2);
  return [upperSymbol.slice(0, mid), upperSymbol.slice(mid)];
}

module.exports = router;