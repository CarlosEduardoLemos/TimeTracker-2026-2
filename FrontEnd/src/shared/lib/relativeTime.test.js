import { describe, expect, it } from 'vitest';
import { formatLastRead } from './relativeTime';

describe('formatLastRead', () => {
  it.each([
    [32, '32s atrás'],
    [300, '5min atrás'],
    [4680, '1h 18min atrás'],
    [25200, '7h atrás'],
  ])('formats %i elapsed seconds', (seconds, expected) => {
    expect(formatLastRead(seconds)).toBe(expected);
  });

  it.each([undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -1])(
    'uses an unavailable label for %s',
    (seconds) => {
      expect(formatLastRead(seconds)).toBe('—');
    },
  );
});
