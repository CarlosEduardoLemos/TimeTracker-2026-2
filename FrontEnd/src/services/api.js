const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TIMEOUT = 15000;

async function request(path, { signal, ...options } = {}, read = response => response.json()) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort(new Error('Tempo de resposta da API esgotado')), TIMEOUT);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers,
    });
    if (!response.ok) throw new Error(`API respondeu ${response.status}`);
    return await read(response);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

function summaryPath(date, username = '') {
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00Z`) : null;
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
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
  users: signal => request('/users/', { signal }),
  realtime: signal => request('/activities/realtime', { signal }),
  summary: async (date, username = '', signal) => request(summaryPath(date, username), { signal }),
  settings: signal => request('/config/', { signal }),
  saveSettings: (payload, signal) => request('/config/', { method: 'PUT', body: JSON.stringify(payload), signal }),
  async exportFile(format, date, username = '', signal) {
    return request(exportPath(format, date, username), { signal }, response => {
      const expectedType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const contentType = response.headers?.get('content-type');
      if (contentType && !contentType.toLowerCase().startsWith(expectedType)) {
        throw new Error('Formato de resposta inválido');
      }
      return response.blob();
    });
  },
};
