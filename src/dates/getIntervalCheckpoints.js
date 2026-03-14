import { add, isBefore, isEqual, isValid } from "date-fns";

// Defines all valid interval key strings
export const INTERVALS = {
  YEAR:     "year",
  MONTH:    "month",
  WEEK:     "week",
  DAY:      "day",
  HALF_DAY: "half day",
  HOUR:     "hour",
  MINUTE:   "minute",
  SECOND:   "second",
};

// Defines the date-fns unit strings used in add() configurations
export const DATE_UNITS = {
  YEARS:   "years",
  MONTHS:  "months",
  WEEKS:   "weeks",
  DAYS:    "days",
  HOURS:   "hours",
  MINUTES: "minutes",
  SECONDS: "seconds",
};

// Maps each INTERVALS value to its date-fns add() configuration
export const INTERVAL_MAP = {
  [INTERVALS.YEAR]:     { [DATE_UNITS.YEARS]:   1 },
  [INTERVALS.MONTH]:    { [DATE_UNITS.MONTHS]:  1 },
  [INTERVALS.WEEK]:     { [DATE_UNITS.WEEKS]:   1 },
  [INTERVALS.DAY]:      { [DATE_UNITS.DAYS]:    1 },
  [INTERVALS.HALF_DAY]: { [DATE_UNITS.HOURS]:  12 },
  [INTERVALS.HOUR]:     { [DATE_UNITS.HOURS]:   1 },
  [INTERVALS.MINUTE]:   { [DATE_UNITS.MINUTES]: 1 },
  [INTERVALS.SECOND]:   { [DATE_UNITS.SECONDS]: 1 },
};

export function getIntervalCheckpoints(startDate, endDate, interval = INTERVALS.DAY) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate inputs
  if (!isValid(start)) throw new Error(`Invalid start date: "${startDate}"`);
  if (!isValid(end)) throw new Error(`Invalid end date: "${endDate}"`);

  // If start is strictly after end, return nothing. 
  // If start === end, we still proceed to return a single checkpoint.
  if (start > end) return []; 

  const checkpoints = [];

  // Fallback to DAY if interval is not a recognised INTERVALS value
  const addConfig = INTERVAL_MAP[interval] ?? INTERVAL_MAP[INTERVALS.DAY];

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
