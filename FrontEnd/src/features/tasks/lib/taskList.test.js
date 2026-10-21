import { describe, expect, it } from 'vitest';
import { filterAndSortTasks } from './taskList';

const tasks = [
  {
    id: '2',
    title: 'Relatórios',
    description: 'Revisar resultado',
    created_at: '2026-10-14T10:00:00Z',
  },
  {
    id: '1',
    title: 'Atualização',
    description: 'Atualizar site',
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: '3',
    title: 'Reunião',
    description: 'Preparar reunião',
    created_at: '2026-10-13T10:00:00Z',
  },
];

describe('Task list filters', () => {
  it('searches titles and descriptions without case sensitivity or source mutation', () => {
    expect(filterAndSortTasks(tasks, '  RESULTADO  ').map(({ id }) => id)).toEqual(['2']);
    expect(filterAndSortTasks(tasks, 'atualiza').map(({ id }) => id)).toEqual(['1']);
    expect(filterAndSortTasks(tasks, 'missing')).toEqual([]);
    expect(tasks.map(({ id }) => id)).toEqual(['2', '1', '3']);
  });

  it('sorts alphabetically in both directions and by creation date', () => {
    expect(filterAndSortTasks(tasks, '', 'title-asc').map(({ id }) => id)).toEqual(['1', '2', '3']);
    expect(filterAndSortTasks(tasks, '', 'title-desc').map(({ id }) => id)).toEqual([
      '3',
      '2',
      '1',
    ]);
    expect(filterAndSortTasks(tasks).map(({ id }) => id)).toEqual(['1', '2', '3']);
    expect(filterAndSortTasks(null)).toEqual([]);
  });
});
