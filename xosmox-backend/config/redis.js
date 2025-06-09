const redis = require('redis');

let client;

const initializeRedis = async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized');
  }
  return client;
};

module.exports = { initializeRedis, getRedisClient };