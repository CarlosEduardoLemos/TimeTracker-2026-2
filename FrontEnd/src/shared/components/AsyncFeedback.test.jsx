import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EmptyState, ErrorNotice, LoadingSkeleton, SuccessToast } from './AsyncFeedback';

afterEach(() => vi.useRealTimers());

it('anuncia o erro e executa a nova tentativa', () => {
  const retry = vi.fn();
  render(<ErrorNotice onRetry={retry}>Falha da API</ErrorNotice>);
  expect(screen.getByRole('alert')).toHaveTextContent('Falha da API');
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(retry).toHaveBeenCalledOnce();
});

it('mostra estado vazio e a quantidade pedida de linhas decorativas', () => {
  render(
    <>
      <EmptyState>Sem registros</EmptyState>
      <LoadingSkeleton lines={4} label="Carregando linhas…" />
    </>,
  );
  expect(screen.getByText('Sem registros')).toBeInTheDocument();
  const status = screen.getByRole('status', { name: 'Carregando linhas…' });
  expect(within(status).getByText('Carregando linhas…')).toBeInTheDocument();
  expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
});

it('permite fechar o toast e o dispensa automaticamente após cinco segundos', () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const { rerender } = render(<SuccessToast onDismiss={dismiss}>Download iniciado.</SuccessToast>);
  expect(screen.getByRole('status')).toHaveTextContent('Download iniciado.');
  fireEvent.click(screen.getByRole('button', { name: 'Dispensar confirmação' }));
  expect(dismiss).toHaveBeenCalledOnce();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(
    <SuccessToast key="novo" onDismiss={dismiss}>
      Download iniciado.
    </SuccessToast>,
  );
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(dismiss).toHaveBeenCalledTimes(2);
});
