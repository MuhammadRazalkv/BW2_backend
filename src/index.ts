import app from "./app";
import { getRedis } from "./config/redis";
// import { startCleanupJob } from "./jobs/cleanup.jobs";

const PORT = process.env.PORT || 3000;

// // startCleanupJob();
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const redis = getRedis();

async function start() {
  await new Promise<void>((resolve, reject) => {
    if (redis.status === "ready") return resolve();
    redis.once("ready", resolve);
    redis.once("error", reject);
  });

  app.listen(PORT, () => {
    console.log("🚀 Server running on port 3000");
  });
}

start();