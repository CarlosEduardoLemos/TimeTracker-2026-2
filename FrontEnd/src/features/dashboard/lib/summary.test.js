import { describe, expect, it } from 'vitest';
import { categoryTotals } from './summary';

describe('dashboard summary utilities', () => {
  it('combines categories across users and orders them by total duration', () => {
    const summary = {
      users: [
        {
          by_category: [
            { category: 'Reunião', total_seconds: 600 },
            { category: 'Código', total_seconds: 1800 },
          ],
        },
        { by_category: [{ category: 'Reunião', total_seconds: 2400 }] },
      ],
    };

    expect(categoryTotals(summary)).toEqual([
      { name: 'Reunião', seconds: 3000 },
      { name: 'Código', seconds: 1800 },
    ]);
    expect(categoryTotals(null)).toEqual([]);
  });
});
