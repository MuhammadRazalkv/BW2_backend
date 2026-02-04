import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      enableReadyCheck: true,
      maxRetriesPerRequest: null,
    });

    redis.on("ready", () => console.log("🟢 Redis ready"));
    redis.on("error", (err) => console.error("🔴 Redis error", err));
  }

  return redis;
}
