import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanupMockServiceWorkers } from './cleanup';

let serviceWorkerDescriptor;

afterEach(() => {
  if (serviceWorkerDescriptor) {
    Object.defineProperty(navigator, 'serviceWorker', serviceWorkerDescriptor);
    serviceWorkerDescriptor = undefined;
  } else {
    delete navigator.serviceWorker;
  }
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubServiceWorker(serviceWorker) {
  serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker,
  });
}

describe('cleanup of stale mock Service Workers', () => {
  it('unregisters only this app mock worker', async () => {
    const mockRegistration = {
      active: { scriptURL: `${location.origin}/mockServiceWorker.js` },
      unregister: vi.fn().mockResolvedValue(true),
    };
    const otherRegistration = {
      active: { scriptURL: `${location.origin}/service-worker.js` },
      unregister: vi.fn().mockResolvedValue(true),
    };
    stubServiceWorker({
      controller: null,
      getRegistrations: vi.fn().mockResolvedValue([mockRegistration, otherRegistration]),
    });

    await expect(cleanupMockServiceWorkers()).resolves.toBe(true);
    expect(mockRegistration.unregister).toHaveBeenCalledOnce();
    expect(otherRegistration.unregister).not.toHaveBeenCalled();
  });

  it('reloads once when the old mock worker still controls this page', async () => {
    const origin = location.origin;
    const reload = vi.fn();
    const controller = {
      scriptURL: `${origin}/mockServiceWorker.js`,
      postMessage: vi.fn(),
    };
    const registration = {
      active: controller,
      unregister: vi.fn().mockResolvedValue(true),
    };
    vi.stubGlobal('location', { origin, reload });
    stubServiceWorker({
      controller,
      getRegistrations: vi.fn().mockResolvedValue([registration]),
    });

    await expect(cleanupMockServiceWorkers()).resolves.toBe(false);
    expect(registration.unregister).toHaveBeenCalledOnce();
    expect(controller.postMessage).toHaveBeenCalledWith('CLIENT_CLOSED');
    expect(reload).toHaveBeenCalledOnce();
    await expect(cleanupMockServiceWorkers()).rejects.toThrow('still controls this page');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('keeps startup working when Service Workers are unsupported', async () => {
    stubServiceWorker(undefined);
    delete navigator.serviceWorker;

    await expect(cleanupMockServiceWorkers()).resolves.toBe(true);
  });
});
