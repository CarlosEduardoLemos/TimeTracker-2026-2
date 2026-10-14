import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAttendanceData } from './useAttendanceData';

const attendance = {
  date: '2026-10-13',
  timezone: 'America/Sao_Paulo',
  as_of: '2026-10-13T19:50:00Z',
  users: [{ username: 'ana', first_activity_at: null, last_activity_at: null }],
};

let devApi;
beforeEach(() => {
  devApi = { attendance: vi.fn().mockResolvedValue(attendance) };
});

describe('useAttendanceData', () => {
  it('consulta pelo dia e colaborador selecionados', async () => {
    const { result } = renderHook(() => useAttendanceData(devApi, '2026-10-13', 'ana'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(devApi.attendance).toHaveBeenCalledWith('2026-10-13', 'ana', expect.any(AbortSignal));
    expect(result.current.data).toEqual(attendance);
  });

  it('mantém erro da fonte e permite retry sem convertê-lo em lista vazia', async () => {
    devApi.attendance.mockRejectedValueOnce(new Error('Serviço indisponível'));
    const { result } = renderHook(() => useAttendanceData(devApi, '2026-10-13', ''));
    await waitFor(() => expect(result.current.error).toBe('Serviço indisponível'));
    expect(result.current.data).toBeNull();
    await act(async () => result.current.refresh());
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(attendance);
  });

  it('cancela resposta obsoleta quando os filtros mudam', async () => {
    let finish;
    const nextAttendance = { ...attendance, date: '2026-10-12' };
    devApi.attendance.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    devApi.attendance.mockResolvedValueOnce(nextAttendance);
    const { result, rerender } = renderHook(({ date }) => useAttendanceData(devApi, date, ''), {
      initialProps: { date: '2026-10-13' },
    });
    rerender({ date: '2026-10-12' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => finish?.({ ...attendance, date: '2026-10-13' }));
    expect(result.current.data.date).toBe('2026-10-12');
  });
});
