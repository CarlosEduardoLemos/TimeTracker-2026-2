import { safeIsoDate } from "../utils/dashboard";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

function buildDashboardFilterQuery(date, username = "") {
  const parameters = [`date=${encodeURIComponent(safeIsoDate(date))}`];

  if (username) {
    parameters.push(`username=${encodeURIComponent(username)}`);
  }

  return parameters.join("&");
}

// Valida os campos consumidos pela interface; campos adicionais são preservados.
function validateSummary(summary, expectedDate) {
  if (
    summary?.date !== expectedDate ||
    !Array.isArray(summary.users) ||
    !summary.users.every((user) =>
      typeof user?.username === "string" && Number.isSafeInteger(user.total_seconds),
    )
  ) {
    throw new Error("Resumo diário incompatível com o contrato da API.");
  }
  return summary;
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
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("A API excedeu o tempo limite de 15 segundos.", "TimeoutError"));
  }, REQUEST_TIMEOUT_MS);

  try {
    controller.signal.throwIfAborted();
    const response = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`API respondeu com status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abort);
  }
}

async function requestOptionalJson(path, signal, fallbackValue, warningMessage, validate) {
  try {
    return { data: validate(await requestJson(path, signal)), failed: false };
  } catch (error) {
    if (signal?.aborted || error?.name === "AbortError") throw error;

    console.warn(warningMessage);
    return { data: fallbackValue, failed: true };
  }
}

async function requestOptionalArray(path, signal, warningMessage, validateItem) {
  return requestOptionalJson(path, signal, [], warningMessage, (data) => {
    if (!Array.isArray(data) || !data.every(validateItem)) {
      throw new Error("Lista incompatível com o contrato da API.");
    }
    return data;
  });
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
        (data) => validateSummary(data, day),
      );
    }),
  );
}

export async function fetchDashboardData(
  date,
  username = "",
  externalSignal,
  cachedPreviousSummaries = [],
) {
  const controller = new AbortController();
  const signal = controller.signal;
  const abort = () => controller.abort(externalSignal.reason);
  if (externalSignal?.aborted) abort();
  else externalSignal?.addEventListener("abort", abort, { once: true });

  try {
    const sanitizedDate = safeIsoDate(date);
    const filterQuery = buildDashboardFilterQuery(sanitizedDate, username);
    const previousDates = getPreviousDateKeys(sanitizedDate, 7).slice(0, 6);

    const [summary, realtimeResult, usersResult, previousSummaryResults] =
      await Promise.all([
        requestJson(`/dashboard/summary?${filterQuery}`, signal)
          .then((data) => validateSummary(data, sanitizedDate)),
        requestOptionalArray(
          "/activities/realtime",
          signal,
          "Falha ao consultar atividades em tempo real:",
          (person) => typeof person?.username === "string" &&
            typeof person.process_name === "string" &&
            ["online", "ausente"].includes(person.status) &&
            Number.isSafeInteger(person.seconds_since_last_activity),
        ),
        requestOptionalArray(
          "/users/",
          signal,
          "Falha ao consultar lista de colaboradores:",
          (user) => typeof user?.username === "string" &&
            (user.full_name == null || typeof user.full_name === "string"),
        ),
        fetchPreviousSummaries(
          previousDates,
          username,
          signal,
          cachedPreviousSummaries,
        ),
      ]);

    return {
      summary,
      realtime: realtimeResult.data,
      users: usersResult.data,
      weeklySummaries: [...previousSummaryResults.map(({ data }) => data), summary],
      availability: {
        realtime: !realtimeResult.failed,
        users: !usersResult.failed,
        history: previousSummaryResults.every(({ failed }) => !failed),
      },
    };
  } finally {
    // O lote deixa de ser útil quando o resumo obrigatório falha.
    controller.abort();
    externalSignal?.removeEventListener("abort", abort);
  }
}
