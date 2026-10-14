import { afterEach, describe, expect, it, vi } from 'vitest';
import { devApi } from './client';

afterEach(() => vi.unstubAllGlobals());

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
    await expect(devApi.createTask('  ')).rejects.toThrow('descrição');
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
    await expect(devApi.taskHours('2026-10-13', '2026-10-01')).rejects.toThrow('período válido');
  });

  it('consulta status do Agent em rota separada', async () => {
    const response = { agents: [] };
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => response }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(devApi.agentStatuses()).resolves.toEqual(response);
    expect(new URL(fetchMock.mock.calls[0][0]).pathname).toBe('/agents/status');
  });
});
