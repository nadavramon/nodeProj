import { describe, it, expect } from "vitest";
import { formatDateRange } from "../../utils/dates/formatDateRange.js";

/**
 * Tests for the formatDateRange utility.
 * Note: Uses .concurrent for parallel execution as these are pure functions.
 */
describe.concurrent("formatDateRange", () => {
  const start = "2023-01-01T00:00:00Z";
  const end = "2023-01-10T00:00:00Z";

  describe("Core Formatting Capabilities", () => {
    /**
     * What it tests: Checks if dates can be formatted into clean display strings, like "short" or custom "yyyy/MM/dd".
     * Use case: Showing "01/01/23 - 10/01/23" on a mobile screen where space is tight.
     */
    it.each([
      ["short", undefined, "01/01/23 - 10/01/23"],
      ["iso", "iso", "2023-01-01 - 2023-01-10"],
      ["custom", "yyyy/MM/dd", "2023/01/01 - 2023/01/10"],
    ])("formats a date range using the %s format", (_, format, expected) => {
      expect(formatDateRange(start, end, format)).toBe(expected);
    });

    /**
     * What it tests: Checks if it can handle raw Date objects instead of just text strings.
     * Use case: A different part of your app hands you an actual Javascript Date, and it still successfully formats it.
     */
    it("accepts native Date objects as inputs", () => {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const result = formatDateRange(startDateObj, endDateObj, "iso");

      expect(result).toBe("2023-01-01 - 2023-01-10");
    });
  });

  describe("Edge Cases", () => {
    /**
     * What it tests: Checks how it displays a range if the start and end are on the exact same day.
     * Use case: Generating text for a 1-day calendar event.
     */
    it("handles identical start and end dates", () => {
      const result = formatDateRange(start, start, "iso");

      expect(result).toBe("2023-01-01 - 2023-01-01");
    });

    /**
     * What it tests: Checks if it automatically flips the dates around if you input the end before the start.
     * Use case: A user clicks dates on a calendar backward, but the text still displays logically from oldest to newest.
     */
    it("sorts dates chronologically if start is after end", () => {
      const result = formatDateRange(end, start, "iso");

      expect(result).toBe("2023-01-01 - 2023-01-10");
    });

    /**
     * What it tests: Checks if it correctly understands leap years, like February 29th.
     * Use case: Someone books a hotel over the 2024 leap day, and the text correctly reads "2024-02-28 - 2024-03-01".
     */
    it("handles ranges including Leap Day (Feb 29, 2024)", () => {
      const leapStart = "2024-02-28T12:00:00Z";
      const leapEnd = "2024-03-01T12:00:00Z";
      const result = formatDateRange(leapStart, leapEnd, "iso");

      expect(result).toBe("2024-02-28 - 2024-03-01");
    });
  });

  describe("Validation & Errors", () => {
    /**
     * What it tests: Checks if it throws a loud error when you give it gibberish strings instead of a real date.
     * Use case: Saving your app from crashing mysteriously later because a bad date sneaked through.
     */
    it.each([
      ["invalid start", "invalid-date", "2023-01-10T00:00:00Z"],
      ["invalid end", "2023-01-01T00:00:00Z", "invalid-date"],
    ])("throws for an %s date", (_, s, e) => {
      expect(() => formatDateRange(s, e)).toThrow(
        "Invalid date range: one or both dates are invalid",
      );
    });

    /**
     * What it tests: Checks if it blocks you from putting a number (like 42) into the format field.
     * Use case: A developer makes a typo and passes a number. The code catches it immediately to prevent bugs.
     */
    it("throws an error for an invalid format key or string (non-string)", () => {
      expect(() => formatDateRange(start, end, 42)).toThrow('Invalid format key or string: "42"');
    });

    /**
     * What it tests: Checks if it still throws errors when the internal date library fails.
     * Use case: Catching completely broken format text strings before they get rolled out to users.
     */
    it("lets date-fns throw for invalid format syntax (unescaped latin chars)", () => {
      expect(() => formatDateRange(start, end, "foo")).toThrow();
    });
  });
});
