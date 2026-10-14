import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  createRoot: vi.fn(),
  render: vi.fn(),
  startDevMocks: vi.fn(),
  cleanupMockServiceWorkers: vi.fn(),
  devApi: {},
}));

vi.mock('react-dom/client', () => ({
  default: { createRoot: state.createRoot },
}));
vi.mock('./app/App', () => ({ default: () => null }));
vi.mock('./app/ErrorBoundary', () => ({ ErrorBoundary: ({ children }) => children }));
vi.mock('./dev-mocks/start.js', () => ({ startDevMocks: state.startDevMocks }));
vi.mock('./dev-mocks/client.js', () => ({ devApi: state.devApi }));
vi.mock('./dev-mocks/cleanup.js', () => ({
  cleanupMockServiceWorkers: state.cleanupMockServiceWorkers,
}));

function collectText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectText).join(' ');
  return collectText(node?.props?.children);
}

async function loadMain() {
  await import('./main.jsx');
  await vi.waitFor(() => expect(state.render).toHaveBeenCalled());
}

describe('application startup', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCKS', 'true');
    state.createRoot.mockReturnValue({ render: state.render });
    state.render.mockClear();
    state.startDevMocks.mockReset().mockResolvedValue(undefined);
    state.cleanupMockServiceWorkers.mockReset().mockResolvedValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.doUnmock('./dev-mocks/client.js');
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('shows an explicit failure and never renders the app when MSW rejects', async () => {
    state.startDevMocks.mockRejectedValueOnce(new Error('registration failed'));
    await loadMain();

    const fallback = state.render.mock.calls.at(-1)[0];
    expect(fallback.type).toBe('main');
    expect(fallback.props.role).toBe('alert');
    expect(collectText(fallback)).toContain('Os mocks foram solicitados');
    expect(collectText(fallback)).toContain('Dados reais não serão usados');
    expect(console.error).toHaveBeenCalled();
  });

  it('shows an explicit failure when a dynamic mock import rejects', async () => {
    vi.doMock('./dev-mocks/client.js', () => {
      throw new Error('client chunk unavailable');
    });
    await loadMain();

    const fallback = state.render.mock.calls.at(-1)[0];
    expect(fallback.type).toBe('main');
    expect(fallback.props.role).toBe('alert');
    expect(collectText(fallback)).toContain('Dados reais não serão usados');
    expect(state.startDevMocks).not.toHaveBeenCalled();
  });

  it('keeps the regular startup path when mocks are disabled', async () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    await loadMain();

    expect(state.startDevMocks).not.toHaveBeenCalled();
    expect(state.cleanupMockServiceWorkers).toHaveBeenCalledOnce();
    expect(state.render.mock.calls.at(-1)[0].type).not.toBe('main');
  });

  it('ignores VITE_USE_MOCKS outside development', async () => {
    vi.stubEnv('DEV', false);
    await loadMain();

    expect(state.startDevMocks).not.toHaveBeenCalled();
    expect(state.cleanupMockServiceWorkers).not.toHaveBeenCalled();
    expect(state.render.mock.calls.at(-1)[0].type).not.toBe('main');
  });
});
