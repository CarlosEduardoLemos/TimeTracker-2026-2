import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_REFRESH_INTERVAL_MS, useAutoRefresh } from './useAutoRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executa a atualização no intervalo configurado quando habilitado', () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh(onRefresh));

    act(() => {
      vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS);
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('não agenda atualizações quando está desabilitado', () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh(onRefresh, false));

    act(() => {
      vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS * 2);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('atualiza imediatamente ao voltar para uma aba visível', () => {
    const onRefresh = vi.fn();
    renderHook(() => useAutoRefresh(onRefresh));

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
