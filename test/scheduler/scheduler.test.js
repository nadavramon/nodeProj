/**
 * Unit tests for the morning scheduler (src/scheduler/index.js).
 *
 * Strategy: all external dependencies (cron, nodemailer, fetch, config) are mocked
 * so tests run fast and offline. The cron callback is captured manually so
 * sendDailyReport() can be triggered synchronously inside each test.
 *
 * Run with: npm test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startMorningScheduler } from '../../src/scheduler/index.js';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

// Mock logger
vi.mock('../../src/scheduler/utils/logger.js', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  },
}));

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
      verify: vi.fn().mockResolvedValue(true),
    }),
  },
}));

// Mock config
vi.mock('../../config.js', () => ({
  default: {
    weatherApiUrl: 'https://api.test/weather',
    exchangeRateApiUrl: 'https://api.test/exchange',
    username: 'test@example.com',
    password: 'password',
    timeZone: 'Asia/Jerusalem',
    logLevel: 'info',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    retryDelay: 100, // Short delay for tests
    cronSchedule: '0 9 * * *',
  },
}));

describe('Morning Scheduler', () => {
  let cronCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    global.fetch = vi.fn();

    // Capture the cron callback when startMorningScheduler is called
    cron.schedule.mockImplementation((pattern, callback) => {
      cronCallback = callback;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Verifies that node-cron is initialised with the correct schedule expression
  // and timezone from config, so the email fires at the right local time.
  it('should schedule a job for 9:00 AM', () => {
    startMorningScheduler();
    expect(cron.schedule).toHaveBeenCalledWith('0 9 * * *', expect.any(Function), expect.objectContaining({
      timezone: 'Asia/Jerusalem',
    }));
  });

  // Happy path: both APIs respond correctly.
  // Asserts that sendMail is called with the right recipient, a recognisable
  // subject, and that both the plain-text and HTML bodies contain live data.
  it('should send a successful email with weather and exchange rate', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('weather')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ current_weather: { temperature: 25, windspeed: 10 } }),
        });
      }
      if (url.includes('exchange')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ rates: { ILS: 3.5 } }),
        });
      }
    });

    startMorningScheduler();
    await cronCallback();

    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: expect.stringContaining('Your Daily Morning Update'),
      text: expect.stringContaining('25°C'),
      html: expect.stringContaining('25°C'),
    }));
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('3.5000 ₪'),
      html: expect.stringContaining('3.5000 ₪'),
    }));
  });

  // Resilience: both APIs return HTTP 500 on every attempt.
  // The email should still be sent — with "Unavailable right now" placeholders —
  // rather than crashing or skipping the send entirely.
  it('should handle API failures gracefully', async () => {
    global.fetch.mockReturnValue(Promise.resolve({ ok: false, status: 500 }));

    startMorningScheduler();
    const cronPromise = cronCallback();

    // Fast-forward through all potential retries for both APIs
    await vi.advanceTimersByTimeAsync(10000);

    await cronPromise;

    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('Unavailable right now'),
      html: expect.stringContaining('Unavailable right now'),
    }));
  });

  // Retry path: the first fetch rejects with a network error; the second succeeds.
  // Confirms that fetchWithRetry fires more than once and that the recovered
  // data (20°C) actually makes it into the sent email.
  it('should retry API calls on failure and deliver correct data', async () => {
    let callCount = 0;
    global.fetch.mockImplementation(() => {
      callCount++;
      if (callCount < 2) return Promise.reject(new Error('Network Error'));
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ current_weather: { temperature: 20, windspeed: 5 }, rates: { ILS: 3.6 } }),
      });
    });

    startMorningScheduler();
    const cronPromise = cronCallback();

    // Flat retry delay = retryDelay (100ms) — advance enough to cover all retries
    await vi.advanceTimersByTimeAsync(2000);

    await cronPromise;

    expect(callCount).toBeGreaterThan(1);
    const transporter = nodemailer.createTransport();
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      text: expect.stringContaining('20°C'),
      html: expect.stringContaining('20°C'),
    }));
  });
});
