import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DashboardStatusNotice } from './DashboardStatusNotice';

it('explica que leitura recente não confirma conexão do Agente nem equipe vinculada', () => {
  render(<DashboardStatusNotice />);
  expect(screen.getByText(/lista da API é global/)).toBeInTheDocument();
  expect(screen.getByText(/backend ainda não informa a conexão do Agente/)).toBeInTheDocument();
});
