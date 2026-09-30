import { describe, expect, it } from 'vitest';
import { categoryTotals, countPeopleByStatus, deriveTeam, filterRealtimePeople } from './dashboard';

describe('dashboard utilities', () => {
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

  it('distingue offline informado pela API de usuário sem entrada realtime', () => {
    const team = deriveTeam(
      [{ username: 'ana' }, { username: 'bia' }],
      [{ username: 'ana', status: 'offline', seconds_since_last_activity: 901 }],
    );

    expect(team.map(({ username, status }) => ({ username, status }))).toEqual([
      { username: 'ana', status: 'offline' },
      { username: 'bia', status: 'no-data' },
    ]);
  });

  it('combines categories across users and orders them by total duration', () => {
    const summary = {
      users: [
        {
          by_category: [
            { category: 'Reunião', total_seconds: 600 },
            { category: 'Código', total_seconds: 1800 },
          ],
        },
        { by_category: [{ category: 'Reunião', total_seconds: 2400 }] },
      ],
    };

    expect(categoryTotals(summary)).toEqual([
      { name: 'Reunião', seconds: 3000 },
      { name: 'Código', seconds: 1800 },
    ]);
    expect(categoryTotals(null)).toEqual([]);
  });
});
