import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient = null;

export const createRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl,
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('Redis server refused the connection');
        return new Error('Redis server refused the connection');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        logger.error('Redis retry time exhausted');
        return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
        logger.error('Redis connection attempts exhausted');
        return undefined;
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis Client Ready');
  });

  redisClient.on('end', () => {
    logger.info('Redis Client Disconnected');
  });

  // Connect to Redis
  redisClient.connect().catch((err) => {
    logger.error('Failed to connect to Redis:', err);
  });

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

// Cache utilities
export const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }
};

export default redisClient;