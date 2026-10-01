export function deriveTeam(users = [], realtime = []) {
  const byUsername = new Map(realtime.map((entry) => [entry.username, entry]));
  return users.map((user) => {
    const latest = byUsername.get(user.username) || null;
    return { ...user, realtime: latest, status: latest?.status || 'no-data' };
  });
}

export function filterRealtimePeople(people, username) {
  const list = Array.isArray(people) ? people : [];
  return username ? list.filter((person) => person.username === username) : list;
}

export function countPeopleByStatus(people, status) {
  return (Array.isArray(people) ? people : []).filter((person) => person.status === status).length;
}
