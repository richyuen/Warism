import { describe, expect, it } from 'vitest';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { declareWar } from '../../src/sim/systems/war';
import { arsenals, historyTrack } from '../helpers/historyTrack';

// ROADMAP R62k (ADR-947): the historical track's checker (`tests/helpers/historyTrack.ts`) from 1938 to the track's
// end; and red on a war the timeline does not have. At its end the blocs it hands over stand (R67b).
// The bar is the scenario's own seed, the one every game plays (ADR-950, the user's decision of 2026-11-10). Five other
// seeds warn of steering that holds by luck alone (a rule changed anywhere moves the own seed's course as a new seed
// would): their broken lines are printed, `WARNING historyTrack`, and each one found at a release check becomes a
// ROADMAP item; they fail only if the track does not run to its end. Seed 4 found R62l's landing in Palestine so.
// They are `historyTrack1938hSeed1.test.ts` to `Seed5`, a file a seed, so they run side by side (ADR-959).

describe('the historical track checked to its end (ROADMAP R62k)', () => {
  it(`seed ${SEED_1938H} (the scenario's own): nothing passed over, no war or peace off the timeline, the diplomatic rules kept`, () => {
    const run = historyTrack(SEED_1938H);
    expect(run.sim.world.track!.ended).toBe(true);
    expect(run.lines).toEqual([]);
    expect(run.skipped).toEqual([]);
    // R69f (ADR-989): the arsenals of 1962 history's: no West German, none before its nation's bomb.
    expect(arsenals(run.sim.world)).toEqual(['ENG', 'FRA', 'SOV', 'USA']);
    // R67b (ADR-980): the blocs it hands over, each under its leader with its members (West Germany in NATO from 1955,
    // R69b, ADR-985; China out of the Soviet bloc at the split of 1960, R69c, ADR-986; Albania in 1961, R69d, ADR-987).
    // As handed over, before the free AI's first day (R71b, ADR-993).
    const members = (leader: string): string[] | undefined => run.handover.get(leader);
    expect(members('USA')).toEqual(['BEL', 'DEN', 'ENG', 'FRA', 'FRG', 'GRE', 'ICE', 'ITA', 'LUX', 'NED', 'NOR', 'POR', 'TUR', 'USA'].sort());
    expect(members('SOV')).toEqual(['BUL', 'CZS', 'GDR', 'HUN', 'MON', 'POL', 'ROM', 'SOV'].sort());
    // To 1975 since R71b (ADR-993): a longer run than the default timeout.
  }, 1_800_000);

  it('a war the timeline does not have is found', () => {
    const [swe, swi] = [TAGS_1938H.indexOf('SWE') + 1, TAGS_1938H.indexOf('SWI') + 1];
    const run = historyTrack(SEED_1938H, 24 * 40, (w) => {
      if (w.tick === 24 * 30 + 5) declareWar(w, swe, swi);
    });
    expect(run.lines.some((l) => l.includes('course: war SWE and SWI'))).toBe(true);
  });
});
