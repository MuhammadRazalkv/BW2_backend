import cleanUpService from "../services/cleanup.service.js";
import cron from "node-cron";

export function startCleanupJob() {
  cleanUpService();
  cron.schedule(`0 * * * *`, () => {
    cleanUpService();
  });
}
