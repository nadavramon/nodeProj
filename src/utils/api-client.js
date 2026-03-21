import config from "../configs/app-config.js";
import * as logger from "./logger.js";

/**
 * Generic fetch helper with a simple retry mechanism.
 * url is the endpoint to hit and retries is the number of attempts to make.
 */
export async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      logger.warn("api", `Retry ${i + 1}/${retries} for ${url}`, { error: error.message });
      await new Promise((res) => setTimeout(res, config.retryDelay));
    }
  }
};
