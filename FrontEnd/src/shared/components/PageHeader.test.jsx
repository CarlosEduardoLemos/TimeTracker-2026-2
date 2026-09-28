import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

it('shows title, description and supplied actions', () => {
  render(
    <PageHeader
      title="Relatórios"
      description="Resumo diário"
      actions={<button type="button">Atualizar</button>}
    />,
  );

  const header = screen.getByRole('banner');
  expect(within(header).getByRole('heading', { level: 1, name: 'Relatórios' })).toBeInTheDocument();
  expect(within(header).getByText('Resumo diário')).toBeInTheDocument();
  expect(within(header).getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
});
