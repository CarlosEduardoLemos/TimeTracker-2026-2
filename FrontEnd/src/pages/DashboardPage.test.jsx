import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { useDashboardData } from '../hooks/useDashboardData';

vi.mock('../hooks/useDashboardData', () => ({ useDashboardData: vi.fn() }));

const fullData = {
  summary: {
    date: '2026-09-25',
    users: [{ username: 'ana', total_seconds: 3600, by_category: [] }],
  },
  users: [{ username: 'ana', full_name: 'Ana' }],
  realtime: [
    { username: 'ana', status: 'online', seconds_since_last_activity: 5, process_name: 'Editor' },
  ],
  availability: { summary: true, users: true, realtime: true },
};

beforeEach(() => vi.clearAllMocks());

describe('DashboardPage', () => {
  it('mostra carregamento antes da primeira resposta', () => {
    useDashboardData.mockReturnValue({
      data: null,
      loading: true,
      refreshing: false,
      refresh: vi.fn(),
    });
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    expect(screen.getByText('Online').closest('article')).toHaveTextContent('…');
  });

  it('mostra apenas totais e estados fornecidos pela API', () => {
    useDashboardData.mockReturnValue({
      data: fullData,
      loading: false,
      refreshing: false,
      refresh: vi.fn(),
    });
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    expect(screen.getByText('Tempo registrado').closest('article')).toHaveTextContent('1h 00min');
    expect(screen.getByText('Online').closest('article')).toHaveTextContent('1');
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('marca realtime indisponível sem exibir zero', () => {
    useDashboardData.mockReturnValue({
      data: {
        ...fullData,
        realtime: [],
        availability: { ...fullData.availability, realtime: false },
      },
      loading: false,
      refreshing: false,
      error: 'Alguns dados estão temporariamente indisponíveis.',
      refresh: vi.fn(),
    });
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    expect(screen.getByText('Online').closest('article')).toHaveTextContent('—');
    expect(screen.getByRole('alert')).toHaveTextContent('temporariamente indisponíveis');
  });

  it('aplica o filtro de usuário à consulta', () => {
    useDashboardData.mockReturnValue({
      data: fullData,
      loading: false,
      refreshing: false,
      refresh: vi.fn(),
    });
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'ana' } });
    expect(useDashboardData.mock.calls.at(-1)[1]).toBe('ana');
  });

  it('mantém a contagem de usuários cadastrados quando realtime falha', () => {
    useDashboardData.mockReturnValue({
      data: {
        ...fullData,
        realtime: [],
        availability: { ...fullData.availability, realtime: false },
      },
      loading: false,
      refreshing: false,
      refresh: vi.fn(),
    });
    render(<DashboardPage dark={false} toggleTheme={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'ana' } });
    expect(screen.getByText('Usuários cadastrados').closest('article')).toHaveTextContent('1');
    expect(screen.getByText('Online').closest('article')).toHaveTextContent('—');
  });
});
