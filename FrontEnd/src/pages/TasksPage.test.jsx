import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { TasksPage } from './TasksPage';

it('explains the task dependency without offering unsaved input', () => {
  render(<TasksPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
  expect(screen.getByText(/backend ainda não oferece consulta ou persistência de tasks/)).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Salvar task/ })).not.toBeInTheDocument();
});
