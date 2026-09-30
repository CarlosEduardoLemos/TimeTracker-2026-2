import { expect, it } from 'vitest';
import { formatActivityStatus } from './activityStatus';

it('formata apenas o estado de leitura disponível na API', () => {
  expect(formatActivityStatus({ status: 'online' })).toBe('Online');
  expect(formatActivityStatus({ status: 'ausente' })).toBe('Ausente');
  expect(formatActivityStatus({ status: 'offline' })).toBe('Offline (API)');
  expect(formatActivityStatus({ status: 'no-data' })).toBe('Sem dados');
  expect(formatActivityStatus({ status: 'online' }, false)).toBe('Indisponível');
  expect(formatActivityStatus({ status: 'desconhecido' })).toBe('Indisponível');
});
