import nodemailer from "nodemailer";
import config from "../configs/app-config.js";
import * as logger from "./utils/logger.js";

// Module-level singleton transporter — created once and reused for every send.
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.username,
    pass: config.password,
  },
});

// Verify SMTP connectivity at startup so misconfigurations surface immediately.
transporter.verify().then(
  () => logger.info("email", "SMTP connection verified"),
  (error) =>
    logger.warn("email", "SMTP connection could not be verified", { error: error.message }),
);

// Sends an email with the given options and handles logging.
export const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("email", "Email sent successfully", { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error("email", "Failed to send email", { error: error.message });
    throw error;
  }
};
