import config from "../configs/app-config.js";
import { fetchData } from "./api-client.js";

/**
 * Fetches current weather data.
 * Returns the current_weather object or null on failure.
 */
export const fetchWeather = () =>
  fetchData(config.weatherApiUrl, (data) => {
    if (!data?.current_weather) throw new Error("Unexpected weather response shape");
    return data.current_weather;
  });
