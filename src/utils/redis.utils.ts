import redis from "../config/redis";

export async function setToRedis(key: string, value: string) {
  await redis.set(key, value, "EX", 60 * 60 * 24);
}

export async function getFromRedis(key: string) {
  return redis.get(key);
}
