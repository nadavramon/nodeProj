import { describe, it, expect, vi, beforeEach } from "vitest";
import { getZonedDateInfo } from "../../dates/getZonedDateInfo.js";

/**
 * Tests for the getZonedDateInfo utility.
 * Note: Uses .concurrent for parallel execution.
 */
describe.concurrent("getZonedDateInfo", () => {
  describe("Core Capabilities", () => {
    /**
     * What it tests: Checks if it successfully rips apart a date into easily-used pieces (year, month, day, etc.)
     * Use case: You want to print out "Sunday", "January", and "7 AM" separately in a beautiful UI.
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
     * What it tests: Checks if it can handle crazy timezones, like ones that are off by exactly 45 minutes instead of full hours.
     * Use case: You have users in the Chatham Islands, which specifically has a weird +13:45 timezone.
     */
    it("handles complex timezone offsets (45-min offset)", () => {
      // Pacific/Chatham is UTC+12:45 (or +13:45 in DST)
      const result = getZonedDateInfo("2023-01-15T12:00:00Z", "Pacific/Chatham");

      expect(result.isoFormat).toContain("+13:45"); // Jan is DST in Chatham
      expect(result.hour).toBe(1); // 12:00 UTC + 13:45 = 01:45 next day
      expect(result.minute).toBe(45);
    });
  });

  describe("Edge Cases & Time Shifts", () => {
    /**
     * What it tests: Checks if it correctly flags February 29th during a Leap Year.
     * Use case: Knowing exactly how many days are in the month when showing a calendar for Feb 2024.
     */
    it("handles Leap Day (Feb 29, 2024) correctly", () => {
      const result = getZonedDateInfo("2024-02-29T12:00:00Z", "UTC");

      expect(result.day).toBe(29);
      expect(result.daysInCurrentMonth).toBe(29);
      expect(result.isWeekend).toBe(false); // Feb 29, 2024 was a Thursday
    });

    /**
     * What it tests: Checks if stepping over midnight on New Year's Eve rolls everything over smoothly into the next year.
     * Use case: Making sure your app doesn't accidentally log "January 1st, 2023" for people who celebrate New Year's earlier than you do.
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
     * What it tests: Checks if the math survives during the specific hour when clocks "skip forward" for Daylight Saving Time.
     * Use case: An automated event fires right as DST changes, so you ensure it doesn't crash or get confused during the "missing" hour.
     */
    it('handles the "Spring Forward" DST gap (America/New_York)', () => {
      // Clocks skip from 01:59 to 03:00. 07:30 UTC is 02:30 NY (during the gap).
      const result = getZonedDateInfo("2024-03-10T07:30:00Z", "America/New_York");

      // date-fns-tz usually shifts it forward or back. Here we just verify it doesn't crash.
      expect(result.hour).toBeGreaterThanOrEqual(2);
      expect(result.isoFormat).toContain("-04:00"); // Check that it correctly shifted to EDT
    });
  });

  describe("Validation & Errors", () => {
    /**
     * What it tests: Checks if it throws an error instead of breaking silently when fed bad date text.
     * Use case: Ensuring a database doesn't get flooded with empty or "NaN" objects if a bad date is loaded.
     */
    it("throws for an invalid date", () => {
      expect(() => getZonedDateInfo("invalid-date", "America/New_York")).toThrow(
        'Invalid date: "invalid-date"',
      );
    });

    /**
     * What it tests: Checks if it throws an error when you give it a fake timezone name.
     * Use case: Allowing developers to know immediately if they fat-fingered "America/New_Yrok" in a configuration setting.
     */
    it("throws for an invalid timezone string", () => {
      expect(() => getZonedDateInfo("2023-01-15T12:00:00Z", "Invalid/Timezone")).toThrow();
    });
  });
});
