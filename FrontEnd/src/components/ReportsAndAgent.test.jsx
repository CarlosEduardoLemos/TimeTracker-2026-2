import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportsAndAgent } from './ReportsAndAgent';

describe('ReportsAndAgent', () => {
  it('keeps incomplete exports disabled and preserves auto-refresh control', () => {
    const setAutoRefresh = vi.fn();

    render(<ReportsAndAgent autoRefresh={true} setAutoRefresh={setAutoRefresh} />);

    expect(screen.getByRole('heading', { name: 'Exportar relatório' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Atualização do painel' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /CSV/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /PDF/i })).toBeDisabled();

    const checkbox = screen.getByRole('checkbox', { name: 'Atualização automática' });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(setAutoRefresh).toHaveBeenCalledWith(false);
  });
});
