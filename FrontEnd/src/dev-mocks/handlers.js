import { http, HttpResponse } from 'msw';
import { isIsoDate } from '../shared/lib/date';
import {
  validTaskDescription,
  validTaskHours,
  validTask,
  validAttendance,
} from '../shared/api/validators';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TIMEZONE = 'America/Sao_Paulo';
let tasks = [];
let sequence = 0;

function makeTaskId() {
  sequence += 1;
  return `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`;
}

function taskBodyIsValid(body) {
  return (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.keys(body).length === 1 &&
    Object.hasOwn(body, 'description') &&
    validTaskDescription(body.description)
  );
}

function timestampAt(date, hour, minute) {
  return new Date(
    `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-03:00`,
  ).toISOString();
}

function attendanceFor(date, username) {
  const people = [
    {
      username: 'ana',
      first_activity_at: timestampAt(date, 8, 15),
      last_activity_at: timestampAt(date, 17, 42),
    },
    { username: 'bruno', first_activity_at: null, last_activity_at: null },
  ];
  const users = username ? people.filter((person) => person.username === username) : people;
  return { date, timezone: TIMEZONE, as_of: new Date().toISOString(), users };
}

export function resetMockData() {
  tasks = [];
  sequence = 0;
}

export const handlers = [
  http.get(`${API_BASE_URL}/tasks`, () => HttpResponse.json(tasks)),
  http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
    const body = await request.json().catch(() => null);
    if (!taskBodyIsValid(body)) {
      return HttpResponse.json({ detail: 'Descrição inválida' }, { status: 422 });
    }

    const now = new Date().toISOString();
    const task = {
      id: makeTaskId(),
      description: body.description.trim(),
      created_at: now,
      updated_at: now,
    };
    if (!validTask(task)) return HttpResponse.json({ detail: 'Task inválida' }, { status: 500 });
    tasks = [...tasks, task];
    return HttpResponse.json(task, { status: 201 });
  }),
  http.patch(`${API_BASE_URL}/tasks/:task_id`, async ({ params, request }) => {
    const body = await request.json().catch(() => null);
    if (!taskBodyIsValid(body)) {
      return HttpResponse.json({ detail: 'Descrição inválida' }, { status: 422 });
    }
    const index = tasks.findIndex((task) => task.id === params.task_id);
    if (index < 0) return HttpResponse.json({ detail: 'Task não encontrada' }, { status: 404 });

    const task = {
      ...tasks[index],
      description: body.description.trim(),
      updated_at: new Date().toISOString(),
    };
    if (!validTask(task)) return HttpResponse.json({ detail: 'Task inválida' }, { status: 500 });
    tasks = tasks.map((entry, current) => (current === index ? task : entry));
    return HttpResponse.json(task);
  }),
  http.get(`${API_BASE_URL}/dashboard/attendance`, ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || '';
    if (!isIsoDate(date)) {
      return HttpResponse.json({ detail: 'Data inválida' }, { status: 422 });
    }
    const response = attendanceFor(date, url.searchParams.get('username') || '');
    if (!validAttendance(response)) {
      return HttpResponse.json({ detail: 'Resposta inválida' }, { status: 500 });
    }
    return HttpResponse.json(response);
  }),
  http.get(`${API_BASE_URL}/dashboard/task-hours`, ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date') || '';
    const endDate = url.searchParams.get('end_date') || '';
    const taskId = url.searchParams.get('task_id');
    const response = {
      start_date: startDate,
      end_date: endDate,
      timezone: TIMEZONE,
      tasks: [],
    };
    if (
      !isIsoDate(startDate) ||
      !isIsoDate(endDate) ||
      startDate > endDate ||
      (taskId && !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(taskId))
    ) {
      return HttpResponse.json({ detail: 'Filtro inválido' }, { status: 422 });
    }
    return validTaskHours(response)
      ? HttpResponse.json(response)
      : HttpResponse.json({ detail: 'Resposta inválida' }, { status: 500 });
  }),
  http.get(`${API_BASE_URL}/agents/status`, ({ request }) => {
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || '';
    const agents = [
      {
        username: 'ana',
        hostname: 'ESTACAO-01',
        last_record_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        connection_status: 'online',
      },
      {
        username: 'bruno',
        hostname: 'ESTACAO-02',
        last_record_at: null,
        connection_status: 'unknown',
      },
    ];
    return HttpResponse.json({
      agents: username ? agents.filter((agent) => agent.username === username) : agents,
    });
  }),
  http.all(`${API_BASE_URL}/*`, ({ request }) => {
    const { pathname } = new URL(request.url);
    return HttpResponse.json(
      {
        detail: `Sem mock de desenvolvimento para ${request.method} ${pathname}; chamada real bloqueada.`,
      },
      { status: 501 },
    );
  }),
];
