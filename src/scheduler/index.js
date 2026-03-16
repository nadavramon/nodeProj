import cron from "node-cron";
import config from "../../config.js";
import { getZonedDateInfo } from "../dates/index.js";
import * as logger from "./utils/logger.js";
import { fetchWeather, fetchExchangeRate } from "./api.js";
import { generateEmailTemplate } from "./template.js";
import { sendEmail } from "./mailer.js";

/**
 * Validates that all required configuration variables are present.
 * @throws {Error} if critical config is missing.
 */
const validateConfig = () => {
  const required = [
    "username",
    "password",
    "weatherApiUrl",
    "exchangeRateApiUrl",
    "smtpHost",
    "smtpPort",
  ];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }
};

/**
 * The core logic for gathering data, formatting the message, and sending the email.
 * This can be called by the scheduler or manually for testing.
 */
export const sendDailyReport = async () => {
  // 0. Validate config — guards both the scheduled path and direct calls (e.g. test-trigger)
  validateConfig();

  // 1. Get regional date information for the greeting
  const dateInfo = getZonedDateInfo(new Date(), config.timeZone);
  logger.info("scheduler", `Generating daily report for ${dateInfo.isoFormat}`);

  // 2. Fetch external data in parallel for better performance
  const [weather, exchangeRate] = await Promise.all([fetchWeather(), fetchExchangeRate()]);

  // 3. Build the email body (plain text + HTML)
  const { text, html } = generateEmailTemplate(dateInfo, weather, exchangeRate);

  // 4. Configure the envelope (sender, receiver, subject)
  const mailOptions = {
    from: `"Daily App Scheduler" <${config.username}>`,
    to: config.username,
    subject: `Your Daily Morning Update ☀️ - ${dateInfo.monthInText} ${dateInfo.day}`,
    text,
    html,
  };

  // 5. Dispatch the email
  return sendEmail(mailOptions);
};

/**
 * Initializes and starts the background daily scheduler.
 */
export const startMorningScheduler = () => {
  try {
    validateConfig();
  } catch (error) {
    logger.error("system", "Scheduler failed to start due to invalid configuration", {
      error: error.message,
    });
    process.exit(1);
  }

  logger.info("scheduler", "Initializing morning scheduler", {
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
