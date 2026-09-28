import { describe, expect, it } from 'vitest';
import { countPeopleByStatus, filterRealtimePeople } from './dashboard';
import { validUsers, validRealtime, validSummary } from '../api/validators';

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
});
