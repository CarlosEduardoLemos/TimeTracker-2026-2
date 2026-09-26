import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('cliente da API', () => {
  it('não envia uma consulta cujo sinal já foi cancelado, mesmo com motivo timeout', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    controller.abort('timeout');
    await expect(api.users(controller.signal)).rejects.toMatchObject({ type: 'canceled' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('descarta leitura concluída depois do cancelamento externo', async () => {
    let finish;
    const controller = new AbortController();
    const json = vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json })),
    );
    const pending = expect(api.users(controller.signal)).rejects.toMatchObject({
      type: 'canceled',
    });
    await vi.waitFor(() => expect(json).toHaveBeenCalledOnce());
    controller.abort();
    finish([]);
    await pending;
  });

  it('rejeita um tipo MIME com sufixo enganoso', async () => {
    const blob = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: { get: () => 'text/csv-invalid' },
        blob,
      })),
    );
    await expect(api.exportFile('csv', '2026-09-25')).rejects.toMatchObject({
      type: 'invalid-response',
    });
    expect(blob).not.toHaveBeenCalled();
  });
  it('codifica o usuário no filtro do resumo', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ date: '2026-09-25', users: [] }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    await api.summary('2026-09-25', 'ana & joão');
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/dashboard/summary');
    expect(url.searchParams.get('username')).toBe('ana & joão');
    expect(url.searchParams.get('date')).toBe('2026-09-25');
  });

  it('informa erro HTTP sem ler o corpo da resposta', async () => {
    const json = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403, json })),
    );
    await expect(api.users()).rejects.toThrow('API respondeu 403');
    expect(json).toHaveBeenCalledOnce();
  });

  it('preserva status e detail do FastAPI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Regra não encontrada' }),
      })),
    );
    await expect(api.users()).rejects.toMatchObject({
      name: 'ApiError',
      type: 'client',
      status: 404,
      statusText: 'Not Found',
      detail: 'Regra não encontrada',
      message: 'Regra não encontrada',
    });
  });

  it('identifica validação, erro de servidor, rede e JSON inválido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 422,
        json: async () => ({ detail: [{ msg: 'valor inválido' }] }),
      })),
    );
    await expect(api.users()).rejects.toMatchObject({ type: 'client', message: 'valor inválido' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })),
    );
    await expect(api.users()).rejects.toMatchObject({ type: 'server', status: 503 });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    await expect(api.users()).rejects.toMatchObject({
      type: 'network',
      message: 'Não foi possível conectar à API',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => {
          throw new SyntaxError('JSON');
        },
      })),
    );
    await expect(api.users()).rejects.toMatchObject({ type: 'invalid-response' });
  });

  it('cancela uma consulta ao receber um sinal externo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          }),
      ),
    );
    const controller = new AbortController();
    const pending = expect(api.users(controller.signal)).rejects.toMatchObject({
      type: 'canceled',
      message: 'Consulta substituída',
    });
    controller.abort(new Error('Consulta substituída'));
    await pending;
  });

  it('mantém timeout ativo até terminar de ler o corpo', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, { signal }) => ({
        ok: true,
        json: () =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          }),
      })),
    );
    const pending = expect(api.users()).rejects.toMatchObject({
      type: 'timeout',
      message: 'Tempo de resposta da API esgotado',
    });
    await vi.advanceTimersByTimeAsync(15000);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('baixa apenas formatos CSV e PDF', async () => {
    const blob = new Blob(['dados'], { type: 'text/csv' });
    const fetchMock = vi.fn(async () => ({ ok: true, blob: async () => blob }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await api.exportFile('csv', '2026-09-25')).toBe(blob);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/dashboard/export/csv');
    await expect(api.exportFile('html', '2026-09-25')).rejects.toThrow('Formato');
  });

  it('rejects invalid dates before sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.summary('2026-02-31')).rejects.toThrow('data válida');
    await expect(api.exportFile('csv', '')).rejects.toThrow('data válida');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an HTML response in place of a CSV export', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: { get: () => 'text/html; charset=utf-8' },
        blob: vi.fn(),
      })),
    );
    await expect(api.exportFile('csv', '2026-09-25')).rejects.toThrow(
      'Formato de resposta inválido',
    );
  });
});
