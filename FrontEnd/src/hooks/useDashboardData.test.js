import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDashboardData } from './useDashboardData';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: { summary: vi.fn(), users: vi.fn(), realtime: vi.fn() },
}));

const summary = { date: '2026-09-25', users: [] };
beforeEach(() => {
  vi.clearAllMocks();
  api.summary.mockResolvedValue(summary);
  api.users.mockResolvedValue([]);
  api.realtime.mockResolvedValue([]);
});

describe('useDashboardData', () => {
  it('carrega as três fontes e registra a atualização', async () => {
    const { result } = renderHook(() => useDashboardData('2026-09-25', ''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.availability).toEqual({ summary: true, users: true, realtime: true });
    expect(result.current.updatedAt).toBeInstanceOf(Date);
  });

  it('mantém os dados durante atualização manual', async () => {
    const { result } = renderHook(() => useDashboardData('2026-09-25', ''));
    await waitFor(() => expect(result.current.data?.summary).toEqual(summary));
    let finish;
    api.summary.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    act(() => { result.current.refresh(); });
    expect(result.current.refreshing).toBe(true);
    expect(result.current.data.summary).toEqual(summary);
    await act(async () => finish(summary));
    expect(result.current.refreshing).toBe(false);
  });

  it('separa falha parcial de uma lista vazia válida', async () => {
    api.realtime.mockRejectedValue(new Error('API indisponível'));
    const { result } = renderHook(() => useDashboardData('2026-09-25', ''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.availability.realtime).toBe(false);
    expect(result.current.data.availability.users).toBe(true);
    expect(result.current.error).toMatch(/indisponíveis/);
  });

  it('rejects a valid summary for a different date', async () => {
    api.summary.mockResolvedValue({ date: '2026-09-24', users: [] });
    const { result } = renderHook(() => useDashboardData('2026-09-25', ''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.availability.summary).toBe(false);
    expect(result.current.data.summary).toBeNull();
  });
});
