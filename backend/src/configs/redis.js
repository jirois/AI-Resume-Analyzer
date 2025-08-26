import redis from "redis";
import Logger from "../utils/logger";

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
      Logger.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      Logger.info("Redis connected successfully");
    });
    await redisClient.connect();
  } catch (error) {
    Logger.error("Redis connection failed:", error.message);
  }
};

const getRedisClient = () => redisClient;

export { connectRedis, getRedisClient };
