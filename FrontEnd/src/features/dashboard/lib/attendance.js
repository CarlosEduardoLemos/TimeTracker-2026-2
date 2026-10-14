export function formatAttendanceTime(value, timezone) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function isCurrentDateInTimezone(date, timezone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return date === `${values.year}-${values.month}-${values.day}`;
}
