import { describe, it, expect, vi, beforeEach } from "vitest";
import { getZonedDateInfo } from "../../src/dates/index.js";

/**
 * Tests for the getZonedDateInfo utility.
 * Note: Uses .concurrent for parallel execution.
 */
describe.concurrent("getZonedDateInfo", () => {
  /**
   * Tests the extraction of comprehensive date components for a standard timezone (EST).
   * Use Case: Building complex date-dependent UIs like calendars or schedulers in a specific region.
   */
  it("returns correctly parsed date info for a valid date and timezone", () => {
    const result = getZonedDateInfo("2023-01-15T12:00:00Z", "America/New_York");

    // Explicit type checks (standard Vitest assertions)
    expect(result.year).toBeTypeOf("number");
    expect(result.month).toBeTypeOf("number");
    expect(result.monthInText).toBeTypeOf("string");
    expect(result.day).toBeTypeOf("number");
    expect(result.dayInAWeek).toBeTypeOf("string");
    expect(result.hour).toBeTypeOf("number");
    expect(result.minute).toBeTypeOf("number");
    expect(result.second).toBeTypeOf("number");
    expect(result.millisecond).toBeTypeOf("number");
    expect(result.isoFormat).toBeTypeOf("string");
    expect(result.weekInAYear).toBeTypeOf("number");
    expect(result.dayInAYear).toBeTypeOf("number");
    expect(result.quarter).toBeTypeOf("number");
    expect(result.isWeekend).toBeTypeOf("boolean");
    expect(result.daysInCurrentMonth).toBeTypeOf("number");
    expect(result.timestamp).toBeTypeOf("number");

    // Focused value assertions
    expect(result).toEqual(
      expect.objectContaining({
        year: 2023,
        month: 1,
        monthInText: "January",
        day: 15,
        dayInAWeek: "Sunday",
        hour: 7,
        minute: 0,
      }),
    );
  });

  /**
   * Tests handling of non-integral timezone offsets (e.g., +12:45).
   * Use Case: Supporting global users in regions with unconventional timezone offsets.
   */
  it("handles complex timezone offsets (45-min offset)", () => {
    // Pacific/Chatham is UTC+12:45 (or +13:45 in DST)
    const result = getZonedDateInfo("2023-01-15T12:00:00Z", "Pacific/Chatham");
    expect(result.isoFormat).toContain("+13:45"); // Jan is DST in Chatham
    expect(result.hour).toBe(1); // 12:00 UTC + 13:45 = 01:45 next day
    expect(result.minute).toBe(45);
  });

  /**
   * Tests error throwing for malformed date inputs.
   * Use Case: Protecting data integrity when fetching stored dates from external sources.
   */
  it("throws for an invalid date", () => {
    expect(() => getZonedDateInfo("invalid-date", "America/New_York")).toThrow(
      'Invalid date: "invalid-date"',
    );
  });

  /**
   * Tests validation of timezone strings.
   * Use Case: Catching typos or unsupported timezone names provided by users or configurations.
   */
  it("throws for an invalid timezone string", () => {
    expect(() => getZonedDateInfo("2023-01-15T12:00:00Z", "Invalid/Timezone")).toThrow();
  });

  /**
   * Tests Leap Day specific data (Feb 29, 2024).
   * Use Case: Ensuring the system correctly identifies Leap Day and its properties (weekend status, month length).
   */
  it("handles Leap Day (Feb 29, 2024) correctly", () => {
    const result = getZonedDateInfo("2024-02-29T12:00:00Z", "UTC");
    expect(result.day).toBe(29);
    expect(result.daysInCurrentMonth).toBe(29);
    expect(result.isWeekend).toBe(false); // Feb 29, 2024 was a Thursday
  });

  /**
   * Tests year boundary transition (Dec 31 to Jan 1) across timezones.
   * Use Case: Verifying that year and week numbering transition smoothly during global New Year events.
   */
  it("handles year boundary transition across timezones", () => {
    const date = "2023-12-31T23:59:59Z";
    const resultUTC = getZonedDateInfo(date, "UTC");
    const resultNY = getZonedDateInfo(date, "America/New_York");

    expect(resultUTC.year).toBe(2023);
    expect(resultNY.year).toBe(2023);
    expect(resultNY.hour).toBe(18); // 23:59 UTC - 5 hours = 18:59 NY
  });

  /**
   * Tests the "Spring Forward" DST gap (America/New_York, Mar 10, 2024).
   * Use Case: Validating behavior when a timestamp falls within the "skipped" hour of a DST transition.
   */
  it('handles the "Spring Forward" DST gap (America/New_York)', () => {
    // Clocks skip from 01:59 to 03:00. 07:30 UTC is 02:30 NY (during the gap).
    const result = getZonedDateInfo("2024-03-10T07:30:00Z", "America/New_York");
    // date-fns-tz usually shifts it forward or back. Here we just verify it doesn't crash.
    expect(result.hour).toBeGreaterThanOrEqual(2);
    expect(result.isoFormat).toContain("-04:00"); // Check that it correctly shifted to EDT
  });
});
