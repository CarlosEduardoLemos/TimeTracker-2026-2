import { describe, expect, it } from 'vitest';
import { validRealtime, validSettings, validSummary, validUsers } from './validators';

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
    expect(validRealtime([entry, entry])).toBe(false);
    expect(validRealtime([{ ...entry, status: 'offline' }])).toBe(false);
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
});
