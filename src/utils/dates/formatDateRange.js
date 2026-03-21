import { format, isValid, isBefore } from "date-fns";

// Predefined date structures for consistent string formats
export const DATE_FORMATS = {
  short: "dd/MM/yy",
  standard: "dd/MM/yyyy",
  long: "d MMMM, yyyy",
  iso: "yyyy-MM-dd",
  isoWithTz: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  dayOfWeek: "EEEE",
  monthName: "MMMM",
};

export function formatDateRange(startDate, endDate, formatKeyOrString = DATE_FORMATS.short) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate inputs
  if (!isValid(start) || !isValid(end))
    throw new Error("Invalid date range: one or both dates are invalid");

  // Sort dates chronologically (earliest to latest)
  const [earliest, latest] = !isBefore(start, end) ? [end, start] : [start, end];

  // Try matching a predefined format key, or fallback to custom string
  const dateFormat = DATE_FORMATS[formatKeyOrString] ?? formatKeyOrString;

  // Throw early if the resolved format is not a non-empty string
  if (typeof dateFormat !== "string" || dateFormat.trim() === "") {
    throw new Error(`Invalid format key or string: "${formatKeyOrString}"`);
  }

  return `${format(earliest, dateFormat)} - ${format(latest, dateFormat)}`;
}
