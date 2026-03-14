import { format, isValid, getDaysInMonth, getQuarter, getWeek, getDayOfYear, isWeekend } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { DATE_FORMATS } from "./formatDateRange.js";

export function getZonedDateInfo(dateInput, timeZone = "UTC") {
  const date = new Date(dateInput);

  // Validate input date
  if (!isValid(date)) throw new Error(`Invalid date: "${dateInput}"`);

  // Convert date to the target timezone — throws if timeZone is invalid
  const zonedDate = toZonedTime(date, timeZone);
  const dayOfWeekStr = format(zonedDate, DATE_FORMATS.dayOfWeek);

  // Extract complete date details using native Date getters and date-fns
  return {
    year: zonedDate.getFullYear(),
    month: zonedDate.getMonth() + 1,
    monthInText: format(zonedDate, DATE_FORMATS.monthName),
    day: zonedDate.getDate(),
    dayInAWeek: dayOfWeekStr,
    hour: zonedDate.getHours(),
    minute: zonedDate.getMinutes(),
    second: zonedDate.getSeconds(),
    millisecond: zonedDate.getMilliseconds(),
    isoFormat: formatInTimeZone(dateInput, timeZone, DATE_FORMATS.isoWithTz),
    weekInAYear: getWeek(zonedDate),
    dayInAYear: getDayOfYear(zonedDate),
    quarter: getQuarter(zonedDate),
    isWeekend: isWeekend(zonedDate),
    daysInCurrentMonth: getDaysInMonth(zonedDate),
    timestamp: date.getTime(),
  };
}
