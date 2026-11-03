import { describe, expect, it } from 'vitest';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R4b: the navy's rules (`tests/helpers/worldInvariants.ts`) on half a year of four 1938
// worlds and four random ones: a fleet not under way stands on water; a formation aboard rides
// its own nation's fleet and stands where it stands, or is lost with sunk transports by the next
// hour; no fleet is a dead nation's. Red with the formation aboard left behind its transports (14
// lines on 7019 to day 400) and kept afloat after they sank (England's formation 279, day 287).

describe('the navy’s rules (ROADMAP R4b)', () => {
  for (const seed of [7019, 2207, 3739, 1009]) {
    it(`1938, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, rules: ['navy'] })).toEqual([]);
    });
  }
  for (const seed of [7, 11, 23, 8821]) {
    it(`the random world of 60, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, world: 'random', nations: 60, rules: ['navy'] })).toEqual([]);
    });
  }
});
