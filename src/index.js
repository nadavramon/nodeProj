import { startScheduler } from "./scheduler/scheduler.js";
import { verifyConnection } from "./services/mailer-service.js";
import * as logger from "./utils/logger.js";
import { sendDailyReport } from "./scheduler/dailyReport/dailyReport-job.js";

let task;

function shutdown() {
    logger.info("system", "Shutting down gracefully");

    task?.stop();

    process.exit(0);
}

process.on("SIGINT", shutdown); // signal sent when you press Ctrl+C in your terminal.

async function start() {
    try {
        logger.info("system", "Starting application...");

        // 1. Verify critical connections
        await verifyConnection();

        // 2. Start the schedule
        task = startScheduler(sendDailyReport);
    } catch (error) {
        logger.error("system", "Failed to start application", { error: error.message });
        process.exit(1);
    }
}

start();
