import { describe, it, expect } from 'vitest';
import { getZonedDateInfo } from '../src/dates/index.js';

describe('getZonedDateInfo', () => {
  it('returns correctly parsed date info for a valid date and timezone', () => {
    const result = getZonedDateInfo('2023-01-15T12:00:00Z', 'America/New_York');
    // 12:00 UTC in January is 07:00 EST. 
    expect(result.year).toBe(2023);
    expect(result.month).toBe(1);
    expect(result.monthInText).toBe('January');
    expect(result.day).toBe(15);
    expect(result.dayInAWeek).toBe('Sunday');
    expect(result.hour).toBe(7);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
    expect(result.isoFormat).toBe('2023-01-15T07:00:00.000-05:00');
    expect(result.weekInAYear).toBeTypeOf('number'); // Usually depends on start of year, just check it's a number
    expect(result.dayInAYear).toBe(15);
    expect(result.quarter).toBe(1);
    expect(result.isWeekend).toBe(true);
    expect(result.daysInCurrentMonth).toBe(31);
    expect(result.timestamp).toBe(new Date('2023-01-15T12:00:00Z').getTime());
  });

  it('throws for an invalid date', () => {
    expect(() => getZonedDateInfo('invalid-date', 'America/New_York')).toThrow(
      'Invalid date: "invalid-date"'
    );
  });

  it('throws for an invalid timezone string', () => {
    expect(() => getZonedDateInfo('2023-01-15T12:00:00Z', 'Invalid/Timezone')).toThrow();
  });
});
