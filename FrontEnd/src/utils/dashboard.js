const DASHBOARD_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

export function getSummaryTotalSeconds(summary) {
  return (summary?.users ?? []).reduce(
    (total, user) => total + (Number(user.total_seconds) || 0),
    0,
  );
}

export function formatRelativeActivityTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (seconds < 60) return `há ${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `há ${hours}h`;

  return `há ${hours}h ${remainingMinutes}min`;
}

/**
 * Valida uma data ISO local (AAAA-MM-DD). Valores inválidos retornam a data
 * atual para manter os filtros do Dashboard em um estado utilizável.
 */
export function safeIsoDate(dateString) {
  if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      !Number.isNaN(date.getTime()) &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return dateString;
    }
  }

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function filterRealtimePeople(realtimePeople, selectedUsername = "") {
  const people = Array.isArray(realtimePeople) ? realtimePeople : [];
  return selectedUsername
    ? people.filter((person) => person.username === selectedUsername)
    : people;
}

export function countPeopleByStatus(people, status) {
  if (!Array.isArray(people)) return 0;
  return people.filter((person) => person.status === status).length;
}

export function formatDashboardReferenceDate(dateString) {
  const date = safeIsoDate(dateString);
  return DASHBOARD_DATE_FORMATTER.format(new Date(`${date}T12:00:00`)).toUpperCase();
}
