import { expect, it } from 'vitest';
import { exportFilename } from './exportFilename';

it('inclui o filtro com nome seguro sem alterar a extensão', () => {
  expect(exportFilename('csv', '2026-09-28')).toBe('resumo_2026-09-28.csv');
  expect(exportFilename('pdf', '2026-09-28', 'João Silva/../')).toBe(
    'resumo_joao_silva_2026-09-28.pdf',
  );
});
