import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DashboardMetrics } from './DashboardMetrics';

const props = {
  loading: false,
  available: { users: true, realtime: true, summary: true },
  filtered: [{ status: 'online' }, { status: 'ausente' }, { status: 'offline' }],
  summary: { users: [{ total_seconds: 3660 }] },
  users: [{ username: 'ana' }, { username: 'bia' }],
  username: '',
};

it('mostra contagens e tempo apenas das fontes disponíveis', () => {
  const { rerender } = render(<DashboardMetrics {...props} />);
  expect(screen.getByText('Online').closest('article')).toHaveTextContent('1');
  expect(screen.getByText('Sem leitura recente').closest('article')).toHaveTextContent('1');
  expect(screen.getByText('Sem dados').closest('article')).toHaveTextContent('0');
  expect(screen.getByText('Tempo registrado').closest('article')).toHaveTextContent('1h 01min');
  expect(screen.getByText('Usuários cadastrados').closest('article')).toHaveTextContent('2');
  rerender(<DashboardMetrics {...props} username="ana" />);
  expect(screen.getByText('Usuários cadastrados').closest('article')).toHaveTextContent('1');
  rerender(
    <DashboardMetrics {...props} available={{ users: true, realtime: false, summary: false }} />,
  );
  expect(screen.getByText('Online').closest('article')).toHaveTextContent('—');
  expect(screen.getByText('Tempo registrado').closest('article')).toHaveTextContent('—');
  expect(screen.getByText('Usuários cadastrados').closest('article')).toHaveTextContent('2');
});

it('anuncia skeletons antes da primeira resposta', () => {
  render(<DashboardMetrics {...props} loading />);
  expect(screen.getAllByRole('status')).toHaveLength(6);
  expect(screen.getByRole('status', { name: 'Carregando online' })).toBeInTheDocument();
});
