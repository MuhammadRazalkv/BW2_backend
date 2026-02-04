import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
  console.log("Redis connected");
});
redis.ping()
  .then(res => console.log("REDIS PING:", res))
  .catch(err => console.error("REDIS PING FAILED:", err));

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
