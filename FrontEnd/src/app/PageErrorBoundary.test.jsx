import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PageErrorBoundary } from './PageErrorBoundary';

it('isola uma falha e permite nova tentativa na mesma página', () => {
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
  const handleExpectedError = (event) => {
    if (event.error?.message === 'render') event.preventDefault();
  };
  window.addEventListener('error', handleExpectedError);
  let fail = true;
  function Page() {
    if (fail) throw new Error('render');
    return <h1>Conteúdo recuperado</h1>;
  }
  try {
    render(
      <PageErrorBoundary>
        <Page />
      </PageErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível exibir esta página');
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('heading', { name: 'Conteúdo recuperado' })).toBeInTheDocument();
  } finally {
    window.removeEventListener('error', handleExpectedError);
    errorLog.mockRestore();
  }
});
