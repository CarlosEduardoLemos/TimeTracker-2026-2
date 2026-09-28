import { describe, expect, it } from 'vitest';
import { requestFailure } from './requestFailure';

describe('requestFailure', () => {
  it('não relata falha quando a resposta já foi validada', () => {
    expect(requestFailure({ status: 'fulfilled', value: [] }, true, 'Usuários')).toBeNull();
  });

  it('identifica uma resposta recebida fora do contrato', () => {
    expect(requestFailure({ status: 'fulfilled', value: {} }, false, 'Resumo')).toBe(
      'Resumo: resposta inválida da API',
    );
  });

  it('preserva o motivo de rejeição e o contexto da fonte', () => {
    expect(
      requestFailure(
        { status: 'rejected', reason: new Error('API respondeu 503') },
        false,
        'Atividade',
      ),
    ).toBe('Atividade: API respondeu 503');
  });

  it('apresenta cancelamento com a mensagem padronizada', () => {
    expect(
      requestFailure({ status: 'rejected', reason: { type: 'canceled' } }, false, 'Usuários'),
    ).toBe('Usuários: Requisição cancelada');
  });
});
