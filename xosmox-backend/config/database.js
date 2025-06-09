const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'xosmox',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Database schema initialization
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        kyc_status VARCHAR(20) DEFAULT 'pending',
        two_fa_enabled BOOLEAN DEFAULT false,
        two_fa_secret VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        currency VARCHAR(10) NOT NULL,
        balance DECIMAL(20, 8) DEFAULT 0,
        locked_balance DECIMAL(20, 8) DEFAULT 0,
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, currency)
      )
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        symbol VARCHAR(20) NOT NULL,
        side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
        type VARCHAR(10) NOT NULL CHECK (type IN ('market', 'limit')),
        quantity DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8),
        filled_quantity DECIMAL(20, 8) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'partial')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id),
        seller_id INTEGER REFERENCES users(id),
        buy_order_id INTEGER REFERENCES orders(id),
        sell_order_id INTEGER REFERENCES orders(id),
        symbol VARCHAR(20) NOT NULL,
        quantity DECIMAL(20, 8) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade')),
        currency VARCHAR(10) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        tx_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { pool, initializeDatabase };