import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MocksNotice } from './MocksNotice';

describe('aviso de mocks', () => {
  it('permanece visível enquanto o modo de mocks está ativo', () => {
    render(<MocksNotice enabled />);
    expect(screen.getByRole('note', { name: 'Aviso de dados simulados' })).toHaveTextContent(
      'DADOS SIMULADOS',
    );
    expect(screen.getByRole('note')).toHaveTextContent(/não acessam nem gravam dados reais/i);
  });

  it('não aparece fora do modo de mocks', () => {
    render(<MocksNotice enabled={false} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
