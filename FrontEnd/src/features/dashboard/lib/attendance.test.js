import { describe, expect, it } from 'vitest';
import { formatAttendanceTime, isCurrentDateInTimezone } from './attendance';

describe('formatação da jornada diária', () => {
  it('formata instantes no fuso declarado e preserva ausência de horário', () => {
    expect(formatAttendanceTime('2026-10-13T11:15:00Z', 'America/Sao_Paulo')).toBe('08:15');
    expect(formatAttendanceTime(null, 'America/Sao_Paulo')).toBe('—');
  });

  it('identifica o dia corrente no fuso de negócio informado', () => {
    const now = new Date('2026-10-14T01:30:00Z');
    expect(isCurrentDateInTimezone('2026-10-13', 'America/Sao_Paulo', now)).toBe(true);
    expect(isCurrentDateInTimezone('2026-10-14', 'America/Sao_Paulo', now)).toBe(false);
  });
});
