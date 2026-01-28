import cleanUpService from "../services/cleanup.service.js";

const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

export function startCleanupJob() {
  cleanUpService();

  setInterval(() => {
    cleanUpService();
  }, CLEANUP_INTERVAL);
}
