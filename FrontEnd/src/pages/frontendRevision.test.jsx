import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { api } from '../services/api';
import { useDashboardData } from '../hooks/useDashboardData';

vi.mock('../services/api', () => ({
  api: {
    summary: vi.fn(),
    users: vi.fn(),
    realtime: vi.fn(),
    settings: vi.fn(),
    saveSettings: vi.fn(),
    exportFile: vi.fn(),
  },
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('estados de integração', () => {
  it('não mostra zero de usuários online quando o realtime falha', async () => {
    api.summary.mockResolvedValue({ date: '2026-09-25', users: [] });
    api.users.mockResolvedValue([{ username: 'ana', full_name: 'Ana' }]);
    api.realtime.mockRejectedValue(new Error('offline'));
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    await screen.findByRole('alert');
    expect(screen.getByText('Online').closest('article')).toHaveTextContent('—');
    expect(screen.getByText('Tempo registrado').closest('article')).toHaveTextContent('0h 00min');
  });

  it('ignora uma resposta antiga após mudar a data', async () => {
    let finishOld;
    api.summary.mockImplementation(date => date === '2026-09-24'
      ? new Promise(resolve => { finishOld = resolve; })
      : Promise.resolve({ date, users: [] }));
    api.users.mockResolvedValue([]);
    api.realtime.mockResolvedValue([]);
    const { result, rerender } = renderHook(({ date }) => useDashboardData(date, ''), {
      initialProps: { date: '2026-09-24' },
    });
    rerender({ date: '2026-09-25' });
    await waitFor(() => expect(result.current.data?.summary?.date).toBe('2026-09-25'));
    await act(async () => finishOld({ date: '2026-09-24', users: [] }));
    expect(result.current.data.summary.date).toBe('2026-09-25');
  });

  it('marca um resumo malformado como indisponível sem quebrar o painel', async () => {
    api.summary.mockResolvedValue({ date: '2026-09-25', users: [null] });
    api.users.mockResolvedValue([]);
    api.realtime.mockResolvedValue([]);
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    await screen.findByRole('alert');
    expect(screen.getByText('Tempo registrado').closest('article')).toHaveTextContent('—');
  });

  it('não permite salvar configurações que não foram lidas', async () => {
    api.settings.mockRejectedValue(new Error('API respondeu 503'));
    render(<SettingsPage />);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Salvar configurações' })).not.toBeInTheDocument();
    expect(api.saveSettings).not.toHaveBeenCalled();
  });

  it('exibe erro HTTP na exportação em vez de abrir uma aba vazia', async () => {
    api.users.mockResolvedValue([]);
    api.exportFile.mockRejectedValue(new Error('API respondeu 500'));
    render(<ReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('API respondeu 500'));
  });
});
