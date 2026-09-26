import { describe, expect, it } from 'vitest';
import {
  countPeopleByStatus,
  filterRealtimePeople,
  formatDashboardReferenceDate,
  formatDuration,
  formatRelativeActivityTime,
  getSummaryTotalSeconds,
  safeIsoDate,
  validUsers,
  validRealtime,
  validSummary,
} from './dashboard';

describe('dashboard utilities', () => {
  it('aceita listas vazias e campos opcionais nulos, mas rejeita objetos exibidos como texto', () => {
    expect(validUsers([])).toBe(true);
    expect(validUsers([{ username: 'ana', full_name: null, department: null }])).toBe(true);
    expect(validUsers([{ username: 'ana', full_name: { name: 'Ana' } }])).toBe(false);
    expect(validUsers([{ username: 'ana', department: [] }])).toBe(false);
    expect(
      validRealtime([
        {
          username: 'ana',
          status: 'online',
          seconds_since_last_activity: 0,
          process_name: { name: 'Editor' },
        },
      ]),
    ).toBe(false);
  });

  it('rejeita identidades ambíguas sem escolher arbitrariamente a última leitura', () => {
    expect(validUsers([{ username: 'ana' }, { username: 'ana' }])).toBe(false);
    const entry = { username: 'ana', status: 'online', seconds_since_last_activity: 4 };
    expect(validRealtime([entry, entry])).toBe(false);
    expect(validRealtime([{ ...entry, seconds_since_last_activity: -1 }])).toBe(false);
    expect(validRealtime([{ ...entry, seconds_since_last_activity: 0.5 }])).toBe(false);
  });

  it('rejeita resumo com data inexistente, usuário vazio e duração imprecisa', () => {
    expect(validSummary({ date: '2026-02-31', users: [] })).toBe(false);
    const user = {
      username: 'ana',
      total_seconds: 60,
      by_category: [{ category: 'Trabalho', total_seconds: 60 }],
    };
    expect(validSummary({ date: '2026-09-25', users: [user] })).toBe(true);
    expect(validSummary({ date: '2026-09-25', users: [{ ...user, username: '' }] })).toBe(false);
    expect(
      validSummary({
        date: '2026-09-25',
        users: [{ ...user, total_seconds: Number.MAX_SAFE_INTEGER + 1 }],
      }),
    ).toBe(false);
    expect(validSummary({ date: '2026-09-25', users: [user, user] })).toBe(false);
  });
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
