import { describe, it, expect } from "vitest";
import { getIntervalCheckpoints } from "../src/dates/index.js";

/**
 * Tests for the getIntervalCheckpoints utility.
 * Note: Uses .concurrent for parallel execution.
 */
describe.concurrent("getIntervalCheckpoints", () => {
  /**
   * Tests the default daily interval alignment.
   * Use Case: Generating daily buckets for analytical charts or report grouping.
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
   * Tests various interval types (month, half-day, hour).
   * Use Case: Setting up periodic background tasks or polling intervals (e.g., every 12 hours).
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
   * Tests fallback behavior for unrecognized interval strings.
   * Use Case: Ensuring the system remains functional even with invalid configuration inputs.
   */
  it('falls back to "day" if an invalid interval is passed', () => {
    const start = new Date("2023-01-01T00:00:00Z");
    const end = new Date("2023-01-03T00:00:00Z");
    const result = getIntervalCheckpoints(start, end, "invalid-interval");
    expect(result).toHaveLength(3);
    expect(result[1].toISOString()).toBe(new Date("2023-01-02T00:00:00Z").toISOString());
  });

  /**
   * Tests addition logic during Daylight Saving Time (DST) changes.
   * Use Case: Ensuring schedulers do not drift when the local wall-clock time shifts (e.g., tasks still run at the same relative time).
   */
  it("handles DST transitions without drifting (Europe/London Oct 2024)", () => {
    // BST ends on Oct 27, 2024. 01:00 BST -> 01:00 GMT (clocks go back)
    const start = new Date("2024-10-26T00:00:00Z");
    const end = new Date("2024-10-28T00:00:00Z");
    const result = getIntervalCheckpoints(start, end, "day");
    expect(result).toHaveLength(3);
    expect(result[0].toISOString()).toBe(start.toISOString());
    expect(result[1].toISOString()).toBe(new Date("2024-10-27T01:00:00Z").toISOString());
    expect(result[2].toISOString()).toBe(end.toISOString());
  });

  /**
   * Tests empty output when the range is zero or negative.
   * Use Case: Preventing infinite loops or illogical data generation in search filters.
   */
  it("returns an empty array if start is after end", () => {
    const start = new Date("2023-01-10T00:00:00Z");
    const end = new Date("2023-01-01T00:00:00Z");
    const result = getIntervalCheckpoints(start, end);
    expect(result).toEqual([]);
  });

  /**
   * Tests error throwing for invalid date formats.
   * Use Case: Ensuring the function provides clear feedback when passed garbage data.
   */
  it.each([
    ["start", "invalid-start", "2023-01-01T00:00:00Z", "Invalid start date"],
    ["end", "2023-01-01T00:00:00Z", "invalid-end", "Invalid end date"],
  ])("throws if %s date is invalid", (_, s, e, msg) => {
    expect(() => getIntervalCheckpoints(s, e)).toThrow(msg);
  });

  /**
   * Tests behavior when start and end dates are identical.
   * Use Case: Handling a point-in-time range where the only checkpoint should be the date itself.
   */
  it("returns exactly one checkpoint if start equals end", () => {
    const date = new Date("2023-01-01T12:00:00Z");
    const result = getIntervalCheckpoints(date, date);
    expect(result).toHaveLength(1);
    expect(result[0].toISOString()).toBe(date.toISOString());
  });

  /**
   * Tests behavior when the interval is larger than the total date range.
   * Use Case: Ensuring the function still returns [start, end] even if the step exceeds the range (e.g., report for 1 day with monthly grouping).
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
   * Tests high-volume generation over a long duration.
   * Use Case: Stress-testing the multiplier logic to ensure accuracy over hundreds of iterations (e.g., 2 years of daily data).
   */
  it("handles high-volume multipliers correctly (2 years of days)", () => {
    const start = new Date("2023-01-01T00:00:00Z");
    const end = new Date("2025-01-01T00:00:00Z");
    const result = getIntervalCheckpoints(start, end, "day");
    expect(result.length).toBeGreaterThan(730);
    expect(result[result.length - 1].toISOString()).toBe(end.toISOString());
  });

  /**
   * Tests that milliseconds are preserved across checkpoints.
   * Use Case: Ensuring high-precision timestamps (e.g., from logs or sensors) don't lose accuracy during rounding or addition.
   */
  it("preserves millisecond accuracy across checkpoints", () => {
    const start = new Date("2023-01-01T00:00:00.123Z");
    const end = new Date("2023-01-01T05:00:00.123Z");
    const result = getIntervalCheckpoints(start, end, "hour");
    expect(result[0].getMilliseconds()).toBe(123);
    expect(result[1].getMilliseconds()).toBe(123);
    expect(result[result.length - 1].getMilliseconds()).toBe(123);
  });
});
