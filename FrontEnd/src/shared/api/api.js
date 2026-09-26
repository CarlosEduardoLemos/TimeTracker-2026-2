import { isIsoDate } from '../lib/dashboard';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(message, { type, status = null, statusText = '', detail = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
  }
}

function detailMessage(detail) {
  if (typeof detail === 'string') return detail.trim().slice(0, 500);
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item?.msg === 'string' ? item.msg : ''))
      .filter(Boolean)
      .join('; ')
      .slice(0, 500);
  }
  return '';
}

async function httpError(response) {
  let detail = null;
  try {
    const body = await response.json();
    detail = body?.detail ?? null;
  } catch {
    // An empty or non-JSON error body still preserves the HTTP status.
  }
  return new ApiError(detailMessage(detail) || `API respondeu ${response.status}`, {
    type: response.status >= 500 ? 'server' : 'client',
    status: response.status,
    statusText: response.statusText || '',
    detail,
  });
}

async function request(path, { signal, ...options } = {}, read = (response) => response.json()) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => {
    if (controller.signal.aborted) return;
    timedOut = true;
    controller.abort();
  }, TIMEOUT);
  try {
    controller.signal.throwIfAborted();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: options.body
        ? { 'Content-Type': 'application/json', ...options.headers }
        : options.headers,
    });
    controller.signal.throwIfAborted();
    if (!response.ok) throw await httpError(response);
    try {
      const value = await read(response);
      controller.signal.throwIfAborted();
      return value;
    } catch (cause) {
      if (
        !controller.signal.aborted &&
        (cause instanceof SyntaxError || cause instanceof TypeError)
      ) {
        throw new ApiError('Resposta inválida da API', { type: 'invalid-response', cause });
      }
      throw cause;
    }
  } catch (cause) {
    if (controller.signal.aborted) {
      if (timedOut) {
        throw new ApiError('Tempo de resposta da API esgotado', { type: 'timeout', cause });
      }
      throw new ApiError(
        signal?.reason instanceof Error ? signal.reason.message : 'Requisição cancelada',
        {
          type: 'canceled',
          cause,
        },
      );
    }
    if (cause instanceof ApiError) throw cause;
    if (cause instanceof TypeError)
      throw new ApiError('Não foi possível conectar à API', { type: 'network', cause });
    if (cause instanceof SyntaxError)
      throw new ApiError('Resposta inválida da API', { type: 'invalid-response', cause });
    throw cause;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

function summaryPath(date, username = '') {
  if (!isIsoDate(date)) {
    throw new Error('Selecione uma data válida');
  }
  const query = new URLSearchParams({ date });
  if (username) query.set('username', username);
  return `/dashboard/summary?${query}`;
}

function exportPath(format, date, username = '') {
  if (!['csv', 'pdf'].includes(format)) throw new Error('Formato de exportação inválido');
  return summaryPath(date, username).replace('/summary?', `/export/${format}?`);
}

export const api = {
  users: (signal) => request('/users/', { signal }),
  realtime: (signal) => request('/activities/realtime', { signal }),
  summary: async (date, username = '', signal) => request(summaryPath(date, username), { signal }),
  settings: (signal) => request('/config/', { signal }),
  saveSettings: (payload, signal) =>
    request('/config/', { method: 'PUT', body: JSON.stringify(payload), signal }),
  async exportFile(format, date, username = '', signal) {
    return request(exportPath(format, date, username), { signal }, (response) => {
      const expectedType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const contentType = response.headers?.get('content-type');
      if (contentType && contentType.split(';')[0].trim().toLowerCase() !== expectedType) {
        throw new ApiError('Formato de resposta inválido', { type: 'invalid-response' });
      }
      return response.blob();
    });
  },
};
