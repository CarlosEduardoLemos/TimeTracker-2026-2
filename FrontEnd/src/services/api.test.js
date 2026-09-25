import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('cliente da API', () => {
  it('codifica o usuário no filtro do resumo', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ date: '2026-09-25', users: [] }) }));
    vi.stubGlobal('fetch', fetchMock);
    await api.summary('2026-09-25', 'ana & joão');
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/dashboard/summary');
    expect(url.searchParams.get('username')).toBe('ana & joão');
    expect(url.searchParams.get('date')).toBe('2026-09-25');
  });

  it('informa erro HTTP sem ler o corpo da resposta', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403, json })));
    await expect(api.users()).rejects.toThrow('API respondeu 403');
    expect(json).not.toHaveBeenCalled();
  });

  it('cancela uma consulta ao receber um sinal externo', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    })));
    const controller = new AbortController();
    const pending = expect(api.users(controller.signal)).rejects.toThrow('substituída');
    controller.abort(new Error('Consulta substituída'));
    await pending;
  });

  it('mantém timeout ativo até terminar de ler o corpo', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(async (_url, { signal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      }),
    })));
    const pending = expect(api.users()).rejects.toThrow('Tempo de resposta');
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
});
