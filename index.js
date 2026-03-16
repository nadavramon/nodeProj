import { startMorningScheduler } from './src/scheduler/index.js';
import * as logger from './src/scheduler/utils/logger.js';

const shutdown = () => {
  logger.info('system', 'Shutting down gracefully');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize the scheduled actions.
// Success is logged inside startMorningScheduler once the schedule is confirmed.
startMorningScheduler();
