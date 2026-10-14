import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TasksPage } from './TasksPage';

const task = {
  id: '6e7b94da-5651-46a0-bf28-fcb8f4f14c04',
  description: 'Revisar relatório',
  created_at: '2026-10-13T14:20:00Z',
  updated_at: '2026-10-13T14:20:00Z',
};

describe('TasksPage', () => {
  it('mantém indisponibilidade informativa sem mocks e sem chamadas', () => {
    const devApi = { tasks: vi.fn(), createTask: vi.fn() };
    render(<TasksPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
    expect(
      screen.getByText(/backend ainda não oferece consulta ou persistência de tasks/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(devApi.tasks).not.toHaveBeenCalled();
  });

  it('mostra vazio e cria uma Task quando os mocks estão habilitados', async () => {
    const devApi = {
      tasks: vi.fn().mockResolvedValue([]),
      createTask: vi.fn().mockResolvedValue(task),
    };
    render(<TasksPage devApi={devApi} />);
    expect(await screen.findByText(/Nenhuma Task foi criada/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Descrição' }), {
      target: { value: 'Revisar relatório' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Task' }));
    expect(await screen.findByText('Revisar relatório')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Task criada em dados simulados');
    expect(devApi.createTask).toHaveBeenCalledWith('Revisar relatório');
  });

  it('exibe erro de consulta e oferece retry', async () => {
    const devApi = {
      tasks: vi
        .fn()
        .mockRejectedValueOnce(new Error('Serviço indisponível'))
        .mockResolvedValue([task]),
      createTask: vi.fn(),
    };
    render(<TasksPage devApi={devApi} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(screen.getByText('Revisar relatório')).toBeInTheDocument());
    expect(devApi.tasks).toHaveBeenCalledTimes(2);
  });

  it('anuncia carregamento e rejeita descrição vazia no formulário', async () => {
    let finish;
    const devApi = {
      tasks: vi.fn(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      ),
      createTask: vi.fn(),
    };
    render(<TasksPage devApi={devApi} />);
    expect(screen.getByRole('status', { name: 'Carregando Tasks…' })).toBeInTheDocument();
    await waitFor(() => expect(finish).toBeDefined());
    finish([]);
    fireEvent.click(screen.getByRole('button', { name: 'Criar Task' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma descrição');
    expect(devApi.createTask).not.toHaveBeenCalled();
  });
});
