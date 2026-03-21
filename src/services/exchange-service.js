import config from "../configs/app-config.js";
import { fetchWithRetry } from "../utils/api-client.js";

/**
 * Fetches the current USD → ILS exchange rate.
 * Returns the ILS rate. Throws an error on failure.
 */
export async function fetchExchangeRate() {
  try {
    const data = await fetchWithRetry(config.exchangeRateApiUrl);
    if (!data?.rates?.ILS) throw new Error("Unexpected exchange rate response shape"); // API broke
    return data.rates.ILS;
  } catch (error) {
    throw new Error(`Fetch exchange rate error: ${error.message}`);
  }
};
