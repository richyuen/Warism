import { describe, expect, it } from 'vitest';
import { nextShown } from '../../src/app/trackShown';

// ROADMAP R65a (critic run 63, R63-N1): at the fastest speed the line under the date moves on to the next named event
// at its hour, from the events the stats carry ahead, instead of going blank until the next stats.
describe('the track line shown under the date (R65a)', () => {
  const next = { note: 'A', tick: 100, ahead: [{ note: 'B', tick: 130 }, { note: 'C', tick: 130 }, { note: 'D', tick: 200 }] };

  it('names the stats next while its hour is not past', () => {
    expect(nextShown(next, 100, 0)?.note).toBe('A');
    expect(nextShown(next, 50, 0)?.note).toBe('A');
  });

  it('moves on to the first event ahead whose hour is not past, never one already past', () => {
    expect(nextShown(next, 101, 0)?.note).toBe('B');
    expect(nextShown(next, 130, 0)?.note).toBe('B');
    expect(nextShown(next, 131, 0)?.note).toBe('D');
  });

  it('none when every event the stats carry is past, or the track is not running', () => {
    expect(nextShown(next, 201, 0)).toBeUndefined();
    expect(nextShown(undefined, 0, 0)).toBeUndefined();
  });
});
