import { describe, expect, it } from 'vitest';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R4c: the air's rules (`tests/helpers/worldInvariants.ts`) on half a year of four 1938
// worlds and four random ones: every wing has a base its side holds (a taken one left by the next
// hour) or a fleet of its nation's; it stands there unless ferrying (a carrier's moves with its
// fleet, a sea battle's an hour late); a sortie flies within the wing's range; an airbase wing's
// mission is within it. Red on 7019 to day 400 with a launch out of range (2 lines), a carrier's
// wing not moved with its fleet (2) and a taken airbase kept (19).

describe('the air’s rules (ROADMAP R4c)', () => {
  for (const seed of [7019, 2207, 3739, 1009]) {
    it(`1938, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, rules: ['air'] })).toEqual([]);
    });
  }
  for (const seed of [7, 11, 23, 8821]) {
    it(`the random world of 60, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, world: 'random', nations: 60, rules: ['air'] })).toEqual([]);
    });
  }
  // ROADMAP R15 (critic run 30, R30-B3): with heroes on, Japan's carrier group closed in a sea battle
  // it came into and left in one hour, after the air system's, and left its wings behind (day 158).
  it('1938 with heroes, seed 5591 (a carrier closing in a battle of one hour)', () => {
    expect(worldBreaks({ seed: 5591, days: 170, heroes: true, rules: ['air'] })).toEqual([]);
  });
});
