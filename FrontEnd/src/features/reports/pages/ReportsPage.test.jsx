import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsPage } from './ReportsPage';
import { api } from '../../../shared/api/api';

vi.mock('../../../shared/api/api', () => ({ api: { users: vi.fn(), exportFile: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks();
  api.users.mockResolvedValue([]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ReportsPage', () => {
  it('offers the existing daily exports with their limited scope explained', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled();
    expect(
      screen.getByText(/O arquivo contém usuário, categoria e tempo registrado de um dia/),
    ).toBeInTheDocument();
  });

  it('anuncia loading e diferencia lista vazia de resposta inválida com retry', async () => {
    let finish;
    api.users.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<ReportsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários');
    expect(screen.getByRole('combobox')).toBeDisabled();
    await act(async () => finish([{ username: 'ana', full_name: {} }]));
    expect(screen.getByRole('alert')).toHaveTextContent('Resposta inválida');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('Nenhum usuário cadastrado.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('impede exportações duplicadas no mesmo evento, bloqueia filtros e anuncia download', async () => {
    let finish;
    api.users.mockResolvedValue([{ username: 'ana' }]);
    api.exportFile.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL, revokeObjectURL }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ReportsPage />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeEnabled());
    vi.useFakeTimers();
    const csv = screen.getByRole('button', { name: 'Exportar CSV' });
    const pdf = screen.getByRole('button', { name: 'Exportar PDF' });
    act(() => {
      csv.click();
      pdf.click();
    });
    expect(api.exportFile).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Data')).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Preparando arquivo CSV');
    await act(async () =>
      finish(new Blob(['username,category,total_seconds'], { type: 'text/csv' })),
    );
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Download de CSV iniciado');
    expect(screen.getByLabelText('Data')).toBeEnabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ana' } });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
  });

  it('rejeita arquivo vazio e permite tentar novamente', async () => {
    api.exportFile.mockResolvedValue(new Blob([]));
    render(<ReportsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Arquivo vazio ou inválido');
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeEnabled();
    expect(screen.queryByText(/Download de/)).not.toBeInTheDocument();
  });
});
