import { describe, expect, it } from 'vitest';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R9 (ADR-812): the heroes' rules (`tests/helpers/worldInvariants.ts`) on half a year of
// four 1938 worlds with the heroes on: a hero's formation is its roster nation's, no row has two,
// and a row with no hero waits to return. Red on the old annexation, which handed a dead nation's
// heroes to the taker (`heroes.test.ts` makes one; the critic's 4637 did in year 6).

describe('the heroes’ rules (ROADMAP R9)', () => {
  for (const seed of [7019, 2207, 3739, 1009]) {
    it(`1938 with heroes, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, heroes: true, rules: ['heroes'] })).toEqual([]);
    });
  }
});
