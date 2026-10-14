import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers, resetMockData } from './handlers';

const server = setupServer(...handlers);
const baseUrl = 'http://localhost:8000';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => resetMockData());

describe('handlers das propostas de contrato', () => {
  it('lista Tasks, cria com 201 e atualiza descrição com PATCH', async () => {
    const listResponse = await fetch(`${baseUrl}/tasks`);
    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual([]);

    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Revisar o relatório mensal' }),
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    expect(created).toMatchObject({
      id: expect.any(String),
      description: 'Revisar o relatório mensal',
    });
    expect(created.created_at).toBe(created.updated_at);

    const patchResponse = await fetch(`${baseUrl}/tasks/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Publicar o relatório mensal' }),
    });
    expect(patchResponse.status).toBe(200);
    expect(await patchResponse.json()).toMatchObject({
      id: created.id,
      description: 'Publicar o relatório mensal',
    });
  });

  it('distingue payload inválido e Task inexistente', async () => {
    const invalid = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: '  ' }),
    });
    expect(invalid.status).toBe(422);

    const missing = await fetch(`${baseUrl}/tasks/00000000-0000-4000-8000-000000000099`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Atualizar Task' }),
    });
    expect(missing.status).toBe(404);
  });

  it('responde à jornada com fuso e nulos para colaborador sem registro', async () => {
    const response = await fetch(`${baseUrl}/dashboard/attendance?date=2026-10-13`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      date: '2026-10-13',
      timezone: 'America/Sao_Paulo',
      as_of: expect.any(String),
      users: [
        {
          username: 'ana',
          first_activity_at: '2026-10-13T11:15:00.000Z',
          last_activity_at: '2026-10-13T20:42:00.000Z',
        },
        { username: 'bruno', first_activity_at: null, last_activity_at: null },
      ],
    });
  });

  it('applies date and collaborator filters to business-day records', async () => {
    const response = await fetch(`${baseUrl}/dashboard/attendance?date=2026-10-14&username=ana`);
    const body = await response.json();
    expect(body.date).toBe('2026-10-14');
    expect(body.users.map(({ username }) => username)).toEqual(['ana']);

    const first = body.users[0].first_activity_at;
    const last = body.users[0].last_activity_at;
    const format = (value, options) =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Sao_Paulo',
        ...options,
      }).format(new Date(value));
    expect(format(first, { year: 'numeric', month: '2-digit', day: '2-digit' })).toBe('14/10/2026');
    expect(format(first, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })).toBe('08:15');
    expect(format(last, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })).toBe('17:42');

    const missing = await fetch(`${baseUrl}/dashboard/attendance?date=2026-10-14&username=unknown`);
    expect((await missing.json()).users).toEqual([]);
  });

  it('blocks API routes without a development mock instead of bypassing to the backend', async () => {
    const response = await fetch(`${baseUrl}/activities/realtime`);

    expect(response.status).toBe(501);
    expect(await response.json()).toMatchObject({
      detail: expect.stringContaining('chamada real bloqueada'),
    });
  });
  it('valida data, oferece agregação sem ranking e status separado de inatividade', async () => {
    const invalidDate = await fetch(`${baseUrl}/dashboard/attendance?date=2026-02-31`);
    expect(invalidDate.status).toBe(422);

    const hours = await fetch(
      `${baseUrl}/dashboard/task-hours?start_date=2026-10-01&end_date=2026-10-13`,
    );
    expect(await hours.json()).toEqual({
      start_date: '2026-10-01',
      end_date: '2026-10-13',
      timezone: 'America/Sao_Paulo',
      tasks: [],
    });

    const agents = await fetch(`${baseUrl}/agents/status`);
    const body = await agents.json();
    expect(
      body.agents.map(({ username, connection_status }) => [username, connection_status]),
    ).toEqual([
      ['ana', 'online'],
      ['bruno', 'unknown'],
    ]);
    expect(body.agents[0]).not.toHaveProperty('is_idle');
    const filtered = await fetch(`${baseUrl}/agents/status?username=ana`);
    expect((await filtered.json()).agents.map(({ username }) => username)).toEqual(['ana']);

    const noMatch = await fetch(`${baseUrl}/agents/status?username=unknown`);
    expect((await noMatch.json()).agents).toEqual([]);
  });
});
