import config from "../configs/app-config.js";
import { fetchWithRetry } from "../utils/api-client.js";

/**
 * Fetches current weather data.
 * Returns the current_weather object. Throws an error on failure.
 */
export async function fetchWeather() {
  try {
    const data = await fetchWithRetry(config.weatherApiUrl);
    if (!data?.current_weather) throw new Error("Unexpected weather response shape"); // API broke
    return data.current_weather;
  } catch (error) {
    throw new Error(`Fetch weather error: ${error.message}`);
  }
};
