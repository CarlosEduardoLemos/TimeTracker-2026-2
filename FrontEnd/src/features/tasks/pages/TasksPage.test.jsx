import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TasksPage } from './TasksPage';

const ana = {
  id: 'd94a4d6c-8542-4c3e-889b-89db302ef4cc',
  username: 'ana',
  full_name: 'Ana Souza',
};
const bruno = {
  id: '52ba0ef0-0c95-4cbf-b5a8-897b0b93ef27',
  username: 'bruno',
  full_name: 'Bruno Lima',
};
const task = {
  id: '6e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  title: 'Relatório trimestral',
  description: 'Revisar o relatório do trimestre',
  collaborators: [ana],
  created_at: '2026-10-13T14:20:00Z',
  updated_at: '2026-10-13T14:20:00Z',
};
const secondTask = {
  ...task,
  id: '7e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  title: 'Criar orçamento',
  description: 'Preparar orçamento anual',
  collaborators: [bruno],
  created_at: '2026-10-14T14:20:00Z',
};

afterEach(() => vi.restoreAllMocks());

function mockService(overrides = {}) {
  return {
    tasks: vi.fn().mockResolvedValue([]),
    collaborators: vi.fn().mockResolvedValue([ana, bruno]),
    createTask: vi.fn().mockResolvedValue(task),
    updateTask: vi.fn().mockResolvedValue({ ...task, title: 'Relatório final' }),
    deleteTask: vi.fn().mockResolvedValue(task),
    ...overrides,
  };
}

describe('TasksPage', () => {
  it('mostra uma prévia desativada sem API e não faz chamadas', () => {
    render(<TasksPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByText('Gestão de Tasks indisponível')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeDisabled();
    expect(screen.getByLabelText('Descrição')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Criar Task' })).toBeDisabled();
    expect(screen.getByText(/lista será carregada quando o Backend/i)).toBeInTheDocument();
  });

  it('valida os campos e cria uma Task com seleção múltipla nos mocks', async () => {
    const service = mockService();
    const user = userEvent.setup();
    render(<TasksPage devApi={service} />);
    expect(await screen.findByText(/Nenhuma Task foi criada/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar Task' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe o título');
    expect(service.createTask).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Título'), '  Revisão do produto  ');
    await user.type(screen.getByLabelText('Descrição'), '  Conferir as entregas da sprint  ');
    await user.click(screen.getByLabelText(/Ana Souza/));
    await user.click(screen.getByLabelText(/Bruno Lima/));
    await user.click(screen.getByRole('button', { name: 'Criar Task' }));

    expect(await screen.findByText('Task criada nos dados simulados.')).toBeInTheDocument();
    expect(service.createTask).toHaveBeenCalledWith(
      {
        title: 'Revisão do produto',
        description: 'Conferir as entregas da sprint',
        collaborator_ids: [ana.id, bruno.id],
      },
      expect.any(AbortSignal),
    );
  });

  it('mostra carregamento e impede envio sem colaborador', async () => {
    let finish;
    const service = mockService({
      tasks: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
    });
    render(<TasksPage devApi={service} />);
    expect(screen.getByRole('status', { name: 'Carregando Tasks…' })).toBeInTheDocument();
    await waitFor(() => expect(finish).toBeDefined());
    await act(async () => finish([]));

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Task válida' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição válida' } });
    fireEvent.submit(
      screen.getByRole('heading', { name: 'Criar Task' }).closest('section').querySelector('form'),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione pelo menos um colaborador');
    expect(service.createTask).not.toHaveBeenCalled();
  });

  it('pesquisa por título/descrição, ordena, seleciona detalhes e edita atribuições', async () => {
    const user = userEvent.setup();
    const service = mockService({
      tasks: vi.fn().mockResolvedValue([task, secondTask]),
      updateTask: vi.fn().mockResolvedValue({
        ...task,
        title: 'Relatório final',
        collaborators: [ana, bruno],
      }),
    });
    render(<TasksPage devApi={service} />);
    expect(await screen.findByText('2 resultados')).toBeInTheDocument();

    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar por título ou descrição' }),
      'ORÇAMENTO',
    );
    expect(
      screen.getByRole('button', { name: 'Ver detalhes da Task: Criar orçamento' }),
    ).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox', { name: 'Pesquisar por título ou descrição' }));

    await user.selectOptions(screen.getByLabelText('Ordenar Tasks'), 'title-asc');
    const list = screen.getByRole('list', { name: 'Tasks da equipe' });
    expect(
      within(list)
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual([
      'Ver detalhes da Task: Criar orçamento',
      'Editar Task: Criar orçamento',
      'Excluir Task: Criar orçamento',
      'Ver detalhes da Task: Relatório trimestral',
      'Editar Task: Relatório trimestral',
      'Excluir Task: Relatório trimestral',
    ]);

    await user.click(
      screen.getByRole('button', { name: 'Ver detalhes da Task: Relatório trimestral' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Task selecionada para consulta' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Colaboradores: Ana Souza')).toBeInTheDocument();
    expect(screen.getByText(/Não inicia nem associa monitoramento/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Editar Task: Relatório trimestral' }));
    expect(screen.getByRole('heading', { name: 'Editar Task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Relatório trimestral');
    await user.click(screen.getByLabelText(/Bruno Lima/));
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText('Task atualizada nos dados simulados.')).toBeInTheDocument();
    expect(service.updateTask).toHaveBeenCalledWith(
      task.id,
      {
        title: task.title,
        description: task.description,
        collaborator_ids: [ana.id, bruno.id],
      },
      expect.any(AbortSignal),
    );
  });

  it('confirma exclusão antes de chamar o serviço e atualiza a lista', async () => {
    const user = userEvent.setup();
    const service = mockService({ tasks: vi.fn().mockResolvedValue([task]) });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TasksPage devApi={service} />);
    await screen.findByRole('button', { name: 'Excluir Task: Relatório trimestral' });

    await user.click(screen.getByRole('button', { name: 'Excluir Task: Relatório trimestral' }));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Relatório trimestral'));
    expect(service.deleteTask).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Excluir Task: Relatório trimestral' }));
    expect(await screen.findByText('Task excluída dos dados simulados.')).toBeInTheDocument();
    expect(service.deleteTask).toHaveBeenCalledWith(task.id, expect.any(AbortSignal));
    expect(await screen.findByText(/Nenhuma Task foi criada/)).toBeInTheDocument();
  });

  it('mostra erro ao falhar a lista e oferece retry', async () => {
    const service = mockService({
      tasks: vi
        .fn()
        .mockRejectedValueOnce(new Error('Serviço indisponível'))
        .mockResolvedValue([task]),
    });
    render(<TasksPage devApi={service} />);
    expect(await screen.findByText('Serviço indisponível')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Ver detalhes da Task: Relatório trimestral' }),
      ).toBeInTheDocument(),
    );
    expect(service.tasks).toHaveBeenCalledTimes(2);
  });

  it('mantém os dados e mostra erro quando uma alteração falha', async () => {
    const user = userEvent.setup();
    const service = mockService({
      tasks: vi.fn().mockResolvedValue([task]),
      updateTask: vi.fn().mockRejectedValue(new Error('Task em execução')),
    });
    render(<TasksPage devApi={service} />);
    await user.click(
      await screen.findByRole('button', { name: 'Editar Task: Relatório trimestral' }),
    );
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Task em execução');
    expect(
      screen.getByRole('button', { name: 'Editar Task: Relatório trimestral' }),
    ).toBeInTheDocument();
  });
});
