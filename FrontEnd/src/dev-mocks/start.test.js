import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn(async () => undefined);
vi.mock('msw/browser', () => ({ setupWorker: () => ({ start }) }));

const { startDevMocks } = await import('./start');

describe('inicialização do MSW no navegador', () => {
  beforeEach(() => start.mockClear());

  it('aguarda a ativação do worker e ignora rotas existentes não simuladas', async () => {
    await expect(startDevMocks()).resolves.toBeUndefined();
    expect(start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
  });
});
