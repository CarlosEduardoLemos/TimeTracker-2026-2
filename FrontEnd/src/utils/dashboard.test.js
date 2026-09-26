import { describe, expect, it } from 'vitest';
import {
  countPeopleByStatus,
  filterRealtimePeople,
  formatDashboardReferenceDate,
  formatDuration,
  formatRelativeActivityTime,
  getSummaryTotalSeconds,
  safeIsoDate,
} from './dashboard';

describe('dashboard utilities', () => {
  it('formats durations consistently', () => {
    expect(formatDuration(0)).toBe('0h 00min');
    expect(formatDuration(3661)).toBe('1h 01min');
    expect(formatDuration(-10)).toBe('0h 00min');
  });

  it('sums registered time from users without productivity classification', () => {
    expect(
      getSummaryTotalSeconds({
        users: [{ total_seconds: 3600 }, { total_seconds: '120' }],
      }),
    ).toBe(3720);
  });

  it('formats relative activity time appropriately', () => {
    expect(formatRelativeActivityTime(0)).toBe('há 0s');
    expect(formatRelativeActivityTime(15)).toBe('há 15s');
    expect(formatRelativeActivityTime(59)).toBe('há 59s');
    expect(formatRelativeActivityTime(60)).toBe('há 1min');
    expect(formatRelativeActivityTime(150)).toBe('há 2min');
    expect(formatRelativeActivityTime(3600)).toBe('há 1h');
    expect(formatRelativeActivityTime(3720)).toBe('há 1h 2min');
    expect(formatRelativeActivityTime(7200)).toBe('há 2h');
  });

  it('validates and sanitizes ISO dates safely', () => {
    expect(safeIsoDate('2026-09-11')).toBe('2026-09-11');
    const fallbackRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(safeIsoDate('')).toMatch(fallbackRegex);
    expect(safeIsoDate(null)).toMatch(fallbackRegex);
    expect(safeIsoDate('invalid-date')).toMatch(fallbackRegex);
    expect(safeIsoDate('2026-02-31')).toMatch(fallbackRegex);
  });

  it('filters realtime people only when a collaborator is selected', () => {
    const people = [
      { username: 'ana', status: 'online' },
      { username: 'bruno', status: 'offline' },
    ];

    expect(filterRealtimePeople(people, '')).toEqual(people);
    expect(filterRealtimePeople(people, 'ana')).toEqual([people[0]]);
    expect(filterRealtimePeople(null, 'ana')).toEqual([]);
  });

  it('counts people by status without mutating the source list', () => {
    const people = [
      { username: 'ana', status: 'online' },
      { username: 'bruno', status: 'online' },
      { username: 'carla', status: 'offline' },
    ];

    expect(countPeopleByStatus(people, 'online')).toBe(2);
    expect(countPeopleByStatus(people, 'offline')).toBe(1);
    expect(countPeopleByStatus(undefined, 'online')).toBe(0);
  });

  it('formats the dashboard reference date in pt-BR', () => {
    expect(formatDashboardReferenceDate('2026-09-16')).toContain('16');
    expect(formatDashboardReferenceDate('2026-09-16')).toContain('SETEMBRO');
  });
});
