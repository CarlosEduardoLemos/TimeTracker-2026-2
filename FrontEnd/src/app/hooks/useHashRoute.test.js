import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useHashRoute } from './useHashRoute';
import { registerRouteLeaveGuard } from '../../shared/lib/routeLeaveGuard';

afterEach(() => {
  window.location.hash = '';
});

describe('useHashRoute', () => {
  it('marks unknown routes as not found', () => {
    window.location.hash = '#/rota-inexistente';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe('notFound');
  });

  it('updates when the hash changes', () => {
    window.location.hash = '#/painel';
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      window.location.hash = '#/tasks';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current).toBe('tasks');
  });

  it('preserva a rota ao cancelar a saída e libera a navegação após aceitar', () => {
    window.location.hash = '#/configuracoes';
    const { result } = renderHook(() => useHashRoute());
    let allow = false;
    const unregister = registerRouteLeaveGuard(() => allow);
    try {
      act(() => {
        window.location.hash = '#/painel';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      expect(result.current).toBe('configuracoes');
      expect(window.location.hash).toBe('#/configuracoes');
      allow = true;
      act(() => {
        window.location.hash = '#/painel';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      expect(result.current).toBe('painel');
    } finally {
      unregister();
    }
  });
});
