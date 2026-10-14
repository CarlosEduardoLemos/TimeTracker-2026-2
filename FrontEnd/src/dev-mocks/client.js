import {
  validAgentStatuses,
  validAttendance,
  validTask,
  validTaskDescription,
  validTaskHours,
  validTasks,
} from '../shared/api/validators';
import { isIsoDate } from '../shared/lib/date';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

async function request(path, validator, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body?.detail === 'string' ? body.detail : '';
    } catch {
      // Mantém o status HTTP se a resposta de erro não tiver JSON.
    }
    throw new Error(detail || `API respondeu ${response.status}`);
  }

  const value = await response.json();
  if (!validator(value)) throw new Error('Resposta inválida da API');
  return value;
}

function jsonOptions(method, body, signal) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  };
}

function taskQuery(date, username) {
  if (!isIsoDate(date)) throw new Error('Selecione uma data válida');
  const query = new URLSearchParams({ date });
  if (username) query.set('username', username);
  return query.toString();
}

export const devApi = {
  tasks: (signal) => request('/tasks', validTasks, { signal }),
  createTask(description, signal) {
    if (!validTaskDescription(description))
      throw new Error('Informe uma descrição de até 200 caracteres.');
    return request(
      '/tasks',
      validTask,
      jsonOptions('POST', { description: description.trim() }, signal),
    );
  },
  patchTask(taskId, description, signal) {
    if (!UUID_PATTERN.test(taskId)) throw new Error('ID de Task inválido');
    if (!validTaskDescription(description))
      throw new Error('Informe uma descrição de até 200 caracteres.');
    return request(
      `/tasks/${taskId}`,
      validTask,
      jsonOptions('PATCH', { description: description.trim() }, signal),
    );
  },
  attendance(date, username = '', signal) {
    return request(`/dashboard/attendance?${taskQuery(date, username)}`, validAttendance, {
      signal,
    });
  },
  taskHours(startDate, endDate, username = '', taskId = '', signal) {
    if (!isIsoDate(startDate) || !isIsoDate(endDate) || startDate > endDate) {
      throw new Error('Selecione um período válido');
    }
    if (taskId && !UUID_PATTERN.test(taskId)) throw new Error('ID de Task inválido');
    const query = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (username) query.set('username', username);
    if (taskId) query.set('task_id', taskId);
    return request(`/dashboard/task-hours?${query}`, validTaskHours, { signal });
  },
  agentStatuses(username = '', signal) {
    const query = new URLSearchParams();
    if (username) query.set('username', username);
    const suffix = query.size ? `?${query}` : '';
    return request(`/agents/status${suffix}`, validAgentStatuses, { signal });
  },
};
