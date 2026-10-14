import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import './app/styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const mocksEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';

async function startApplication() {
  let devApi = null;

  if (mocksEnabled) {
    const [{ startDevMocks }, { devApi: mockApi }] = await Promise.all([
      import('./dev-mocks/start.js'),
      import('./dev-mocks/client.js'),
    ]);
    await startDevMocks();
    devApi = mockApi;
  } else if (import.meta.env.DEV) {
    try {
      const { cleanupMockServiceWorkers } = await import('./dev-mocks/cleanup.js');
      if (!(await cleanupMockServiceWorkers())) return;
    } catch (error) {
      console.warn('[TimeTracker] Could not clean up an old mock Service Worker.', error);
    }
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App mocksEnabled={mocksEnabled} devApi={devApi} />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

function renderStartupError(error) {
  if (import.meta.env.DEV) console.error('[TimeTracker] Application startup failed.', error);

  root.render(
    <main className="mx-auto max-w-2xl p-8" role="alert">
      <h1 className="text-2xl font-bold">Falha ao iniciar a aplicação</h1>
      <p className="mt-3">
        {mocksEnabled
          ? 'Os mocks foram solicitados, mas não iniciaram. Dados reais não serão usados.'
          : 'Não foi possível iniciar o TimeTracker. Atualize a página.'}
      </p>
      {mocksEnabled && (
        <p className="mt-2">Verifique o Service Worker e a configuração VITE_USE_MOCKS.</p>
      )}
      <button
        className="primary-button mt-5"
        type="button"
        onClick={() => void startApplication().catch(renderStartupError)}
      >
        Tentar novamente
      </button>
    </main>,
  );
}

void startApplication().catch(renderStartupError);
