import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the HTML template once when the module loads, so we don't hit the disk constantly
const rawHtmlTemplate = fs.readFileSync(
  path.join(__dirname, "templates", "daily-report.html"),
  "utf8",
);

// Generates both plain-text and HTML bodies for the morning email.
// Data is extracted first into a neutral structure, then rendered
// into each format independently so they can diverge as needed.
export const generateEmailTemplate = (dateInfo, weather, exchangeRate) => {
  // 1. Extract structured data
  const date = `${dateInfo.dayInAWeek}, ${dateInfo.monthInText} ${dateInfo.day}, ${dateInfo.year}`;
  const weatherData = weather
    ? { temperature: weather.temperature, windspeed: weather.windspeed }
    : null;
  const rateData = exchangeRate != null ? exchangeRate.toFixed(4) : null;

  // 2. Render plain text
  const weatherText = weatherData
    ? `Current Weather: ${weatherData.temperature}°C (Wind: ${weatherData.windspeed} km/h)`
    : "Current Weather: Unavailable right now.";
  const exchangeText = rateData
    ? `USD to ILS Exchange Rate: ${rateData} ₪`
    : "USD to ILS Exchange Rate: Unavailable right now.";

  const text = `
Good morning!

Today is ${date}.

Here is your daily update:

- ${weatherText}
- ${exchangeText}

Have a great day!
  `.trim();

  // 3. Render HTML (numbers highlighted for readability)
  const weatherHtml = weatherData
    ? `Current Weather: <strong>${weatherData.temperature}°C</strong> (Wind: ${weatherData.windspeed} km/h)`
    : "Current Weather: Unavailable right now.";
  const exchangeHtml = rateData
    ? `USD to ILS Exchange Rate: <strong>${rateData} ₪</strong>`
    : "USD to ILS Exchange Rate: Unavailable right now.";

  // Inject variables into the HTML string
  const html = rawHtmlTemplate
    .replace("{{date}}", date)
    .replace("{{weatherHtml}}", weatherHtml)
    .replace("{{exchangeHtml}}", exchangeHtml);

  return { text, html };
};
