import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { LastActivityTable } from './LastActivityTable';

const people = [
  {
    username: 'ana',
    full_name: 'Ana',
    status: 'online',
    realtime: { process_name: 'Editor', seconds_since_last_activity: 5 },
  },
  { username: 'bia', status: 'offline', realtime: null },
];

it('apresenta estado e última leitura a partir dos dados reais', () => {
  render(<LastActivityTable people={people} available loading={false} />);
  expect(screen.getAllByText('Online')).toHaveLength(2);
  expect(screen.getAllByText('Sem leitura recente')).toHaveLength(2);
  expect(screen.getAllByText('Editor')).toHaveLength(2);
  expect(screen.getAllByText('5s atrás')).toHaveLength(2);
  expect(screen.getByRole('table')).toHaveTextContent('bia');
});

it('distingue carregamento, lista vazia e fonte indisponível', () => {
  const { rerender } = render(<LastActivityTable people={[]} loading available />);
  expect(screen.getByRole('status', { name: 'Carregando atividade…' })).toBeInTheDocument();
  rerender(<LastActivityTable people={[]} loading={false} available />);
  expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  rerender(<LastActivityTable people={[]} loading={false} available={false} />);
  expect(screen.getByText('Dados de atividade indisponíveis.')).toBeInTheDocument();
});
