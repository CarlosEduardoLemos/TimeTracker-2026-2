import { safeIsoDate } from "../utils/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildDashboardFilterQuery(date, username = "") {
  const parameters = [`date=${encodeURIComponent(safeIsoDate(date))}`];

  if (username) {
    parameters.push(`username=${encodeURIComponent(username)}`);
  }

  return parameters.join("&");
}

function normalizeSummary(summary, fallbackDate) {
  return {
    ...summary,
    date: summary?.date || fallbackDate,
    users: asArray(summary?.users),
  };
}

function unavailableSummary(date) {
  return { date, users: [], unavailable: true };
}

export function getPreviousDateKeys(date, count) {
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
    return { data: await requestJson(path, signal), failed: false };
  } catch (error) {
    if (error.name === "AbortError") throw error;

    console.warn(warningMessage, error);
    return { data: fallbackValue, failed: true };
  }
}

async function requestOptionalArray(path, signal, warningMessage) {
  const result = await requestOptionalJson(path, signal, [], warningMessage);

  if (result.failed || Array.isArray(result.data)) {
    return result;
  }

  console.warn(`${warningMessage} Resposta inválida: era esperado um array.`);
  return { data: [], failed: true };
}

function findReusableSummary(cachedSummaries, date) {
  return cachedSummaries.find(
    (summary) => summary?.date === date && summary.unavailable !== true,
  );
}

function fetchPreviousSummaries(
  previousDates,
  username,
  signal,
  cachedSummaries = [],
) {
  return Promise.all(
    previousDates.map((day) => {
      const cachedSummary = findReusableSummary(cachedSummaries, day);
      if (cachedSummary) {
        return Promise.resolve({ data: cachedSummary, failed: false });
      }

      return requestOptionalJson(
        `/dashboard/summary?${buildDashboardFilterQuery(day, username)}`,
        signal,
        unavailableSummary(day),
        `Falha ao consultar resumo do dia ${day}:`,
      );
    }),
  );
}

export async function fetchDashboardData(
  date,
  username = "",
  signal,
  cachedPreviousSummaries = [],
) {
  const sanitizedDate = safeIsoDate(date);
  const filterQuery = buildDashboardFilterQuery(sanitizedDate, username);
  const previousDates = getPreviousDateKeys(sanitizedDate, 7).slice(0, 6);

  const [summary, realtimeResult, usersResult, previousSummaryResults] =
    await Promise.all([
      requestJson(`/dashboard/summary?${filterQuery}`, signal),
      requestOptionalArray(
        "/activities/realtime",
        signal,
        "Falha ao consultar atividades em tempo real:",
      ),
      requestOptionalArray(
        "/users/",
        signal,
        "Falha ao consultar lista de colaboradores:",
      ),
      fetchPreviousSummaries(
        previousDates,
        username,
        signal,
        cachedPreviousSummaries,
      ),
    ]);

  const normalizedPreviousSummaries = previousSummaryResults.map(
    ({ data: previousSummary, failed }, index) =>
      failed
        ? unavailableSummary(previousDates[index])
        : normalizeSummary(previousSummary, previousDates[index]),
  );

  const normalizedSummary = normalizeSummary(summary, sanitizedDate);

  return {
    summary: normalizedSummary,
    realtime: asArray(realtimeResult.data),
    users: asArray(usersResult.data),
    weeklySummaries: [...normalizedPreviousSummaries, normalizedSummary],
    availability: {
      realtime: !realtimeResult.failed,
      users: !usersResult.failed,
      history: previousSummaryResults.every(({ failed }) => !failed),
    },
  };
}
