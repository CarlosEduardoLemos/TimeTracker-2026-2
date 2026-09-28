import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { todayIso } from '../../../shared/lib/dashboard';
import { ReportFilters } from './ReportFilters';

const users = [{ username: 'ana', full_name: 'Ana Silva' }];
const props = {
  date: '2026-09-20',
  username: 'ana',
  users,
  loadingUsers: false,
  exporting: '',
  onDateChange: vi.fn(),
  onUsernameChange: vi.fn(),
};

it('altera os filtros e oferece atalhos para hoje e todos os usuários', () => {
  const onDateChange = vi.fn();
  const onUsernameChange = vi.fn();
  render(
    <ReportFilters {...props} onDateChange={onDateChange} onUsernameChange={onUsernameChange} />,
  );
  fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-09-19' } });
  fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
  fireEvent.click(screen.getByRole('button', { name: 'Limpar usuário' }));
  expect(onDateChange).toHaveBeenCalledWith('2026-09-19');
  expect(onDateChange).toHaveBeenCalledWith(todayIso());
  expect(onUsernameChange).toHaveBeenCalledWith('');
  expect(screen.getByText('Filtro ativo')).toBeInTheDocument();
});

it('preserva a seleção sem lista e bloqueia os controles durante exportação', () => {
  const { rerender } = render(<ReportFilters {...props} users={null} />);
  expect(screen.getByRole('option', { name: 'ana (selecionado)' })).toBeInTheDocument();
  expect(screen.getByLabelText('Usuário')).toBeDisabled();
  rerender(<ReportFilters {...props} exporting="csv" />);
  expect(screen.getByLabelText('Data')).toBeDisabled();
  expect(screen.getByLabelText('Usuário')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Hoje' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Limpar usuário' })).toBeDisabled();
});
