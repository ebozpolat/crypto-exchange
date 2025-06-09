-- Xosmox Crypto Exchange Database Setup
-- Run this script to create the initial database structure

-- Create database tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.00000000,
    locked_balance DECIMAL(20, 8) DEFAULT 0.00000000,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, currency)
);

CREATE TABLE IF NOT EXISTS trading_pairs (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    min_order_size DECIMAL(20, 8) DEFAULT 0.00000001,
    max_order_size DECIMAL(20, 8) DEFAULT 1000000.00000000,
    price_precision INTEGER DEFAULT 8,
    quantity_precision INTEGER DEFAULT 8,
    trading_fee DECIMAL(5, 4) DEFAULT 0.0010,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, quote_currency)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trading_pair_id INTEGER REFERENCES trading_pairs(id),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop_loss', 'take_profit')),
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8),
    filled_quantity DECIMAL(20, 8) DEFAULT 0.00000000,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'filled', 'cancelled', 'expired')),
    time_in_force VARCHAR(10) DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK')),
    stop_price DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    buyer_order_id INTEGER REFERENCES orders(id),
    seller_order_id INTEGER REFERENCES orders(id),
    trading_pair_id INTEGER REFERENCES trading_pairs(id),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    buyer_fee DECIMAL(20, 8) DEFAULT 0.00000000,
    seller_fee DECIMAL(20, 8) DEFAULT 0.00000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'fee')),
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) DEFAULT 0.00000000,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
    tx_hash VARCHAR(255),
    address VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions TEXT[], -- Array of permission strings
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    trading_pair_id INTEGER REFERENCES trading_pairs(id),
    price DECIMAL(20, 8) NOT NULL,
    volume_24h DECIMAL(20, 8) DEFAULT 0.00000000,
    change_24h DECIMAL(10, 4) DEFAULT 0.0000,
    high_24h DECIMAL(20, 8),
    low_24h DECIMAL(20, 8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES admin_users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_trading_pair ON trades(trading_pair_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Insert default trading pairs
INSERT INTO trading_pairs (base_currency, quote_currency, trading_fee) VALUES
('BTC', 'USDT', 0.0010),
('ETH', 'USDT', 0.0010),
('BTC', 'ETH', 0.0010),
('LTC', 'USDT', 0.0015),
('ADA', 'USDT', 0.0015),
('DOT', 'USDT', 0.0015)
ON CONFLICT (base_currency, quote_currency) DO NOTHING;

-- Create default admin user (password: admin123)
-- Note: In production, change this password immediately!
INSERT INTO admin_users (username, password_hash, role, permissions) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'super_admin', 
 ARRAY['user_management', 'trading_management', 'financial_management', 'system_settings'])
ON CONFLICT (username) DO NOTHING;

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Display success message
SELECT 'Database setup completed successfully!' as message;