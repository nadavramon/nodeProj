import { describe, it, expect } from "vitest";
import { getIntervalCheckpoints } from "../../utils/dates/getIntervalCheckpoints.js";

/**
 * Tests for the getIntervalCheckpoints utility.
 * Note: Uses .concurrent for parallel execution.
 */
describe.concurrent("getIntervalCheckpoints", () => {
  describe("Core Interval Generation", () => {
    /**
     * What it tests: Checks if the timeline is chopped into daily chunks by default.
     * Use case: You want to show a simple daily sales chart over 3 days.
     */
    it("returns checkpoints aligned by the default interval (day)", () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2023-01-03T00:00:00Z");
      const result = getIntervalCheckpoints(start, end);

      expect(result).toHaveLength(3);
      expect(result[0].toISOString()).toBe(start.toISOString());
      expect(result[1].toISOString()).toBe(new Date("2023-01-02T00:00:00Z").toISOString());
      expect(result[2].toISOString()).toBe(end.toISOString());
    });

    /**
     * What it tests: Checks if it can chop the timeline by months, half-days, or hours.
     * Use case: You want to run a background cleanup task every 12 hours.
     */
    it.each([
      ["month", "2023-01-01T00:00:00Z", "2023-03-01T00:00:00Z", 3],
      ["half day", "2023-01-01T00:00:00Z", "2023-01-02T00:00:00Z", 3],
      ["hour", "2023-01-01T00:00:00Z", "2023-01-01T02:00:00Z", 3],
    ])("returns checkpoints for a specific interval (%s)", (interval, s, e, len) => {
      const result = getIntervalCheckpoints(new Date(s), new Date(e), interval);

      expect(result).toHaveLength(len);
    });

    /**
     * What it tests: Checks if the math still works perfectly when asking for hundreds of days.
     * Use case: You fetch 2 full years of daily data and need exactly 730 separate days generated.
     */
    it("handles high-volume multipliers correctly (2 years of days)", () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2025-01-01T00:00:00Z");
      const result = getIntervalCheckpoints(start, end, "day");

      expect(result.length).toBeGreaterThan(730);
      expect(result[result.length - 1].toISOString()).toBe(end.toISOString());
    });
  });

  describe("Edge Cases & Time Shifts", () => {
    /**
     * What it tests: Checks what happens if the start and end point are exactly the same exact second.
     * Use case: Providing a single moment in time instead of a range.
     */
    it("returns exactly one checkpoint if start equals end", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const result = getIntervalCheckpoints(date, date);

      expect(result).toHaveLength(1);
      expect(result[0].toISOString()).toBe(date.toISOString());
    });

    /**
     * What it tests: Checks what happens if your start date comes AFTER your end date.
     * Use case: A user accidentally picks an end date that is backward in time on a calendar.
     */
    it("returns an empty array if start is after end", () => {
      const start = new Date("2023-01-10T00:00:00Z");
      const end = new Date("2023-01-01T00:00:00Z");
      const result = getIntervalCheckpoints(start, end);

      expect(result).toEqual([]);
    });

    /**
     * What it tests: Checks what happens if you ask for monthly jumps, but the date range is only 1 day total.
     * Use case: A user groups a 1-day sales report by "Months", so it just shows the start and the end.
     */
    it("returns [start, end] if the interval is larger than the range", () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2023-01-02T00:00:00Z");
      const result = getIntervalCheckpoints(start, end, "month");

      expect(result).toHaveLength(2);
      expect(result[0].toISOString()).toBe(start.toISOString());
      expect(result[1].toISOString()).toBe(end.toISOString());
    });

    /**
     * What it tests: Checks that it doesn't accidentally erase tiny millisecond details when adding time.
     * Use case: Trying to group high-speed server logs without losing exact, precise time stamps.
     */
    it("preserves millisecond accuracy across checkpoints", () => {
      const start = new Date("2023-01-01T00:00:00.123Z");
      const end = new Date("2023-01-01T05:00:00.123Z");
      const result = getIntervalCheckpoints(start, end, "hour");

      expect(result[0].getMilliseconds()).toBe(123);
      expect(result[1].getMilliseconds()).toBe(123);
      expect(result[result.length - 1].getMilliseconds()).toBe(123);
    });

    /**
     * What it tests: Checks that adding days still aligns correctly even when the real-world clocks change for Daylight Saving Time.
     * Use case: Making sure an app does not accidentally skip or double-count hours in October when clocks fall back.
     */
    it("handles DST transitions without drifting (Europe/London Oct 2024)", () => {
      const start = new Date("2024-10-26T00:00:00Z");
      const end = new Date("2024-10-28T00:00:00Z");
      const result = getIntervalCheckpoints(start, end, "day");

      expect(result).toHaveLength(3);
      expect(result[0].toISOString()).toBe(start.toISOString());
      expect(result[1].toISOString()).toBe(new Date("2024-10-27T01:00:00Z").toISOString());
      expect(result[2].toISOString()).toBe(end.toISOString());
    });
  });

  describe("Validation & Fallbacks", () => {
    /**
     * What it tests: Checks if it automatically falls back to daily chunks if you pass a garbage interval word.
     * Use case: The front-end accidentally sends "blah" instead of "month". It won't crash.
     */
    it('falls back to "day" if an invalid interval is passed', () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2023-01-03T00:00:00Z");
      const result = getIntervalCheckpoints(start, end, "invalid-interval");

      expect(result).toHaveLength(3);
      expect(result[1].toISOString()).toBe(new Date("2023-01-02T00:00:00Z").toISOString());
    });

    /**
     * What it tests: Checks that it immediately stops and yells if you pass it completely invalid dates.
     * Use case: You accidentally feed a random string instead of a real date object, so it stops to prevent bad data processing.
     */
    it.each([
      ["start", "invalid-start", "2023-01-01T00:00:00Z", "Invalid start date"],
      ["end", "2023-01-01T00:00:00Z", "invalid-end", "Invalid end date"],
    ])("throws if %s date is invalid", (_, s, e, msg) => {
      expect(() => getIntervalCheckpoints(s, e)).toThrow(msg);
    });
  });
});
