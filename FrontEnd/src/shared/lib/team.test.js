import { describe, expect, it } from 'vitest';
import { countPeopleByStatus, deriveTeam, filterRealtimePeople } from './team';

describe('team utilities', () => {
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

  it('preserves API offline and distinguishes users without realtime data', () => {
    const team = deriveTeam(
      [{ username: 'ana' }, { username: 'bia' }],
      [{ username: 'ana', status: 'offline', seconds_since_last_activity: 901 }],
    );

    expect(team.map(({ username, status }) => ({ username, status }))).toEqual([
      { username: 'ana', status: 'offline' },
      { username: 'bia', status: 'no-data' },
    ]);
  });
});
