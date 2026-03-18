import config from "../configs/app-config.js";
import { fetchData } from "./api-client.js";

/**
 * Fetches the current USD → ILS exchange rate.
 * Returns the ILS rate or null on failure.
 */
export const fetchExchangeRate = () =>
  fetchData(config.exchangeRateApiUrl, (data) => {
    if (!data?.rates?.ILS) throw new Error("Unexpected exchange rate response shape");
    return data.rates.ILS;
  });
