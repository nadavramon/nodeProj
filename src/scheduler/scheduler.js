import cron from "node-cron";
import config from "../configs/app-config.js";
import * as logger from "../utils/logger.js";

/**
 * Initializes and starts the background scheduler for a given job.
 */
export const startScheduler = (jobFn, options = {}) => {
  const schedule = options.schedule || config.cronSchedule;
  const timezone = options.timezone || config.timeZone;

  logger.info("scheduler", "Initializing scheduler", {
    schedule,
    timezone,
  });

  // Schedule task at the configured time & timezone
  const task = cron.schedule(
    schedule,
    async () => {
      logger.info("scheduler", "Running scheduled task");
      try {
        await jobFn(); // Execute the generic job passed as an argument
      } catch (error) {
        logger.error("scheduler", "Unhandled error in scheduled task", { error: error.message });
      }
    },
    {
      timezone,
    },
  );

  logger.info("system", "Application started successfully");
  return task;
};
