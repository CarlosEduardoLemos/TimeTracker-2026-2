import { describe, expect, it } from 'vitest';
import { formatAttendanceTime, isCurrentDateInTimezone } from './attendance';

const timezone = 'America/Sao_Paulo';

describe('attendance date and timestamp formatting', () => {
  it('formats UTC timestamps on the Sao Paulo business date', () => {
    expect(formatAttendanceTime('2026-10-13T11:15:00Z', timezone)).toBe('08:15');
    expect(formatAttendanceTime('2026-10-14T02:42:00Z', timezone)).toBe('23:42');
  });

  it('uses the business date across a UTC midnight rollover', () => {
    expect(isCurrentDateInTimezone('2026-10-13', timezone, new Date('2026-10-14T02:59:00Z'))).toBe(
      true,
    );
    expect(isCurrentDateInTimezone('2026-10-13', timezone, new Date('2026-10-14T03:01:00Z'))).toBe(
      false,
    );
    expect(isCurrentDateInTimezone('2026-10-14', timezone, new Date('2026-10-14T03:01:00Z'))).toBe(
      true,
    );
  });
});
