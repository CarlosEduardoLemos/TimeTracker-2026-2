import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_ORIGIN = new URL(API_BASE_URL).origin;
const worker = setupWorker(...handlers);

function onUnhandledRequest(request, print) {
  if (new URL(request.url).origin === API_ORIGIN) {
    print.error();
    return;
  }
  print.warning();
}

export async function startDevMocks() {
  try {
    await worker.start({ onUnhandledRequest });
  } catch (cause) {
    throw new Error(
      'Could not start MSW. Check the mock Service Worker and VITE_USE_MOCKS configuration.',
      { cause },
    );
  }
}
