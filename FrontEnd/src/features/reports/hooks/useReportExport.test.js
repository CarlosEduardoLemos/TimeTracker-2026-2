import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../shared/api/api';
import { useReportExport } from './useReportExport';

vi.mock('../../../shared/api/api', () => ({ api: { exportFile: vi.fn() } }));

let downloadedFilename;
let revokeObjectURL;
beforeEach(() => {
  vi.resetAllMocks();
  downloadedFilename = null;
  revokeObjectURL = vi.fn();
  vi.stubGlobal(
    'URL',
    Object.assign(class extends URL {}, {
      createObjectURL: vi.fn(() => 'blob:report'),
      revokeObjectURL,
    }),
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureDownload() {
    downloadedFilename = this.download;
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useReportExport', () => {
  it('envia filtros, inicia um download e libera a URL de objeto', async () => {
    vi.useFakeTimers();
    api.exportFile.mockResolvedValue(new Blob(['dados'], { type: 'text/csv' }));
    const { result } = renderHook(() => useReportExport('2026-09-28', 'joao'));
    await act(async () => result.current.download('csv'));
    expect(api.exportFile).toHaveBeenCalledWith(
      'csv',
      '2026-09-28',
      'joao',
      expect.any(AbortSignal),
    );
    expect(downloadedFilename).toBe('resumo_joao_2026-09-28.csv');
    expect(result.current.success).toBe('Download de CSV iniciado.');
    expect(result.current.exporting).toBe('');
    act(() => vi.advanceTimersByTime(1000));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
    act(() => result.current.dismissSuccess());
    expect(result.current.success).toBe('');
  });

  it('bloqueia envios simultâneos e limpa o feedback ao mudar filtros', async () => {
    vi.useFakeTimers();
    let finish;
    api.exportFile.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result, rerender } = renderHook(({ date }) => useReportExport(date, ''), {
      initialProps: { date: '2026-09-28' },
    });
    act(() => {
      result.current.download('csv');
      result.current.download('pdf');
    });
    expect(api.exportFile).toHaveBeenCalledOnce();
    expect(result.current.exporting).toBe('csv');
    await act(async () => finish(new Blob(['dados'])));
    expect(result.current.success).toBe('Download de CSV iniciado.');
    rerender({ date: '2026-09-27' });
    act(() => result.current.clearFeedback());
    expect(result.current.success).toBe('');
    act(() => vi.advanceTimersByTime(1000));
  });

  it('exibe erros, rejeita Blob vazio e permite tentar novamente', async () => {
    api.exportFile.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(new Blob([]));
    const { result } = renderHook(() => useReportExport('2026-09-28', ''));
    await act(async () => result.current.download('csv'));
    expect(result.current.error).toContain('offline');
    await act(async () => result.current.download('pdf'));
    expect(result.current.error).toContain('Arquivo vazio ou inválido');
    expect(result.current.success).toBe('');
    expect(result.current.exporting).toBe('');
  });

  it('cancela a exportação pendente ao sair da página', async () => {
    let signal;
    api.exportFile.mockImplementation((_format, _date, _username, requestSignal) => {
      signal = requestSignal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('cancelado')), { once: true });
      });
    });
    const { result, unmount } = renderHook(() => useReportExport('2026-09-28', ''));
    let pending;
    act(() => {
      pending = result.current.download('csv');
    });
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
    await pending;
    expect(downloadedFilename).toBeNull();
  });
});
