// Simple test server to verify database connection
require('dotenv').config();
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'xosmox',
  user: process.env.DB_USER || process.env.USER,
  password: process.env.DB_PASSWORD || '',
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current database time:', result.rows[0].current_time);
    
    client.release();
    
    console.log('🚀 Database setup complete! Ready to start the server.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running: brew services start postgresql@14');
    console.log('2. Check if database exists: psql -l | grep xosmox');
    console.log('3. Verify your .env file settings');
  } finally {
    await pool.end();
  }
}

testConnection();