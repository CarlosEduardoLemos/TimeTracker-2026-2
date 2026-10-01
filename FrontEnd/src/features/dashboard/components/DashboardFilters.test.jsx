import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { todayIso } from '../../../shared/lib/date';
import { DashboardFilters } from './DashboardFilters';

const base = {
  date: '2026-09-20',
  username: 'ana',
  users: [{ username: 'ana', full_name: 'Ana' }],
  usersAvailable: true,
  updatedAt: null,
  refreshing: false,
};

it('altera data e usuário, limpa a seleção e volta para hoje', () => {
  const onDateChange = vi.fn();
  const onUsernameChange = vi.fn();
  render(
    <DashboardFilters {...base} onDateChange={onDateChange} onUsernameChange={onUsernameChange} />,
  );
  fireEvent.change(screen.getByLabelText('Data do resumo'), { target: { value: '2026-09-19' } });
  fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Limpar usuário' }));
  fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
  expect(onDateChange).toHaveBeenCalledWith('2026-09-19');
  expect(onDateChange).toHaveBeenCalledWith(todayIso());
  expect(onUsernameChange).toHaveBeenCalledWith('');
  expect(screen.getByText('Filtro ativo')).toBeInTheDocument();
});

it('mantém usuário selecionado visível quando a lista fica indisponível', () => {
  render(
    <DashboardFilters
      {...base}
      users={[]}
      usersAvailable={false}
      onDateChange={vi.fn()}
      onUsernameChange={vi.fn()}
    />,
  );
  expect(screen.getByLabelText('Usuário')).toBeDisabled();
  expect(screen.getByRole('option', { name: 'ana (selecionado)' })).toBeInTheDocument();
});
