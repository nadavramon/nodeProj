const config = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  weatherApiUrl: process.env.WEATHER_API_URL,
  exchangeRateApiUrl: process.env.EXCHANGE_RATE_API_URL,
  timeZone: process.env.TIME_ZONE || 'UTC',
  logLevel: process.env.LOG_LEVEL || 'info',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  retryDelay: parseInt(process.env.RETRY_DELAY, 10) || 2000,
  cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *'
};

export default config;
