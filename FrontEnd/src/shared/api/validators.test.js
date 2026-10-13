import { describe, expect, it } from 'vitest';
import {
  validManager,
  validManagerToken,
  validRealtime,
  validSettings,
  validSummary,
  validUsers,
} from './validators';

describe('contratos da API', () => {
  it('aceita usuários únicos e campos opcionais ausentes ou nulos', () => {
    expect(validUsers([])).toBe(true);
    expect(validUsers([{ username: 'ana', full_name: null, department: 'TI' }])).toBe(true);
    expect(validUsers([{ username: 'ana' }, { username: 'ana' }])).toBe(false);
    expect(validUsers([{ username: '' }])).toBe(false);
    expect(validUsers([{ username: 'ana', full_name: {} }])).toBe(false);
    expect(validUsers([{ username: 'ana', department: [] }])).toBe(false);
    expect(validUsers(null)).toBe(false);
  });

  it('exige estado e segundos inteiros seguros nas leituras realtime', () => {
    const entry = { username: 'ana', status: 'online', seconds_since_last_activity: 0 };
    expect(validRealtime([entry])).toBe(true);
    expect(validRealtime([{ ...entry, status: 'ausente', process_name: null }])).toBe(true);
    expect(validRealtime([{ ...entry, status: 'offline' }])).toBe(true);
    expect(validRealtime([entry, entry])).toBe(false);
    expect(validRealtime([{ ...entry, status: 'desconhecido' }])).toBe(false);
    expect(validRealtime([{ ...entry, seconds_since_last_activity: -1 }])).toBe(false);
    expect(validRealtime([{ ...entry, seconds_since_last_activity: 0.5 }])).toBe(false);
    expect(validRealtime([{ ...entry, process_name: {} }])).toBe(false);
  });

  it('valida data real, identidades e duração por categoria no resumo', () => {
    const user = {
      username: 'ana',
      total_seconds: 60,
      by_category: [{ category: 'Trabalho', total_seconds: 60 }],
    };
    expect(validSummary({ date: '2026-09-25', users: [] })).toBe(true);
    expect(validSummary({ date: '2026-09-25', users: [user] })).toBe(true);
    expect(validSummary({ date: '2026-02-31', users: [] })).toBe(false);
    expect(validSummary({ date: '2026-09-25', users: [user, user] })).toBe(false);
    expect(validSummary({ date: '2026-09-25', users: [{ ...user, username: '' }] })).toBe(false);
    expect(
      validSummary({
        date: '2026-09-25',
        users: [{ ...user, total_seconds: Number.MAX_SAFE_INTEGER + 1 }],
      }),
    ).toBe(false);
    expect(
      validSummary({
        date: '2026-09-25',
        users: [{ ...user, by_category: [{ category: 'Trabalho', total_seconds: -1 }] }],
      }),
    ).toBe(false);
    expect(validSummary(null)).toBe(false);
  });

  it('exige ambos os parâmetros globais inteiros positivos', () => {
    const settings = { capture_interval_seconds: 10, idle_timeout_seconds: 300 };
    expect(validSettings(settings)).toBe(true);
    expect(validSettings({ ...settings, capture_interval_seconds: 0 })).toBe(false);
    expect(validSettings({ ...settings, idle_timeout_seconds: 1.5 })).toBe(false);
    expect(validSettings({ ...settings, idle_timeout_seconds: '300' })).toBe(false);
    expect(validSettings({ capture_interval_seconds: 10 })).toBe(false);
    expect(validSettings(null)).toBe(false);
  });

  it('validates ManagerOut without accepting password fields', () => {
    const manager = {
      id: 'b06e3df5-c23b-49ec-9a40-081a451620b3',
      email: 'gestor@empresa.com',
      created_at: '2026-10-13T12:00:00Z',
    };
    expect(validManager(manager)).toBe(true);
    expect(validManager({ ...manager, password_hash: 'hash' })).toBe(false);
    expect(validManager({ ...manager, password: 'segredo' })).toBe(false);
    expect(validManager({ ...manager, association_code: '012345' })).toBe(false);
    expect(validManager({ ...manager, email: null })).toBe(false);
    expect(validManager({ ...manager, id: 'not-a-uuid' })).toBe(false);
    expect(validManager({ ...manager, created_at: 'ontem' })).toBe(false);
  });

  it('validates bearer token and positive expiry in seconds', () => {
    const token = {
      access_token: 'jwt-recebido-do-servidor',
      token_type: 'bearer',
      expires_in: 3600,
    };
    expect(validManagerToken(token)).toBe(true);
    expect(validManagerToken({ ...token, token_type: 'Bearer' })).toBe(false);
    expect(validManagerToken({ ...token, expires_in: 0 })).toBe(false);
    expect(validManagerToken({ ...token, expires_in: 1.5 })).toBe(false);
    expect(validManagerToken({ ...token, access_token: '' })).toBe(false);
    expect(validManagerToken({ ...token, password: 'nao-incluir' })).toBe(false);
  });
});
