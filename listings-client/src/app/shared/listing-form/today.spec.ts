import { todayAsIsoDate } from './today';

describe('todayAsIsoDate', () => {
  it('formats the local date as year-month-day', () => {
    expect(todayAsIsoDate(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09');
  });

  it('pads single-digit months and days', () => {
    expect(todayAsIsoDate(new Date(2026, 2, 5))).toBe('2026-03-05');
  });
});
