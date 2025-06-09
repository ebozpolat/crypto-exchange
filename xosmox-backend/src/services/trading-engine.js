const { pool } = require('../../config/database');

class TradingEngine {
  constructor() {
    this.orderBooks = new Map(); // symbol -> { bids: [], asks: [] }
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async processOrder(order) {
    try {
      // Add order to processing queue
      this.processingQueue.push(order);
      
      if (!this.isProcessing) {
        await this.processQueue();
      }

      return {
        orderId: order.id,
        status: 'accepted',
        message: 'Order added to processing queue'
      };

    } catch (error) {
      console.error('Order processing error:', error);
      throw error;
    }
  }

  async processQueue() {
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const order = this.processingQueue.shift();
      await this.executeOrder(order);
    }

    this.isProcessing = false;
  }

  async executeOrder(order) {
    try {
      if (order.type === 'market') {
        await this.executeMarketOrder(order);
      } else if (order.type === 'limit') {
        await this.executeLimitOrder(order);
      }
    } catch (error) {
      console.error('Order execution error:', error);
      
      // Mark order as failed and release locked funds
      await this.handleOrderFailure(order, error.message);
    }
  }

  async executeMarketOrder(order) {
    // Get opposite side orders from database
    const oppositeSide = order.side === 'buy' ? 'sell' : 'buy';
    const priceOrder = order.side === 'buy' ? 'ASC' : 'DESC';

    const matchingOrdersResult = await pool.query(
      `SELECT * FROM orders 
       WHERE symbol = $1 AND side = $2 AND status IN ('open', 'partial') 
       ORDER BY price ${priceOrder}, created_at ASC`,
      [order.symbol, oppositeSide]
    );

    const matchingOrders = matchingOrdersResult.rows;
    let remainingQuantity = order.quantity;
    const trades = [];

    await pool.query('BEGIN');

    try {
      for (const matchingOrder of matchingOrders) {
        if (remainingQuantity <= 0) break;

        const availableQuantity = matchingOrder.quantity - matchingOrder.filled_quantity;
        const tradeQuantity = Math.min(remainingQuantity, availableQuantity);
        const tradePrice = matchingOrder.price;

        // Create trade record
        const tradeResult = await pool.query(
          `INSERT INTO trades (buyer_id, seller_id, buy_order_id, sell_order_id, symbol, quantity, price, fee) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            order.side === 'buy' ? order.user_id : matchingOrder.user_id,
            order.side === 'sell' ? order.user_id : matchingOrder.user_id,
            order.side === 'buy' ? order.id : matchingOrder.id,
            order.side === 'sell' ? order.id : matchingOrder.id,
            order.symbol,
            tradeQuantity,
            tradePrice,
            this.calculateTradingFee(tradeQuantity, tradePrice)
          ]
        );

        const trade = tradeResult.rows[0];
        trades.push(trade);

        // Update order filled quantities
        await pool.query(
          'UPDATE orders SET filled_quantity = filled_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [tradeQuantity, order.id]
        );

        await pool.query(
          'UPDATE orders SET filled_quantity = filled_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [tradeQuantity, matchingOrder.id]
        );

        // Update order statuses
        const newOrderStatus = (order.filled_quantity + tradeQuantity) >= order.quantity ? 'filled' : 'partial';
        const newMatchingOrderStatus = (matchingOrder.filled_quantity + tradeQuantity) >= matchingOrder.quantity ? 'filled' : 'partial';

        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          [newOrderStatus, order.id]
        );

        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          [newMatchingOrderStatus, matchingOrder.id]
        );

        // Update user balances
        await this.updateBalancesAfterTrade(trade, order, matchingOrder);

        remainingQuantity -= tradeQuantity;
      }

      // If market order couldn't be fully filled, mark remaining as cancelled
      if (remainingQuantity > 0) {
        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          [order.filled_quantity > 0 ? 'partial' : 'cancelled', order.id]
        );

        // Release remaining locked funds
        await this.releaseLockFunds(order, remainingQuantity);
      }

      await pool.query('COMMIT');

      // Notify users via WebSocket (if WebSocket service is available)
      this.notifyTradeExecution(trades);

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async executeLimitOrder(order) {
    // For limit orders, try to match immediately, then add to order book if not fully filled
    const oppositeSide = order.side === 'buy' ? 'sell' : 'buy';
    const priceCondition = order.side === 'buy' ? 'price <= $3' : 'price >= $3';

    const matchingOrdersResult = await pool.query(
      `SELECT * FROM orders 
       WHERE symbol = $1 AND side = $2 AND ${priceCondition} AND status IN ('open', 'partial') 
       ORDER BY price ${order.side === 'buy' ? 'ASC' : 'DESC'}, created_at ASC`,
      [order.symbol, oppositeSide, order.price]
    );

    const matchingOrders = matchingOrdersResult.rows;
    let remainingQuantity = order.quantity;
    const trades = [];

    await pool.query('BEGIN');

    try {
      // Try to match with existing orders
      for (const matchingOrder of matchingOrders) {
        if (remainingQuantity <= 0) break;

        const availableQuantity = matchingOrder.quantity - matchingOrder.filled_quantity;
        const tradeQuantity = Math.min(remainingQuantity, availableQuantity);
        const tradePrice = matchingOrder.price; // Price improvement for the taker

        // Create trade record
        const tradeResult = await pool.query(
          `INSERT INTO trades (buyer_id, seller_id, buy_order_id, sell_order_id, symbol, quantity, price, fee) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            order.side === 'buy' ? order.user_id : matchingOrder.user_id,
            order.side === 'sell' ? order.user_id : matchingOrder.user_id,
            order.side === 'buy' ? order.id : matchingOrder.id,
            order.side === 'sell' ? order.id : matchingOrder.id,
            order.symbol,
            tradeQuantity,
            tradePrice,
            this.calculateTradingFee(tradeQuantity, tradePrice)
          ]
        );

        const trade = tradeResult.rows[0];
        trades.push(trade);

        // Update filled quantities and statuses
        await this.updateOrderAfterTrade(order.id, tradeQuantity);
        await this.updateOrderAfterTrade(matchingOrder.id, tradeQuantity);

        // Update balances
        await this.updateBalancesAfterTrade(trade, order, matchingOrder);

        remainingQuantity -= tradeQuantity;
      }

      // Update final order status
      if (remainingQuantity <= 0) {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['filled', order.id]);
      } else if (trades.length > 0) {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['partial', order.id]);
      }
      // If no trades, order remains 'open' and stays in order book

      await pool.query('COMMIT');

      // Notify users
      this.notifyTradeExecution(trades);

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  async updateOrderAfterTrade(orderId, tradeQuantity) {
    const result = await pool.query(
      'UPDATE orders SET filled_quantity = filled_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [tradeQuantity, orderId]
    );

    const order = result.rows[0];
    const newStatus = order.filled_quantity >= order.quantity ? 'filled' : 'partial';

    await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [newStatus, orderId]
    );
  }

  async updateBalancesAfterTrade(trade, buyOrder, sellOrder) {
    const [baseCurrency, quoteCurrency] = this.parseSymbol(trade.symbol);
    const tradeValue = trade.quantity * trade.price;

    // Update buyer balances
    await pool.query(
      'UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $2 WHERE user_id = $3 AND currency = $4',
      [trade.quantity, tradeValue, trade.buyer_id, baseCurrency]
    );

    await pool.query(
      'UPDATE wallets SET locked_balance = locked_balance - $1 WHERE user_id = $2 AND currency = $3',
      [tradeValue, trade.buyer_id, quoteCurrency]
    );

    // Update seller balances
    await pool.query(
      'UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $2 WHERE user_id = $3 AND currency = $4',
      [tradeValue - trade.fee, trade.quantity, trade.seller_id, quoteCurrency]
    );

    await pool.query(
      'UPDATE wallets SET locked_balance = locked_balance - $1 WHERE user_id = $2 AND currency = $3',
      [trade.quantity, trade.seller_id, baseCurrency]
    );
  }

  async releaseLockFunds(order, quantity) {
    const [baseCurrency, quoteCurrency] = this.parseSymbol(order.symbol);
    const currency = order.side === 'buy' ? quoteCurrency : baseCurrency;
    const amount = order.side === 'buy' ? quantity * order.price : quantity;

    await pool.query(
      'UPDATE wallets SET balance = balance + $1, locked_balance = locked_balance - $1 WHERE user_id = $2 AND currency = $3',
      [amount, order.user_id, currency]
    );
  }

  async handleOrderFailure(order, errorMessage) {
    try {
      await pool.query('BEGIN');

      // Mark order as failed
      await pool.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', order.id]
      );

      // Release locked funds
      await this.releaseLockFunds(order, order.quantity - order.filled_quantity);

      await pool.query('COMMIT');

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error handling order failure:', error);
    }
  }

  calculateTradingFee(quantity, price) {
    // 0.1% trading fee
    return quantity * price * 0.001;
  }

  parseSymbol(symbol) {
    // Simple symbol parsing - in production, use a symbol registry
    const quoteCurrencies = ['USDT', 'BTC', 'ETH', 'USD'];
    
    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        return [base, quote];
      }
    }
    
    // Fallback
    const mid = Math.floor(symbol.length / 2);
    return [symbol.slice(0, mid), symbol.slice(mid)];
  }

  notifyTradeExecution(trades) {
    // This would integrate with WebSocket service to notify users
    console.log('Trades executed:', trades.length);
    
    // In a real implementation, you'd notify users via WebSocket
    // Example: this.webSocketService.notifyTradeExecution(userId, trade);
  }
}

module.exports = TradingEngine;