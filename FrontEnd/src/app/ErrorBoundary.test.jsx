import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function BrokenComponent() {
  throw new Error('falha de teste');
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it('shows a safe fallback when a descendant fails during render', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // React 18 também despacha a falha esperada como evento de erro no jsdom.
  const handleExpectedError = (event) => {
    if (event.error?.message === 'falha de teste') event.preventDefault();
  };
  window.addEventListener('error', handleExpectedError);
  try {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );
  } finally {
    window.removeEventListener('error', handleExpectedError);
  }

  expect(
    screen.getByRole('heading', { name: 'Não foi possível exibir esta tela' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Recarregar aplicação' })).toBeInTheDocument();
  expect(screen.queryByText('falha de teste')).not.toBeInTheDocument();
});

it('does not log exception payloads in production', () => {
  vi.stubEnv('DEV', false);
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const boundary = new ErrorBoundary({});
  boundary.componentDidCatch(new Error('conteúdo privado'), {
    componentStack: 'detalhes internos',
  });
  expect(log).not.toHaveBeenCalled();
});
