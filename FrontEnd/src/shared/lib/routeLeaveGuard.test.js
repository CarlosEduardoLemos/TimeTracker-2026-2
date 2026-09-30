import { afterEach, expect, it, vi } from 'vitest';
import { canLeaveRoute, registerRouteLeaveGuard } from './routeLeaveGuard';

let cleanup;
afterEach(() => cleanup?.());

it('permite sair sem guarda e respeita uma decisão negativa', () => {
  expect(canLeaveRoute()).toBe(true);
  const guard = vi.fn(() => false);
  cleanup = registerRouteLeaveGuard(guard);
  expect(canLeaveRoute()).toBe(false);
  expect(guard).toHaveBeenCalledOnce();
  cleanup();
  expect(canLeaveRoute()).toBe(true);
});

it('mantém o guarda mais recente ao remover um registro antigo', () => {
  const removeOld = registerRouteLeaveGuard(() => false);
  cleanup = registerRouteLeaveGuard(() => true);
  removeOld();
  expect(canLeaveRoute()).toBe(true);
  cleanup();
  expect(canLeaveRoute()).toBe(true);
});
