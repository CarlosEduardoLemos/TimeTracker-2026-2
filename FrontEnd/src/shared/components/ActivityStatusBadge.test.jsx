import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ActivityStatusBadge } from './ActivityStatusBadge';

it('formata o estado sem afirmar conexão do Agente', () => {
  const { rerender } = render(<ActivityStatusBadge person={{ status: 'online' }} />);
  expect(screen.getByText('Online')).toBeInTheDocument();
  expect(screen.queryByText(/Agente conectado/i)).not.toBeInTheDocument();
  rerender(<ActivityStatusBadge person={{ status: 'offline' }} />);
  expect(screen.getByText('Sem leitura recente')).toBeInTheDocument();
  rerender(<ActivityStatusBadge person={{ status: 'online' }} available={false} />);
  expect(screen.getByText('Indisponível')).toBeInTheDocument();
});
