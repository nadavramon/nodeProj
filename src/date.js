import {
  format,
  getDaysInMonth,
  add,
  isBefore,
  isEqual,
  isWeekend,
  getQuarter,
  getWeek,
  getDayOfYear,
  isValid,
  min,
  max,
} from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

// Predefined date structures for consistent string formats
export const DATE_FORMATS = {
  short: "dd/MM/yy",
  standard: "dd/MM/yyyy",
  long: "d MMMM, yyyy",
  iso: "yyyy-MM-dd",
};

export function formatDateRange(startDate, endDate, formatKeyOrString = "short") {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate inputs
  if (!isValid(start) || !isValid(end)) return "Invalid date range";

  // Sort dates chronologically (earliest to latest)
  const earliest = min([start, end]);
  const latest = max([start, end]);

  // Try matching a predefined format key, or fallback to custom string
  const dateFormat = DATE_FORMATS[formatKeyOrString] ?? formatKeyOrString;

  try {
    return `${format(earliest, dateFormat)} - ${format(latest, dateFormat)}`;
  } catch {
    // Return error if custom format string is invalid
    return "Invalid format string";
  }
}

export function getZonedDateInfo(dateInput, timeZone) {
  const date = new Date(dateInput);

  // Validate input date
  if (!isValid(date)) return null;

  try {
    // Convert date to the target timezone
    const zonedDate = toZonedTime(date, timeZone);
    const dayOfWeekStr = format(zonedDate, "EEEE");

    // Extract complete date details using native Date getters and date-fns

    return {
      year: zonedDate.getFullYear(),
      month: zonedDate.getMonth() + 1,
      monthInText: format(zonedDate, "MMMM"),
      day: zonedDate.getDate(),
      dayInAWeek: dayOfWeekStr,
      hour: zonedDate.getHours(),
      minute: zonedDate.getMinutes(),
      second: zonedDate.getSeconds(),
      millisecond: zonedDate.getMilliseconds(),
      isoFormat: formatInTimeZone(dateInput, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      weekInAYear: getWeek(zonedDate),
      dayInAYear: getDayOfYear(zonedDate),
      quarter: getQuarter(zonedDate),
      isWeekendCheck: isWeekend(zonedDate),
      daysInCurrentMonth: getDaysInMonth(zonedDate),
      timestamp: date.getTime(),
    };
  } catch {
    // Handle invalid timezone strings natively
    return null;
  }
}

// Maps string intervals to date-fns configuration objects
export const INTERVAL_MAP = {
  year: { years: 1 },
  month: { months: 1 },
  week: { weeks: 1 },
  day: { days: 1 },
  "half day": { hours: 12 },
  hour: { hours: 1 },
  minute: { minutes: 1 },
  second: { seconds: 1 },
};

export function getIntervalCheckpoints(startDate, endDate, interval = "day") {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate inputs
  if (!isValid(start) || !isValid(end)) return [];
  if (isBefore(end, start)) return []; // Stop if start is after end

  const checkpoints = [];

  // Fallback to 'day' if interval is invalid
  const addConfig = INTERVAL_MAP[interval] ?? INTERVAL_MAP.day;

  let current = start;
  let multiplier = 0; // Use a multiplier to prevent timezone/DST drifting

  while (isBefore(current, end)) {
    checkpoints.push(current);

    // Calculate the next date relative to the original start date
    multiplier++;
    const [unit, amount] = Object.entries(addConfig)[0];
    current = add(start, { [unit]: amount * multiplier });
  }

  // Ensure the exact end date is added at the end
  if (checkpoints.length === 0 || !isEqual(checkpoints[checkpoints.length - 1], end)) {
    checkpoints.push(end);
  }

  return checkpoints;
}
