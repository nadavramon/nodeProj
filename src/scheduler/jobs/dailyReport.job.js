import config from "../../configs/app-config.js";
import { getZonedDateInfo } from "../../dates/getZonedDateInfo.js";
import * as logger from "../utils/logger.js";
import { fetchWeather } from "../../services/weather.service.js";
import { fetchExchangeRate } from "../../services/exchange.service.js";
import { generateEmailTemplate } from "../template.js";
import { sendEmail } from "../mailer.js";

// The core logic for gathering data, formatting the message, and sending the email.
// Wait until both the Weather API and the Exchange Rate API reply back to me.
export const sendDailyReport = async () => {
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
