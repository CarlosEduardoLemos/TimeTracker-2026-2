const MOCK_WORKER_PATH = '/mockServiceWorker.js';
const RELOAD_MARKER = 'timetracker-mock-worker-cleanup-reload';

function isMockWorker(scriptURL, workerURL) {
  return scriptURL === workerURL;
}

export async function cleanupMockServiceWorkers() {
  if (!('serviceWorker' in navigator)) return true;

  const workerURL = new URL(MOCK_WORKER_PATH, location.origin).href;
  const registrations = await navigator.serviceWorker.getRegistrations();
  const mockRegistrations = registrations.filter((registration) =>
    [registration.active, registration.waiting, registration.installing].some(
      (worker) => worker && isMockWorker(worker.scriptURL, workerURL),
    ),
  );
  const controller = navigator.serviceWorker.controller;
  const controlledByMocks = controller && isMockWorker(controller.scriptURL, workerURL);

  await Promise.all(mockRegistrations.map((registration) => registration.unregister()));

  if (!controlledByMocks) {
    sessionStorage.removeItem(RELOAD_MARKER);
    return true;
  }

  if (sessionStorage.getItem(RELOAD_MARKER) === '1') {
    throw new Error('The unregistered mock Service Worker still controls this page.');
  }

  sessionStorage.setItem(RELOAD_MARKER, '1');
  controller.postMessage('CLIENT_CLOSED');
  location.reload();
  return false;
}
