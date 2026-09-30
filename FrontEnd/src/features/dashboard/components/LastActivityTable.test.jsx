import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { formatLastRead, LastActivityTable } from './LastActivityTable';

const people = [
  {
    username: 'ana',
    full_name: 'Ana',
    status: 'online',
    realtime: { process_name: 'Editor', seconds_since_last_activity: 5 },
  },
  { username: 'bia', status: 'no-data', realtime: null },
];

it('apresenta estado e última leitura a partir dos dados reais', () => {
  render(<LastActivityTable people={people} available loading={false} />);
  expect(screen.getAllByText('Online')).toHaveLength(2);
  expect(screen.getAllByText('Sem dados')).toHaveLength(2);
  expect(screen.getAllByText('Editor')).toHaveLength(2);
  expect(screen.getAllByText('5s atrás')).toHaveLength(2);
  expect(screen.getByRole('table')).toHaveTextContent('bia');
});

it('formata a última leitura em segundos, minutos e horas', () => {
  expect(formatLastRead(32)).toBe('32s atrás');
  expect(formatLastRead(300)).toBe('5min atrás');
  expect(formatLastRead(4680)).toBe('1h 18min atrás');
  expect(formatLastRead(25200)).toBe('7h atrás');
  expect(formatLastRead(-1)).toBe('—');
});

it('distingue carregamento, lista vazia e fonte indisponível', () => {
  const { rerender } = render(<LastActivityTable people={[]} loading available />);
  expect(screen.getByRole('status', { name: 'Carregando atividade…' })).toBeInTheDocument();
  rerender(<LastActivityTable people={[]} loading={false} available />);
  expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  rerender(<LastActivityTable people={[]} loading={false} available={false} />);
  expect(screen.getByText('Dados de atividade indisponíveis.')).toBeInTheDocument();
});
