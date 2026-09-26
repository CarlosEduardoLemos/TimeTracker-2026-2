import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: { settings: vi.fn(), saveSettings: vi.fn() } }));
const settings = { capture_interval_seconds: 10, idle_timeout_seconds: 300 };
beforeEach(() => {
  vi.resetAllMocks();
  api.settings.mockResolvedValue(settings);
});

describe('SettingsPage', () => {
  it('impede dois envios no mesmo evento e desbloqueia após sucesso', async () => {
    let finish;
    api.saveSettings.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<SettingsPage />);
    const save = await screen.findByRole('button', { name: 'Salvar configurações' });
    act(() => {
      fireEvent.submit(save.closest('form'));
      fireEvent.submit(save.closest('form'));
    });
    expect(api.saveSettings).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Intervalo de captura (segundos)')).toBeDisabled();
    await act(async () => finish(settings));
    expect(screen.getByRole('status')).toHaveTextContent('Configurações salvas');
    expect(screen.getByLabelText('Intervalo de captura (segundos)')).toBeEnabled();
  });

  it('limpa erro obsoleto ao editar e permite repetir o salvamento', async () => {
    api.saveSettings.mockRejectedValueOnce(new Error('offline')).mockResolvedValue(settings);
    render(<SettingsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar configurações' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('offline');
    fireEvent.change(screen.getByLabelText('Intervalo de captura (segundos)'), {
      target: { value: '20' },
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar configurações' }));
    await screen.findByText('Configurações salvas.');
    expect(api.saveSettings.mock.calls[1][0]).toEqual({
      ...settings,
      capture_interval_seconds: 20,
    });
  });
});
