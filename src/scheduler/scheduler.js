import cron from "node-cron";
import config from "../configs/app-config.js";
import * as logger from "./utils/logger.js";
import { sendDailyReport } from "./jobs/dailyReport.job.js";

/**
 * Initializes and starts the background daily scheduler.
 */
export const startMorningScheduler = () => {
  logger.info("scheduler", "Initializing morning scheduler", {
    env: config.env,
    schedule: config.cronSchedule,
    timezone: config.timeZone,
  });

  // Schedule task at the configured time daily in the configured timezone
  cron.schedule(
    config.cronSchedule,
    async () => {
      logger.info("scheduler", "Running scheduled morning task");
      try {
        await sendDailyReport();
      } catch (error) {
        logger.error("scheduler", "Unhandled error in scheduled task", { error: error.message });
      }
    },
    {
      timezone: config.timeZone,
    },
  );

  logger.info("system", "Application started successfully");
};
