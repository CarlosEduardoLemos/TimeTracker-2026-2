import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export async function startDevMocks() {
  await worker.start({ onUnhandledRequest: 'bypass' });
}
