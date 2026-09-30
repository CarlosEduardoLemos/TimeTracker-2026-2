import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CategorySummary } from './CategorySummary';

it('mostra duração e percentual do tempo registrado sem classificar produtividade', () => {
  render(
    <CategorySummary
      categories={[{ name: 'Trabalho', seconds: 1800 }]}
      totalSeconds={3600}
      available
    />,
  );
  expect(screen.getByText('0h 30min · 50.0%')).toBeInTheDocument();
  expect(screen.getByTitle('Trabalho: 0h 30min')).toBeInTheDocument();
  expect(screen.queryByText(/produtivo/i)).not.toBeInTheDocument();
});
