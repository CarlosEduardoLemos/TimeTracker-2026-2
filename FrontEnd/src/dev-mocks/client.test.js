import { afterEach, describe, expect, it, vi } from 'vitest';
import { devApi } from './client';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('cliente isolado dos mocks de desenvolvimento', () => {
  it('lista Tasks pela rota proposta e valida a resposta', async () => {
    const response = [];
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => response }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.tasks()).resolves.toEqual(response);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/tasks');
  });

  it('cria Task com descrição validada e rejeita resposta incompatível', async () => {
    const task = {
      id: '6e7b94da-5651-46a0-bf28-fcb8f4f14c04',
      description: 'Revisar relatório',
      created_at: '2026-10-13T14:20:00Z',
      updated_at: '2026-10-13T14:20:00Z',
    };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => task }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.createTask(' Revisar relatório ')).resolves.toEqual(task);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      description: 'Revisar relatório',
    });
    expect(() => devApi.createTask('  ')).toThrow('descrição');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({}) })),
    );
    await expect(devApi.tasks()).rejects.toThrow('Resposta inválida');
  });

  it('consulta jornada e codifica username no filtro', async () => {
    const attendance = {
      date: '2026-10-13',
      timezone: 'America/Sao_Paulo',
      as_of: '2026-10-13T19:50:00Z',
      users: [],
    };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => attendance }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.attendance('2026-10-13', 'ana & joão')).resolves.toEqual(attendance);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/dashboard/attendance');
    expect(url.searchParams.get('username')).toBe('ana & joão');
  });

  it('envia o período de horas e trata falhas HTTP sem converter em vazio', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Consulta indisponível' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.taskHours('2026-10-01', '2026-10-13')).rejects.toThrow(
      'Consulta indisponível',
    );
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/dashboard/task-hours');
    expect(() => devApi.taskHours('2026-10-13', '2026-10-01')).toThrow('período válido');
  });

  it('consulta status do Agent em rota separada', async () => {
    const response = { agents: [] };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => response }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.agentStatuses()).resolves.toEqual(response);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/agents/status');
  });

  it('normalizes network failures, invalid JSON, and HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => {
          throw new SyntaxError('invalid json');
        },
      })),
    );
    await expect(devApi.tasks()).rejects.toMatchObject({ type: 'invalid-response' });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(devApi.tasks()).rejects.toMatchObject({ type: 'network' });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
        statusText: 'Unavailable',
        json: async () => {
          throw new SyntaxError('empty response');
        },
      })),
    );
    await expect(devApi.tasks()).rejects.toMatchObject({ type: 'server', status: 503 });
  });

  it('honors AbortSignal cancellation before sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    controller.abort();

    await expect(devApi.tasks(controller.signal)).rejects.toMatchObject({ type: 'canceled' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('applies the shared request timeout to mock API calls', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = devApi.tasks();
    const rejection = expect(pending).rejects.toMatchObject({ type: 'timeout' });
    await vi.advanceTimersByTimeAsync(15000);
    await rejection;
  });
});
