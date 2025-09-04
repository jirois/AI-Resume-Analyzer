import redis from "redis";
import logger from "../utils/logger.js";

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      retry_strategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    redisClient.on("error", (err) => {
      logger.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
    });
    await redisClient.connect();
  } catch (error) {
    logger.error("Redis connection failed:", error.message);
  }
};

const getRedisClient = () => redisClient;

export { connectRedis, getRedisClient };
