import { describe, it, expect } from 'vitest';
import { getAvailableHours, formatTimeForDisplay, formatTimeForDB } from './dateHelper';

describe('dateHelper utilities', () => {
  it('should exclude 08:00 on Senin', () => {
    expect(getAvailableHours('Senin')).not.toContain('08:00');
    expect(getAvailableHours('Senin')).toEqual(['10:00', '13:00', '15:00']);
  });

  it('should exclude 08:00 on Kamis', () => {
    expect(getAvailableHours('Kamis')).not.toContain('08:00');
    expect(getAvailableHours('Kamis')).toEqual(['10:00', '13:00', '15:00']);
  });

  it('should format and parse time strings correctly', () => {
    expect(formatTimeForDisplay('08:00:00')).toBe('08.00');
    expect(formatTimeForDisplay('15:00')).toBe('15.00');
    expect(formatTimeForDB('08.00')).toBe('08:00');
    expect(formatTimeForDB('15.30')).toBe('15:30');
  });
});
