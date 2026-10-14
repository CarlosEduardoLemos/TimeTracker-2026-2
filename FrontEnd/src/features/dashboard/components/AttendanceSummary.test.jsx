import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AttendanceSummary } from './AttendanceSummary';

const data = {
  date: currentBusinessDate(),
  timezone: 'America/Sao_Paulo',
  as_of: new Date().toISOString(),
  users: [
    {
      username: 'ana',
      first_activity_at: `${currentBusinessDate()}T11:15:00Z`,
      last_activity_at: `${currentBusinessDate()}T20:42:00Z`,
    },
    { username: 'bruno', first_activity_at: null, last_activity_at: null },
  ],
};

function currentBusinessDate() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

describe('AttendanceSummary', () => {
  it('mantém a mensagem de indisponibilidade sem consultar a API', () => {
    render(<AttendanceSummary date="2026-10-13" username="" />);
    expect(screen.getByText(/Indisponível pelo backend/)).toBeInTheDocument();
  });

  it('distingue registro de hoje de pessoa sem registro', async () => {
    const devApi = { attendance: vi.fn().mockResolvedValue(data) };
    render(<AttendanceSummary devApi={devApi} date={data.date} username="" />);
    await waitFor(() => expect(screen.getByText('ana')).toBeInTheDocument());
    expect(screen.getByText('Dia em andamento')).toBeInTheDocument();
    expect(screen.getByText('Sem registro')).toBeInTheDocument();
    expect(screen.getByText('08:15')).toBeInTheDocument();
    expect(screen.getByText('17:42')).toBeInTheDocument();
  });

  it('mantém o erro da fonte visível e permite tentar novamente', async () => {
    const devApi = {
      attendance: vi
        .fn()
        .mockRejectedValueOnce(new Error('Fonte indisponível'))
        .mockResolvedValue(data),
    };
    render(<AttendanceSummary devApi={devApi} date={data.date} username="" />);
    const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(screen.getByRole('alert')).toHaveTextContent('Fonte indisponível');
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByText('ana')).toBeInTheDocument());
    expect(devApi.attendance).toHaveBeenCalledTimes(2);
  });

  it('anuncia carregamento e resposta vazia', async () => {
    let finish;
    const devApi = {
      attendance: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    };
    render(<AttendanceSummary devApi={devApi} date={data.date} username="" />);
    expect(screen.getByRole('status', { name: 'Carregando jornada diária…' })).toBeInTheDocument();
    await act(async () => finish({ ...data, users: [] }));
    expect(
      await screen.findByText('Nenhum colaborador encontrado para os filtros selecionados.'),
    ).toBeInTheDocument();
  });
});
