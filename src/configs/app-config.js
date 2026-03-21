/**
 * Centralized application configuration object.
 * Static defaults are defined here, while sensitive credentials
 * are pulled from environment variables.
 */

const DEFAULT_CONFIG = {
  weatherApiUrl: "https://api.open-meteo.com/v1/forecast?latitude=32.0809&longitude=34.7806&current_weather=true",
  exchangeRateApiUrl: "https://api.exchangerate-api.com/v4/latest/USD",
  timeZone: "Asia/Jerusalem",
  logLevel: "info",
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  retryDelay: 2000,
  cronSchedule: "0 9 * * *",
};

const config = {
  // Authentication & Email credentials (must be provided via environment)
  username: process.env.USERNAME,
  password: process.env.PASSWORD,

  // Apply all standard defaults
  ...DEFAULT_CONFIG,
};

/**
 * Validates that all critical configuration keys are present.
 * Since most fields have hardcoded defaults, we only need to verify
 * that the required environment variables (secrets) were provided.
 * 
 * @param {Object} c - The configuration object to validate.
 * @returns {Object} The validated configuration object.
 */
const validateConfig = (c) => {
  const requiredKeys = ["username", "password"];
  
  const missingKeys = requiredKeys.filter((key) => !c[key]);

  if (missingKeys.length > 0) {
    throw new Error(`[Config Error] Missing required environment variables: ${missingKeys.join(", ")}`);
  }
  
  return c;
};

// Validate the config before exporting to ensure the app fails fast on misconfiguration.
export default validateConfig(config);
