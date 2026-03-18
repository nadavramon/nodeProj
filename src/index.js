import { startMorningScheduler } from "./scheduler/scheduler.js";
import * as logger from "./scheduler/utils/logger.js";

const shutdown = () => {
  logger.info("system", "Shutting down gracefully");
  process.exit(0);
};

process.on("SIGINT", shutdown); // signal sent when you press Ctrl+C in your terminal.

// Initialize the scheduled actions.
// Success is logged inside startMorningScheduler once the schedule is confirmed.
startMorningScheduler();
