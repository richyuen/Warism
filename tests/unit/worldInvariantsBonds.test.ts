import { describe, expect, it } from 'vitest';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R4e: the bonds' rules (`tests/helpers/worldInvariants.ts`) on half a year of four 1938
// worlds and four random ones: an overlord is a living nation other than its puppet and no puppet
// itself (ADR-148, ADR-810); a dead nation has none; a puppet is never at war with its overlord;
// autonomy, loyalty, integration, unity within 0..100; an alliance of two living members or more
// with its leader among them; one alliance a nation; a guarantee between two living nations at
// peace with each other. Red on HEAD before ADR-810: puppets of puppets on 1009, 2207, 3739 and
// the random world 11 within two years.

describe('the bonds’ rules (ROADMAP R4e)', () => {
  for (const seed of [7019, 2207, 3739, 1009]) {
    it(`1938, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, rules: ['bonds'] })).toEqual([]);
    });
  }
  for (const seed of [7, 11, 23, 8821]) {
    it(`the random world of 60, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, world: 'random', nations: 60, rules: ['bonds'] })).toEqual([]);
    });
  }
});
