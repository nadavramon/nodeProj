import { describe, it, expect } from "vitest";
import { formatDateRange } from "../src/dates/index.js";

/**
 * Tests for the formatDateRange utility.
 * Note: Uses .concurrent for parallel execution as these are pure functions.
 */
describe.concurrent("formatDateRange", () => {
  const start = "2023-01-01T00:00:00Z";
  const end = "2023-01-10T00:00:00Z";

  /**
   * Tests formatting with different format keys and custom strings.
   * Use Case: Displaying date ranges in various UI contexts (ISO for APIs, short for mobile, custom for specific localizations).
   */
  it.each([
    ["short", undefined, "01/01/23 - 10/01/23"],
    ["iso", "iso", "2023-01-01 - 2023-01-10"],
    ["custom", "yyyy/MM/dd", "2023/01/01 - 2023/01/10"],
  ])("formats a date range using the %s format", (_, format, expected) => {
    expect(formatDateRange(start, end, format)).toBe(expected);
  });

  /**
   * Tests if the function correctly swaps dates if the start date is after the end date.
   * Use Case: Handling user input where dates might be selected in an arbitrary order.
   */
  it("sorts dates chronologically if start is after end", () => {
    const result = formatDateRange(end, start, "iso");
    expect(result).toBe("2023-01-01 - 2023-01-10");
  });

  /**
   * Tests error handling for non-parseable date strings.
   * Use Case: Preventing the application from processing corrupt or malformed date inputs.
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
   * Tests validation for invalid format types (e.g., numbers).
   * Use Case: Ensuring developers pass strings as format keys to avoid runtime crashes in formatting logic.
   */
  it("throws an error for an invalid format key or string (non-string)", () => {
    expect(() => formatDateRange(start, end, 42)).toThrow('Invalid format key or string: "42"');
  });

  /**
   * Tests that the function lets underlying library (date-fns) throw for invalid syntax.
   * Use Case: Catching invalid formatting tokens (like unescaped characters) early during development.
   */
  it("lets date-fns throw for invalid format syntax (unescaped latin chars)", () => {
    expect(() => formatDateRange(start, end, "foo")).toThrow();
  });

  /**
   * Tests formatting when start and end dates are identical.
   * Use Case: Representing an event occurring on a single point in time as a range.
   */
  it("handles identical start and end dates", () => {
    const result = formatDateRange(start, start, "iso");
    expect(result).toBe("2023-01-01 - 2023-01-01");
  });

  /**
   * Tests input flexibility by passing native Date objects instead of strings.
   * Use Case: Allowing developers to pass pre-parsed Date objects from other parts of the system.
   */
  it("accepts native Date objects as inputs", () => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const result = formatDateRange(startDateObj, endDateObj, "iso");
    expect(result).toBe("2023-01-01 - 2023-01-10");
  });

  /**
   * Tests formatting across a Leap Day boundary.
   * Use Case: Ensuring formatting and chronological sorting work correctly during leap years (e.g., Feb 29, 2024).
   */
  it("handles ranges including Leap Day (Feb 29, 2024)", () => {
    const leapStart = "2024-02-28T12:00:00Z";
    const leapEnd = "2024-03-01T12:00:00Z";
    const result = formatDateRange(leapStart, leapEnd, "iso");
    expect(result).toBe("2024-02-28 - 2024-03-01");
  });
});
