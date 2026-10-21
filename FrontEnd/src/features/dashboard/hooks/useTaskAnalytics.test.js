import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTaskAnalytics } from './useTaskAnalytics';

const task = {
  id: '6e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  title: 'Relatório mensal',
  description: 'Revisar relatório mensal',
  collaborators: [],
  created_at: '2026-10-13T14:20:00Z',
  updated_at: '2026-10-13T14:20:00Z',
};
const summary = { date: '2026-10-13', timezone: 'America/Sao_Paulo', tasks: [] };

describe('useTaskAnalytics', () => {
  it('carrega opções e resumo usando filtros de data, colaborador e Task', async () => {
    const devApi = {
      tasks: vi.fn().mockResolvedValue([task]),
      taskSummary: vi.fn().mockResolvedValue(summary),
    };
    const { result } = renderHook(() => useTaskAnalytics(devApi, '2026-10-13', 'ana', task.id));
    await waitFor(() => expect(result.current.summaryLoading).toBe(false));
    await waitFor(() => expect(result.current.tasksLoading).toBe(false));
    expect(result.current.tasks).toEqual([task]);
    expect(result.current.tasksAvailable).toBe(true);
    expect(result.current.summary).toEqual(summary);
    expect(devApi.taskSummary).toHaveBeenCalledWith(
      '2026-10-13',
      'ana',
      task.id,
      expect.any(AbortSignal),
    );
  });

  it('cancela consulta anterior e ignora resposta obsoleta ao mudar a Task', async () => {
    let finishFirst;
    let firstSignal;
    const nextSummary = {
      ...summary,
      tasks: [
        {
          task_id: task.id,
          title: task.title,
          total_seconds: 1800,
          collaborators: [],
        },
      ],
    };
    const devApi = {
      tasks: vi.fn().mockResolvedValue([task]),
      taskSummary: vi
        .fn()
        .mockImplementationOnce((_date, _username, _taskId, signal) => {
          firstSignal = signal;
          return new Promise((resolve) => {
            finishFirst = resolve;
          });
        })
        .mockResolvedValueOnce(nextSummary),
    };
    const { result, rerender } = renderHook(
      ({ taskId }) => useTaskAnalytics(devApi, '2026-10-13', 'ana', taskId),
      { initialProps: { taskId: '' } },
    );
    await waitFor(() => expect(firstSignal).toBeInstanceOf(AbortSignal));
    rerender({ taskId: task.id });
    await waitFor(() => expect(result.current.summary).toEqual(nextSummary));
    expect(firstSignal.aborted).toBe(true);

    await act(async () => finishFirst(summary));
    expect(result.current.summary).toEqual(nextSummary);
  });

  it('mantém erro de Tasks separado do resumo e permite retry', async () => {
    const devApi = {
      tasks: vi
        .fn()
        .mockRejectedValueOnce(new Error('Lista indisponível'))
        .mockResolvedValue([task]),
      taskSummary: vi
        .fn()
        .mockRejectedValueOnce(new Error('Resumo indisponível'))
        .mockResolvedValue(summary),
    };
    const { result } = renderHook(() => useTaskAnalytics(devApi, '2026-10-13', '', ''));
    await waitFor(() => expect(result.current.tasksError).toBe('Lista indisponível'));
    await waitFor(() => expect(result.current.summaryError).toBe('Resumo indisponível'));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.tasksError).toBeNull());
    await waitFor(() => expect(result.current.summaryError).toBeNull());
    expect(result.current.tasks).toEqual([task]);
    expect(result.current.summary).toEqual(summary);
  });

  it('não consulta API nem cria opções de Task quando integração não foi injetada', () => {
    const { result } = renderHook(() => useTaskAnalytics(null, '2026-10-13', '', ''));
    expect(result.current.tasksAvailable).toBe(false);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.summary).toBeNull();
  });
});
