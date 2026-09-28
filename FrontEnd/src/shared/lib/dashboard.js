export function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fmtDuration(seconds = 0) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';
  return `${Math.floor(value / 3600)}h ${String(Math.floor((value % 3600) / 60)).padStart(2, '0')}min`;
}

export function totalSeconds(summary) {
  return summary?.users?.reduce((sum, user) => sum + user.total_seconds, 0) || 0;
}

export function deriveTeam(users = [], realtime = []) {
  const byUsername = new Map(realtime.map((entry) => [entry.username, entry]));
  return users.map((user) => {
    const latest = byUsername.get(user.username) || null;
    return { ...user, realtime: latest, status: latest?.status || 'offline' };
  });
}

export function categoryTotals(summary) {
  const totals = new Map();
  for (const user of summary?.users || []) {
    for (const category of user.by_category) {
      totals.set(category.category, (totals.get(category.category) || 0) + category.total_seconds);
    }
  }
  return [...totals.entries()]
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((first, second) => second.seconds - first.seconds);
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function filterRealtimePeople(people, username) {
  const list = Array.isArray(people) ? people : [];
  return username ? list.filter((person) => person.username === username) : list;
}

export function countPeopleByStatus(people, status) {
  return (Array.isArray(people) ? people : []).filter((person) => person.status === status).length;
}
