import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../shared/api/api';
import { CollaboratorsPage } from './CollaboratorsPage';

vi.mock('../../../shared/api/api', () => ({ api: { users: vi.fn(), realtime: vi.fn() } }));

const users = [
  { username: 'ana', full_name: 'Ana Souza', department: 'Produto' },
  { username: 'bia', full_name: '', department: '' },
];
const realtime = [{ username: 'ana', status: 'online', process_name: 'Editor' }];

beforeEach(() => vi.resetAllMocks());

describe('CollaboratorsPage', () => {
  it('combina as duas fontes nos cards e na tabela', async () => {
    api.users.mockResolvedValue(users);
    api.realtime.mockResolvedValue(realtime);
    render(<CollaboratorsPage />);

    expect(api.users).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(api.realtime.mock.calls[0][0]).toBe(api.users.mock.calls[0][0]);
    expect(screen.getByRole('status', { name: 'Carregando colaboradores…' })).toBeInTheDocument();

    const table = await screen.findByRole('table', { name: 'Usuários cadastrados na API' });
    const anaRow = within(table).getByRole('rowheader', { name: 'ana' }).closest('tr');
    const biaRow = within(table).getByRole('rowheader', { name: 'bia' }).closest('tr');
    expect(anaRow).toHaveTextContent('Ana Souza');
    expect(anaRow).toHaveTextContent('Online');
    expect(anaRow).toHaveTextContent('Editor');
    expect(biaRow).toHaveTextContent('Sem leitura recente');

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText('Ana Souza')).toBeInTheDocument();
    expect(cards[0]).toHaveTextContent('Editor');
    expect(cards[1]).toHaveTextContent('Sem leitura recente');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mantém usuários visíveis quando a atividade falha, sem sugerir estado offline', async () => {
    api.users.mockResolvedValue(users);
    api.realtime.mockRejectedValue(new Error('rede indisponível'));
    render(<CollaboratorsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Atividade: rede indisponível');
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Indisponível')).toHaveLength(2);
    expect(within(table).queryByText('Sem leitura recente')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('informa lista indisponível quando usuários falham mesmo com atividade disponível', async () => {
    api.users.mockRejectedValue(new Error('API respondeu 503'));
    api.realtime.mockResolvedValue(realtime);
    render(<CollaboratorsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuários: API respondeu 503');
    expect(screen.getByText('Lista indisponível.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('reúne as duas falhas em um aviso com opção de retry', async () => {
    api.users.mockRejectedValue(new Error('usuários offline'));
    api.realtime.mockRejectedValue(new Error('atividade offline'));
    render(<CollaboratorsPage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Usuários: usuários offline; Atividade: atividade offline');
    expect(within(alert).getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    expect(screen.getByText('Lista indisponível.')).toBeInTheDocument();
  });

  it('distingue uma lista vazia válida de erro de leitura', async () => {
    api.users.mockResolvedValue([]);
    api.realtime.mockResolvedValue([]);
    render(<CollaboratorsPage />);

    expect(await screen.findByText('Nenhum usuário cadastrado.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('repete as duas consultas e recupera a lista após uma falha', async () => {
    api.users
      .mockRejectedValueOnce(new Error('temporariamente offline'))
      .mockResolvedValueOnce(users);
    api.realtime.mockResolvedValueOnce(realtime).mockResolvedValueOnce(realtime);
    render(<CollaboratorsPage />);

    fireEvent.click(
      within(await screen.findByRole('alert')).getByRole('button', { name: 'Tentar novamente' }),
    );
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('table')).toHaveTextContent('Ana Souza');
    expect(api.users).toHaveBeenCalledTimes(2);
    expect(api.realtime).toHaveBeenCalledTimes(2);
  });

  it('cancela ambas as leituras pendentes ao desmontar', () => {
    api.users.mockImplementation(() => new Promise(() => {}));
    api.realtime.mockImplementation(() => new Promise(() => {}));
    const { unmount } = render(<CollaboratorsPage />);

    const usersSignal = api.users.mock.calls[0][0];
    const realtimeSignal = api.realtime.mock.calls[0][0];
    expect(usersSignal).toBe(realtimeSignal);
    expect(usersSignal.aborted).toBe(false);
    unmount();
    expect(usersSignal.aborted).toBe(true);
  });

  it('ignora resposta antiga mesmo quando a fonte ignora o cancelamento', async () => {
    const pending = [];
    api.users.mockRejectedValueOnce(new Error('offline')).mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );
    api.realtime.mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);
    render(<CollaboratorsPage />);

    const retry = within(await screen.findByRole('alert')).getByRole('button', {
      name: 'Tentar novamente',
    });
    act(() => {
      retry.click();
      retry.click();
    });
    expect(pending).toHaveLength(2);
    expect(api.users.mock.calls[1][0].aborted).toBe(true);
    await act(async () => pending[1]([{ username: 'nova', full_name: 'Nova' }]));
    expect(screen.getByRole('table')).toHaveTextContent('Nova');
    await act(async () => pending[0]([{ username: 'antiga', full_name: 'Antiga' }]));
    expect(screen.getByRole('table')).toHaveTextContent('Nova');
    expect(screen.getByRole('table')).not.toHaveTextContent('Antiga');
  });
});
