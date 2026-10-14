import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import './app/styles/index.css';

async function startApplication() {
  const mocksEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';
  let devApi = null;

  if (mocksEnabled) {
    const [{ startDevMocks }, { devApi: mockApi }] = await Promise.all([
      import('./dev-mocks/start.js'),
      import('./dev-mocks/client.js'),
    ]);
    await startDevMocks();
    devApi = mockApi;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App mocksEnabled={mocksEnabled} devApi={devApi} />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

void startApplication();
