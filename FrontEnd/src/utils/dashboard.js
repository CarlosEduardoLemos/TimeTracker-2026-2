export function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fmtDuration(seconds = 0) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';
  return `${Math.floor(value / 3600)}h ${String(Math.floor((value % 3600) / 60)).padStart(2, '0')}min`;
}

export function validUsers(value) {
  return (
    uniqueUsers(value) &&
    value.every((user) => optionalText(user.full_name) && optionalText(user.department))
  );
}

function optionalText(value) {
  return value == null || typeof value === 'string';
}

function uniqueUsers(value) {
  return (
    Array.isArray(value) &&
    value.every((user) => user && typeof user.username === 'string' && user.username.length > 0) &&
    new Set(value.map((user) => user.username)).size === value.length
  );
}

export function validRealtime(value) {
  return (
    uniqueUsers(value) &&
    value.every(
      (entry) =>
        entry &&
        ['online', 'ausente'].includes(entry.status) &&
        Number.isSafeInteger(entry.seconds_since_last_activity) &&
        entry.seconds_since_last_activity >= 0 &&
        optionalText(entry.process_name) &&
        optionalText(entry.window_title) &&
        optionalText(entry.hostname) &&
        optionalText(entry.category),
    )
  );
}

export function validSummary(value) {
  return (
    value &&
    isIsoDate(value.date) &&
    uniqueUsers(value.users) &&
    value.users.every(
      (user) =>
        user &&
        typeof user.username === 'string' &&
        Number.isSafeInteger(user.total_seconds) &&
        user.total_seconds >= 0 &&
        Array.isArray(user.by_category) &&
        user.by_category.every(
          (category) =>
            category &&
            typeof category.category === 'string' &&
            Number.isSafeInteger(category.total_seconds) &&
            category.total_seconds >= 0,
        ),
    )
  );
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

// Helpers used by the existing chart and status components.
export function formatDuration(seconds) {
  return fmtDuration(Math.max(0, Number(seconds) || 0));
}

export function getSummaryTotalSeconds(summary) {
  return summary?.users?.reduce((sum, user) => sum + (Number(user?.total_seconds) || 0), 0) || 0;
}

export function formatRelativeActivityTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  if (value < 60) return `há ${value}s`;
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  if (!hours) return `há ${minutes}min`;
  return `há ${hours}h${minutes ? ` ${minutes}min` : ''}`;
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function safeIsoDate(value) {
  return isIsoDate(value) ? value : todayIso();
}

export function filterRealtimePeople(people, username) {
  const list = Array.isArray(people) ? people : [];
  return username ? list.filter((person) => person.username === username) : list;
}

export function countPeopleByStatus(people, status) {
  return (Array.isArray(people) ? people : []).filter((person) => person.status === status).length;
}

export function formatDashboardReferenceDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .format(new Date(`${safeIsoDate(value)}T12:00:00`))
    .toUpperCase();
}
