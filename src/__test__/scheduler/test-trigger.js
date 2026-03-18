/**
 * What it tests: This isn't actually an automated test! It's just a manual script you can run yourself by typing `npm run test-email`.
 * Use case: To actually send a real email to your real inbox just to prove to yourself that your passwords and APIs still work outside of the fake testing world.
 *
 * NOTE: Requires .env.dev with valid USERNAME, PASSWORD, SMTP, and API config.
 */
import { sendDailyReport } from "../../scheduler/jobs/dailyReport.job.js";
import * as logger from "../../scheduler/utils/logger.js";

logger.info("test", "Manually triggering the morning email report");

try {
  await sendDailyReport();
  logger.info("test", "Manual test completed successfully");
  process.exit(0);
} catch (error) {
  logger.error("test", "Manual test failed", { error: error.message });
  process.exit(1);
}
