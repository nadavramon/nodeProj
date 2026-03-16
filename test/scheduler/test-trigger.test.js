/**
 * Manual integration trigger for the morning email.
 *
 * This is NOT part of the automated test suite — it is excluded from `npm test`.
 * Run it directly against real credentials and live APIs to verify end-to-end
 * behaviour (SMTP delivery, API responses, email formatting) before merging.
 *
 * Run with: npm run test-email
 * Requires: .env.dev with valid USERNAME, PASSWORD, SMTP, and API config.
 */
import { sendDailyReport } from '../../src/scheduler/index.js';
import * as logger from '../../src/scheduler/utils/logger.js';

logger.info('test', 'Manually triggering the morning email report');

try {
  await sendDailyReport();
  logger.info('test', 'Manual test completed successfully');
  process.exit(0);
} catch (error) {
  logger.error('test', 'Manual test failed', { error: error.message });
  process.exit(1);
}
