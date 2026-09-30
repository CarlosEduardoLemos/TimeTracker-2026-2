import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DashboardStatusNotice } from './DashboardStatusNotice';

it('explica que leitura recente não confirma desconexão do Agent nem equipe vinculada', () => {
  render(<DashboardStatusNotice />);
  expect(screen.getByText(/lista da API é global/)).toBeInTheDocument();
  expect(screen.getByText(/Offline não confirma que o Agent perdeu conexão/)).toBeInTheDocument();
});
