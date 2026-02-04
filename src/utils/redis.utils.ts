// import redis from "../config/redis.js";

// export async function setToRedis(key: string, value: string) {
//   await redis.set(key, value);
//   // await redis.set(key, value, "EX", 60 * 60 * 24);
// }

// export async function getFromRedis(key: string) {
//   return await redis.get(key);
// }
import { getRedis } from "../config/redis.js";

export async function setToRedis(
  key: string,
  value: string,
  ttlSeconds = 60 * 60 * 24,
) {
  const redis = getRedis();
  await redis.set(key, value, "EX", ttlSeconds);
}

export async function getFromRedis(key: string) {
  const redis = getRedis();
  return redis.get(key);
}

export async function deleteFromRedis(key: string) {
  const redis = getRedis();
  await redis.del(key);
}
