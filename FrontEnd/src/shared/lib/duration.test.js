import { describe, expect, it } from 'vitest';
import { fmtDuration } from './duration';

describe('fmtDuration', () => {
  it('formats whole hours and minutes, including a numeric string', () => {
    expect(fmtDuration()).toBe('0h 00min');
    expect(fmtDuration(3599)).toBe('0h 59min');
    expect(fmtDuration('3600')).toBe('1h 00min');
  });

  it('returns an em dash for negative or non-finite values', () => {
    expect(fmtDuration(-1)).toBe('—');
    expect(fmtDuration('invalid')).toBe('—');
    expect(fmtDuration(Infinity)).toBe('—');
  });
});
