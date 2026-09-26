import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { AuthPage } from './AuthPage';

it.each([
  ['login', 'Entrar no Dashboard'],
  ['cadastro', 'Criar conta'],
])('explains unavailable %s without collecting credentials', (mode, heading) => {
  render(<AuthPage mode={mode} />);
  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  expect(screen.getByText(/Cadastro e login dependem de endpoints/)).toBeInTheDocument();
  expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ir para o painel' })).toHaveAttribute(
    'href',
    '#/painel',
  );
});
