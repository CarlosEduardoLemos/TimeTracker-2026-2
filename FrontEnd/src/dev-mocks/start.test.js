import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn(async () => undefined);
vi.mock('msw/browser', () => ({ setupWorker: () => ({ start }) }));

const { startDevMocks } = await import('./start');

describe('inicialização do MSW no navegador', () => {
  beforeEach(() => start.mockClear());

  it('waits for the worker and blocks unhandled requests to the configured API origin', async () => {
    await expect(startDevMocks()).resolves.toBeUndefined();
    const { onUnhandledRequest } = start.mock.calls[0][0];
    const print = { error: vi.fn(), warning: vi.fn() };

    onUnhandledRequest(new Request('http://localhost:8000/unsupported'), print);
    expect(print.error).toHaveBeenCalledOnce();

    onUnhandledRequest(new Request('http://other.example/resource'), print);
    expect(print.warning).toHaveBeenCalledOnce();
  });

  it('preserves the original error when the worker fails to start', async () => {
    const cause = new Error('service worker registration failed');
    start.mockRejectedValueOnce(cause);
    await expect(startDevMocks()).rejects.toMatchObject({
      cause,
      message: expect.stringContaining('MSW'),
    });
  });
});
