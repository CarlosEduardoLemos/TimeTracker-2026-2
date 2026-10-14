import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTasks } from './useTasks';

const demoTask = {
  id: '6e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  description: 'Revisar relatório',
  created_at: '2026-10-13T14:20:00Z',
  updated_at: '2026-10-13T14:20:00Z',
};
const createdTask = {
  ...demoTask,
  id: '7e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  description: 'Task nova',
};

let devApi;
beforeEach(() => {
  devApi = {
    tasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn().mockResolvedValue(createdTask),
  };
});

describe('useTasks', () => {
  it('carrega a lista e cria uma Task validada', async () => {
    devApi.tasks.mockResolvedValue([demoTask]);
    const { result } = renderHook(() => useTasks(devApi));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([demoTask]);

    await act(async () => expect(await result.current.createTask('Task nova')).toBe(true));
    expect(devApi.createTask).toHaveBeenCalledWith('Task nova');
    expect(result.current.tasks).toEqual([demoTask, createdTask]);
    expect(result.current.created).toBe(true);
  });

  it('mantém o estado de erro e permite retry', async () => {
    devApi.tasks.mockRejectedValueOnce(new Error('API indisponível')).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useTasks(devApi));
    await waitFor(() => expect(result.current.error).toBe('API indisponível'));
    await act(async () => result.current.load());
    expect(result.current.error).toBeNull();
    expect(result.current.tasks).toEqual([]);
  });

  it('bloqueia descrição inválida antes de chamar a API', async () => {
    const { result } = renderHook(() => useTasks(devApi));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => expect(await result.current.createTask('  ')).toBe(false));
    expect(result.current.saveError).toMatch(/descrição/);
    expect(devApi.createTask).not.toHaveBeenCalled();
  });
});
