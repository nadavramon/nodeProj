import { describe, it, expect } from 'vitest';
import { formatDateRange } from './date.js';

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

  it('returns "Invalid date range" for invalid start date', () => {
    const result = formatDateRange('invalid-date', '2023-01-10T00:00:00Z');
    expect(result).toBe('Invalid date range');
  });

  it('returns "Invalid date range" for invalid end date', () => {
    const result = formatDateRange('2023-01-01T00:00:00Z', 'invalid-date');
    expect(result).toBe('Invalid date range');
  });

  it('returns "Invalid format string" for invalid custom format', () => {
    // Passing "foo" will cause date-fns format() to throw a RangeError
    // because "f" and "o" are unescaped latin alphabet characters.
    const result = formatDateRange('2023-01-01T00:00:00Z', '2023-01-10T00:00:00Z', 'foo');
    expect(result).toBe('Invalid format string');
  });
});
