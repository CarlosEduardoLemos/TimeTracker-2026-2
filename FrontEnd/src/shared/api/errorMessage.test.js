import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './errorMessage';

describe('getApiErrorMessage', () => {
  it('prioriza o cancelamento mesmo quando o erro traz outra mensagem', () => {
    const error = Object.assign(new Error('Tempo esgotado'), { type: 'canceled' });
    expect(getApiErrorMessage(error)).toBe('Requisição cancelada');
  });

  it('preserva uma mensagem útil de Error', () => {
    expect(getApiErrorMessage(new Error('API respondeu 503'))).toBe('API respondeu 503');
  });

  it.each([null, undefined, 'Falha', { message: 'Erro' }, new Error('   ')])(
    'usa texto seguro quando não recebe um Error com mensagem útil: %s',
    (error) => {
      expect(getApiErrorMessage(error)).toBe('Falha desconhecida');
    },
  );
});
