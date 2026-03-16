import config from "../../config.js";
import * as logger from "./utils/logger.js";

/**
 * Generic fetch helper with a simple retry mechanism.
 * url is the endpoint to hit and retries is the number of attempts to make.
 */
const fetchWithRetry = async (url, retries = 3) => {
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

/**
 * Calls fetchWithRetry then applies an extract function to the response.
 * Network/retry failures and response shape failures are caught and logged separately.
 * Returns null on either failure so the caller can degrade gracefully.
 */
const fetchData = async (url, extract) => {
  let data;
  try {
    data = await fetchWithRetry(url);
  } catch (error) {
    logger.error("api", `Failed to fetch ${url} after retries`, { error: error.message });
    return null;
  }
  try {
    return extract(data);
  } catch (error) {
    logger.error("api", `Unexpected response shape from ${url}`, { error: error.message });
    return null;
  }
};

/**
 * Fetches current weather data.
 * Returns the current_weather object or null on failure.
 */
export const fetchWeather = () =>
  fetchData(config.weatherApiUrl, (data) => {
    if (!data?.current_weather) throw new Error("Unexpected weather response shape");
    return data.current_weather;
  });

/**
 * Fetches the current USD → ILS exchange rate.
 * Returns the ILS rate or null on failure.
 */
export const fetchExchangeRate = () =>
  fetchData(config.exchangeRateApiUrl, (data) => {
    if (!data?.rates?.ILS) throw new Error("Unexpected exchange rate response shape");
    return data.rates.ILS;
  });
