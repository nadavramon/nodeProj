import { describe, it, expect } from 'vitest';
import { getIntervalCheckpoints } from '../src/dates/index.js';

describe('getIntervalCheckpoints', () => {
  it('returns checkpoints aligned by the default interval (day)', () => {
    const start = new Date('2023-01-01T00:00:00Z');
    const end = new Date('2023-01-03T00:00:00Z');
    const result = getIntervalCheckpoints(start, end);
    expect(result.length).toBe(3);
    expect(result[0].toISOString()).toBe(start.toISOString());
    expect(result[1].toISOString()).toBe(new Date('2023-01-02T00:00:00Z').toISOString());
    expect(result[2].toISOString()).toBe(end.toISOString());
  });

  it('returns checkpoints for a specific interval (month)', () => {
    const start = new Date('2023-01-01T00:00:00Z');
    const end = new Date('2023-03-01T00:00:00Z');
    const result = getIntervalCheckpoints(start, end, 'month');
    expect(result.length).toBe(3);
    expect(result[0].toISOString()).toBe(start.toISOString());
    expect(result[1].toISOString()).toBe(new Date('2023-02-01T00:00:00Z').toISOString());
    expect(result[2].toISOString()).toBe(end.toISOString());
  });

  it('falls back to "day" if an invalid interval is passed', () => {
    const start = new Date('2023-01-01T00:00:00Z');
    const end = new Date('2023-01-03T00:00:00Z');
    const result = getIntervalCheckpoints(start, end, 'invalid-interval');
    expect(result.length).toBe(3);
    expect(result[1].toISOString()).toBe(new Date('2023-01-02T00:00:00Z').toISOString());
  });

  it('adds the exact end date at the end of the checkpoints array', () => {
    const start = new Date('2023-01-01T00:00:00Z');
    const end = new Date('2023-01-02T12:00:00Z'); // Half day
    const result = getIntervalCheckpoints(start, end, 'day');
    expect(result.length).toBe(3);
    expect(result[0].toISOString()).toBe(start.toISOString());
    expect(result[1].toISOString()).toBe(new Date('2023-01-02T00:00:00Z').toISOString());
    expect(result[2].toISOString()).toBe(end.toISOString());
  });

  it('returns an empty array if start is after end', () => {
    const start = new Date('2023-01-10T00:00:00Z');
    const end = new Date('2023-01-01T00:00:00Z');
    const result = getIntervalCheckpoints(start, end);
    expect(result).toEqual([]);
  });

  it('returns an empty array if start date is invalid', () => {
    const result = getIntervalCheckpoints('invalid-start', '2023-01-01T00:00:00Z');
    expect(result).toEqual([]);
  });

  it('returns an empty array if end date is invalid', () => {
    const result = getIntervalCheckpoints('2023-01-01T00:00:00Z', 'invalid-end');
    expect(result).toEqual([]);
  });
});
