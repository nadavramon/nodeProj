import config from "../../configs/app-config.js";
import * as logger from "../../utils/logger.js";
import { getZonedDateInfo } from "../../utils/dates/getZonedDateInfo.js";
import { fetchWeather } from "../../services/weather-service.js";
import { fetchExchangeRate } from "../../services/exchange-service.js";
import { generateEmailTemplate } from "./template.js";
import { sendEmail } from "../../services/mailer-service.js";

// The core logic for gathering data, formatting the message, and sending the email.
// Wait until both the Weather API and the Exchange Rate API reply back to me.
export async function sendDailyReport() {
  // Get regional date information for the greeting
  const dateInfo = getZonedDateInfo(new Date(), config.timeZone);
  logger.info("scheduler", `Generating daily report for ${dateInfo.isoFormat}`);

  // Fetch external data in parallel for better performance
  const results = await Promise.allSettled([fetchWeather(), fetchExchangeRate()]); // get partial info even if one of the APIs fails.

  const weather = results[0].status === "fulfilled" ? results[0].value : null;
  const exchangeRate = results[1].status === "fulfilled" ? results[1].value : null;

  if (results[0].status === "rejected") {
    logger.error("job", "Weather fetch failed", { error: results[0].reason });
  }
  if (results[1].status === "rejected") {
    logger.error("job", "Exchange rate fetch failed", { error: results[1].reason });
  }

  // Build the email body (plain text + HTML)
  const { text, html } = generateEmailTemplate(dateInfo, weather, exchangeRate);

  // Configure the envelope (sender, receiver, subject)
  const mailOptions = {
    from: `"Daily App Scheduler" <${config.username}>`,
    to: config.username,
    subject: `Your Daily Morning Update ☀️ - ${dateInfo.monthInText} ${dateInfo.day}`,
    text,
    html,
  };
  return sendEmail(mailOptions); // Dispatch the email
};
