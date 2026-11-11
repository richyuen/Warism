import { describe, expect, it } from 'vitest';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { declareWar } from '../../src/sim/systems/war';
import { historyTrack } from '../helpers/historyTrack';

// ROADMAP R62k (ADR-947): the historical track's checker (`tests/helpers/historyTrack.ts`) from 1938 to the track's
// end; and red on a war the timeline does not have.
// The bar is the scenario's own seed, the one every game plays (ADR-950, the user's decision of 2026-11-10). Five other
// seeds warn of steering that holds by luck alone (a rule changed anywhere moves the own seed's course as a new seed
// would): their broken lines are printed, `WARNING historyTrack`, and each one found at a release check becomes a
// ROADMAP item; they fail only if the track does not run to its end. Seed 4 found R62l's landing in Palestine so.

const OTHERS = [1, 2, 3, 4, 5];

describe('the historical track checked to its end (ROADMAP R62k)', () => {
  it(`seed ${SEED_1938H} (the scenario's own): nothing passed over, no war or peace off the timeline, the diplomatic rules kept`, () => {
    const run = historyTrack(SEED_1938H);
    expect(run.sim.world.track!.ended).toBe(true);
    expect(run.lines).toEqual([]);
    expect(run.skipped).toEqual([]);
  });

  for (const seed of OTHERS) {
    it(`seed ${seed}: a warning of what the checker finds, the track run to its end`, () => {
      const run = historyTrack(seed);
      expect(run.sim.world.track!.ended).toBe(true);
      for (const l of run.lines) process.stderr.write(`WARNING historyTrack (not a gate failure; ADR-950): ${l}\n`);
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
