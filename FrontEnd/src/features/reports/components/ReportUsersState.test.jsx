import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ReportUsersState } from './ReportUsersState';

it('distingue carregamento, lista vazia, falha recuperável e lista disponível', () => {
  const retry = vi.fn();
  const { rerender } = render(<ReportUsersState loading users={null} error="" onRetry={retry} />);
  expect(screen.getByRole('status', { name: 'Carregando usuários…' })).toBeInTheDocument();
  rerender(<ReportUsersState loading={false} users={[]} error="" onRetry={retry} />);
  expect(screen.getByText('Nenhum usuário cadastrado.')).toBeInTheDocument();
  rerender(<ReportUsersState loading={false} users={null} error="offline" onRetry={retry} />);
  expect(screen.getByRole('alert')).toHaveTextContent('offline');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'exportação com os filtros atuais continua disponível',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(retry).toHaveBeenCalledOnce();
  rerender(
    <ReportUsersState loading={false} users={[{ username: 'ana' }]} error="" onRetry={retry} />,
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
