import { describe, it, expect } from 'vitest';
import { formatDateRange } from '../src/dates/index.js';

describe('formatDateRange', () => {
  it('formats a date range using the default short format', () => {
    const result = formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z');
    expect(result).toBe('01/01/23 - 10/01/23');
  });

  it('formats a date range using a predefined format key', () => {
    const result = formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z', 'iso');
    expect(result).toBe('2023-01-01 - 2023-01-10');
  });

  it('formats a date range using a custom format string', () => {
    const result = formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z', 'yyyy/MM/dd');
    expect(result).toBe('2023/01/01 - 2023/01/10');
  });

  it('sorts dates chronologically if start is after end', () => {
    const result = formatDateRange('2023-01-10T00:00:00Z', '2023-01-01T00:00:00Z', 'iso');
    expect(result).toBe('2023-01-01 - 2023-01-10');
  });

  it('throws for an invalid start date', () => {
    expect(() => formatDateRange('invalid-date', '2023-01-10T00:00:00Z')).toThrow(
      'Invalid date range: one or both dates are invalid'
    );
  });

  it('throws for an invalid end date', () => {
    expect(() => formatDateRange('2023-01-01T00:00:00Z', 'invalid-date')).toThrow(
      'Invalid date range: one or both dates are invalid'
    );
  });

  it('throws an error for an invalid format key or string', () => {
    // Passing a non-string value triggers the explicit validation
    expect(() => formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z', 42)).toThrow(
      'Invalid format key or string: "42"'
    );
  });

  it('lets date-fns throw for invalid format syntax (unescaped latin chars)', () => {
    // "foo" is not a valid date-fns format string — it throws a RangeError
    expect(() => formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z', 'foo')).toThrow();
  });
});
