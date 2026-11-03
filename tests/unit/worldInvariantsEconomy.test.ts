import { describe, expect, it } from 'vitest';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R4a: the economy's rules (`tests/helpers/worldInvariants.ts`) on half a year of four
// 1938 worlds and four random ones: gold rises only at a month's start (or a founding), by no more
// than the month's income and tribute, and a bankrupt nation's formations on land lose the
// desertion share. On 7019 Poland starts 800 in debt, so that the bankrupt months are checked.
// Red on a doubled income (21 lines on 7019) and with no desertion (Poland's formation 558).

describe('the economy’s rules (ROADMAP R4a)', () => {
  for (const seed of [7019, 2207, 3739, 1009]) {
    it(`1938, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, rules: ['economy'], ...(seed === 7019 ? { bankrupt: [['POL', -800]] as const } : {}) })).toEqual([]);
    });
  }
  for (const seed of [7, 11, 23, 8821]) {
    it(`the random world of 60, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, world: 'random', nations: 60, rules: ['economy'] })).toEqual([]);
    });
  }
});
