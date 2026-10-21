import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ManagerSessionProvider, useManagerSession } from './ManagerSession';
import { MANAGER_ACCESS_TOKEN_KEY } from './sessionStorage';

const token = `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYW5hZ2VyIn0.${'A'.repeat(43)}`;
const manager = {
  id: 'b06e3df5-c23b-49ec-9a40-081a451620b3',
  email: 'gestor@empresa.com',
  created_at: '2026-10-21T12:00:00Z',
};

function SessionControls() {
  const { status, logout } = useManagerSession();
  return (
    <>
      <p role="status">{status}</p>
      <button type="button" onClick={logout}>
        Sair
      </button>
    </>
  );
}

afterEach(() => {
  sessionStorage.clear();
  window.location.hash = '';
});

it('restores the manager identity from the API and clears the session on logout', async () => {
  sessionStorage.setItem(MANAGER_ACCESS_TOKEN_KEY, token);
  const client = { getCurrentManager: vi.fn().mockResolvedValue(manager) };
  render(
    <ManagerSessionProvider client={client}>
      <SessionControls />
    </ManagerSessionProvider>,
  );

  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('authenticated'));
  expect(client.getCurrentManager).toHaveBeenCalledWith(token, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

  expect(screen.getByRole('status')).toHaveTextContent('anonymous');
  expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).toBeNull();
  expect(window.location.hash).toBe('#/login');
});

it('removes a token rejected by the identity endpoint', async () => {
  sessionStorage.setItem(MANAGER_ACCESS_TOKEN_KEY, token);
  const client = {
    getCurrentManager: vi.fn().mockRejectedValue({ status: 401, type: 'client' }),
  };
  render(
    <ManagerSessionProvider client={client}>
      <SessionControls />
    </ManagerSessionProvider>,
  );

  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('anonymous'));
  expect(sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY)).toBeNull();
});
