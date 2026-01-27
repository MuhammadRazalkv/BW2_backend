import app from "./app.js";
import { startCleanupJob } from "./jobs/cleanup.jobs.js";

const PORT = process.env.PORT || 3000;

startCleanupJob();
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
