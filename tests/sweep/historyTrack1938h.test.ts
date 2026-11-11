import { describe, expect, it } from 'vitest';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { declareWar } from '../../src/sim/systems/war';
import { historyTrack } from '../helpers/historyTrack';

// ROADMAP R62k (ADR-947): the historical track's checker (`tests/helpers/historyTrack.ts`) green from 1938 to the
// track's end on the scenario's own seed and on five others; and red on a war the timeline does not have.
// Seed 4 was red before R62l (ADR-949): Italy landed in Palestine in August 1941 by a landing of the AI's own, held it
// to 1948, and Israel's birth was passed over.

const SEEDS = [SEED_1938H, 1, 2, 3, 4, 5];

describe('the historical track checked to its end (ROADMAP R62k)', () => {
  for (const seed of SEEDS) {
    it(`seed ${seed}${seed === SEED_1938H ? " (the scenario's own)" : ''}: no event passed over but by rule, no war or peace off the timeline, the diplomatic rules kept`, () => {
      const run = historyTrack(seed);
      expect(run.sim.world.track!.ended).toBe(true);
      expect(run.lines).toEqual([]);
      if (seed === SEED_1938H) expect(run.skipped).toEqual([]);
    });
  }

  it('a war the timeline does not have is found', () => {
    const [swe, swi] = [TAGS_1938H.indexOf('SWE') + 1, TAGS_1938H.indexOf('SWI') + 1];
    const run = historyTrack(SEED_1938H, 24 * 40, (w) => {
      if (w.tick === 24 * 30 + 5) declareWar(w, swe, swi);
    });
    expect(run.lines.some((l) => l.includes('course: war SWE and SWI'))).toBe(true);
  });
});
