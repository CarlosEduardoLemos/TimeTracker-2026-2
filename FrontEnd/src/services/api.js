import { safeIsoDate } from "../utils/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildDashboardFilterQuery(date, username = "") {
  const sanitizedDate = safeIsoDate(date);
  const parameters = [`date=${encodeURIComponent(sanitizedDate)}`];

  if (username) {
    parameters.push(`username=${encodeURIComponent(username)}`);
  }

  return parameters.join("&");
}

function normalizeSummary(summary) {
  return {
    ...summary,
    users: asArray(summary?.users),
  };
}

export function getPreviousDateKeys(date, count) {
  // safeIsoDate já garante uma data ISO válida antes do cálculo em UTC.
  const sanitizedDate = safeIsoDate(date);
  const [year, month, day] = sanitizedDate.split("-").map(Number);
  const selectedDate = new Date(Date.UTC(year, month - 1, day));

  return Array.from({ length: count }, (_, index) => {
    const currentDate = new Date(selectedDate);
    currentDate.setUTCDate(selectedDate.getUTCDate() - (count - 1 - index));
    return currentDate.toISOString().slice(0, 10);
  });
}

async function requestJson(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`API respondeu com status ${response.status}`);
  }

  return response.json();
}

async function requestOptionalJson(path, signal, fallbackValue, warningMessage) {
  try {
    return await requestJson(path, signal);
  } catch (error) {
    // Cancelamentos fazem parte da troca de filtros e precisam continuar subindo
    // para impedir que uma consulta antiga atualize a interface.
    if (error.name === "AbortError") throw error;

    console.warn(warningMessage, error);
    return fallbackValue;
  }
}

function fetchPreviousSummaries(previousDates, username, signal) {
  return Promise.all(
    previousDates.map((day) =>
      requestOptionalJson(
        `/dashboard/summary?${buildDashboardFilterQuery(day, username)}`,
        signal,
        { date: day, users: [] },
        `Falha ao consultar resumo do dia ${day}:`,
      ),
    ),
  );
}

export async function fetchDashboardData(date, username = "", signal) {
  const sanitizedDate = safeIsoDate(date);
  const filterQuery = buildDashboardFilterQuery(sanitizedDate, username);
  const previousDates = getPreviousDateKeys(sanitizedDate, 7).slice(0, 6);

  const [summary, realtime, users, previousSummaries] = await Promise.all([
    requestJson(`/dashboard/summary?${filterQuery}`, signal),
    requestOptionalJson(
      "/activities/realtime",
      signal,
      [],
      "Falha ao consultar atividades em tempo real:",
    ),
    requestOptionalJson(
      "/users/",
      signal,
      [],
      "Falha ao consultar lista de colaboradores:",
    ),
    fetchPreviousSummaries(previousDates, username, signal),
  ]);

  const normalizedSummary = normalizeSummary(summary);

  return {
    summary: normalizedSummary,
    realtime: asArray(realtime),
    users: asArray(users),
    // Reutiliza o resumo principal para completar o sétimo dia sem nova chamada.
    weeklySummaries: [
      ...previousSummaries.map(normalizeSummary),
      normalizedSummary,
    ],
  };
}

export function getReportUrl(format, date, username = "") {
  return `${API_BASE_URL}/dashboard/export/${format}?${buildDashboardFilterQuery(date, username)}`;
}
