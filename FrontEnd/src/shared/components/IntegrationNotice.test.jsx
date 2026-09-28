import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { IntegrationNotice } from './IntegrationNotice';

it('shows the default title and its content', () => {
  render(<IntegrationNotice>Dados disponíveis após integração.</IntegrationNotice>);
  expect(screen.getByText('Dependência de backend')).toBeInTheDocument();
  expect(screen.getByText('Dados disponíveis após integração.')).toBeInTheDocument();
});

it('accepts a custom title', () => {
  render(<IntegrationNotice title="Escopo parcial">Resumo diário disponível.</IntegrationNotice>);
  expect(screen.getByText('Escopo parcial')).toBeInTheDocument();
  expect(screen.getByText('Resumo diário disponível.')).toBeInTheDocument();
});
