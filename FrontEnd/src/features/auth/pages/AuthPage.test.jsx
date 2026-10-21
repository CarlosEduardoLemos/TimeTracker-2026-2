import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManagerSessionProvider } from '../../../shared/auth/ManagerSession';
import { MANAGER_ACCESS_TOKEN_KEY } from '../../../shared/auth/sessionStorage';
import { AuthPage } from './AuthPage';

const token = `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYW5hZ2VyIn0.${'A'.repeat(43)}`;
const manager = {
  id: 'b06e3df5-c23b-49ec-9a40-081a451620b3',
  email: 'gestor@empresa.com',
  created_at: '2026-10-21T12:00:00Z',
};

function renderAuthPage(mode, client) {
  return render(
    <ManagerSessionProvider client={client}>
      <AuthPage mode={mode} />
    </ManagerSessionProvider>,
  );
}

afterEach(() => {
  sessionStorage.removeItem(MANAGER_ACCESS_TOKEN_KEY);
  window.location.hash = '';
});

describe('AuthPage', () => {
  it('validates e-mail and registration password before calling the API', async () => {
    const client = { registerManager: vi.fn(), loginManager: vi.fn(), getCurrentManager: vi.fn() };
    renderAuthPage('cadastro', client);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), 'sem-email');
    await user.type(screen.getByLabelText('Senha'), 'short');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByRole('alert')).toHaveTextContent('endereço de e-mail válido');
    expect(client.registerManager).not.toHaveBeenCalled();
  });

  it('rejects a registration password over the backend UTF-8 byte limit', async () => {
    const client = { registerManager: vi.fn(), loginManager: vi.fn(), getCurrentManager: vi.fn() };
    renderAuthPage('cadastro', client);

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'gestor@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '🔒'.repeat(19) } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByRole('alert')).toHaveTextContent('no máximo 72 bytes');
    expect(client.registerManager).not.toHaveBeenCalled();
  });

  it('creates an account and asks the manager to sign in without creating a session', async () => {
    const client = {
      registerManager: vi.fn().mockResolvedValue(manager),
      loginManager: vi.fn(),
      getCurrentManager: vi.fn(),
    };
    renderAuthPage('cadastro', client);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), ' gestor@empresa.com ');
    await user.type(screen.getByLabelText('Senha'), 'SenhaSegura123!');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'O cadastro não inicia uma sessão automaticamente',
    );
    expect(client.registerManager).toHaveBeenCalledWith({
      email: 'gestor@empresa.com',
      password: 'SenhaSegura123!',
    });
    expect(client.loginManager).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).toBeNull();
    expect(screen.getByRole('link', { name: 'Ir para entrar' })).toHaveAttribute('href', '#/login');
  });

  it('logs in, validates the manager identity and stores only the JWT in sessionStorage', async () => {
    const client = {
      registerManager: vi.fn(),
      loginManager: vi.fn().mockResolvedValue({
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
      }),
      getCurrentManager: vi.fn().mockResolvedValue(manager),
    };
    renderAuthPage('login', client);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), 'gestor@empresa.com');
    await user.type(screen.getByLabelText('Senha'), 'SenhaSegura123!');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(window.location.hash).toBe('#/painel'));
    expect(client.loginManager).toHaveBeenCalledWith(
      {
        email: 'gestor@empresa.com',
        password: 'SenhaSegura123!',
      },
      expect.any(AbortSignal),
    );
    expect(client.getCurrentManager).toHaveBeenCalledWith(token, expect.any(AbortSignal));
    expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).toBe(token);
    expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).not.toContain('SenhaSegura123!');
  });

  it('shows a generic duplicate-account error without exposing server details', async () => {
    const client = {
      registerManager: vi.fn().mockRejectedValue({ status: 409, message: 'secret detail' }),
      loginManager: vi.fn(),
      getCurrentManager: vi.fn(),
    };
    renderAuthPage('cadastro', client);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), 'gestor@empresa.com');
    await user.type(screen.getByLabelText('Senha'), 'SenhaSegura123!');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe uma conta');
    expect(screen.getByRole('alert')).not.toHaveTextContent('secret detail');
  });

  it('maps invalid credentials and network failures to safe messages', async () => {
    const client = {
      registerManager: vi.fn(),
      loginManager: vi
        .fn()
        .mockRejectedValueOnce({ status: 401 })
        .mockRejectedValueOnce({ type: 'network' }),
      getCurrentManager: vi.fn(),
    };
    renderAuthPage('login', client);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), 'gestor@empresa.com');
    await user.type(screen.getByLabelText('Senha'), 'SenhaSegura123!');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');

    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar à API');
  });

  it('prevents duplicate form submission while a login request is pending', async () => {
    let resolveLogin;
    const client = {
      registerManager: vi.fn(),
      loginManager: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          }),
      ),
      getCurrentManager: vi.fn().mockResolvedValue(manager),
    };
    renderAuthPage('login', client);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'gestor@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'SenhaSegura123!' } });
    const form = screen.getByLabelText('Senha').closest('form');

    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(client.loginManager).toHaveBeenCalledOnce();

    resolveLogin({ access_token: token, token_type: 'bearer', expires_in: 3600 });
    await waitFor(() => expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).toBe(token));
  });
});
