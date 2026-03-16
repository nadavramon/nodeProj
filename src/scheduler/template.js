/**
 * Generates both plain-text and HTML bodies for the morning email.
 * Data is extracted first into a neutral structure, then rendered
 * into each format independently so they can diverge as needed.
 * @param {object} dateInfo - Information from getZonedDateInfo.
 * @param {object|null} weather - Current weather data.
 * @param {number|null} exchangeRate - Current ILS rate.
 * @returns {{ text: string, html: string }} The formatted email bodies.
 */
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

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #e8a020;">&#9728;&#65039; Good morning!</h2>
    <p>Today is <strong>${date}</strong>.</p>
    <h3>Your daily update:</h3>
    <ul>
      <li>${weatherHtml}</li>
      <li>${exchangeHtml}</li>
    </ul>
    <p>Have a great day!</p>
  </body>
</html>
  `.trim();

  return { text, html };
};
