import { describe, expect, it } from 'vitest';
import { countPeopleByStatus, filterRealtimePeople } from './dashboard';

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
});
