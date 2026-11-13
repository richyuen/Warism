import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { FOCUS_FLOOR, FOCUS_FROM_DAY, FOCUS_YEARS, focusAfterTrack } from '../../src/sim/ai/strategic';
import { TRACK_SECTION } from '../../src/sim/track';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R75a (with R74e-f; critic run 65, R65-N2 and N3): the historical focus after the track. The share of its
// declarations the AI makes is 0 on the day the track ends, then FOCUS_FLOOR rising to 1 over FOCUS_YEARS; 1 in a game
// with no track, one whose track runs, and one loaded from a save that ended it before the tick was kept. The tick it
// ended at is saved and loaded with the track. R76a (critic run 66, R66-N1): only for an end in the bloc era, from
// FOCUS_FROM_DAY (1 January 1946); a replay left in 1938-45 goes on as plain 1938.

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const assets = assets1938(SIZE_1938.w);

describe('the historical focus after the track (R75a)', () => {
  it('eases the declarations in from the end, and is whole in other games', () => {
    expect(focusAfterTrack(new Sim({ scenario: '1938', seed: 99, assets }).world)).toBe(1);
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
    sim.step(24, quiet);
    const w = sim.world;
    expect(focusAfterTrack(w)).toBe(1);
    sim.command({ kind: 'leaveTrack' });
    sim.step(1, quiet);
    const t = w.track!;
    expect(t.ended).toBe(true);
    expect(t.endedAt).toBe(24);
    // Left on 2 January 1938: no focus at all (R76a), on its day or after.
    expect(focusAfterTrack(w)).toBe(1);
    for (const h of [0, 23, 24, 8760, FOCUS_YEARS * 8760]) {
      t.endedAt = w.tick - h;
      expect(focusAfterTrack(w)).toBe(1);
    }
    // The last day of 1945 has none; an end on 1 January 1946 has it. The calendar moved so the tick it ended at falls
    // on those days (a unit check of the rule; the starts from 1946 on end the track there).
    const day1938 = w.startDay;
    t.endedAt = 24;
    w.startDay = FOCUS_FROM_DAY - 2;
    expect(focusAfterTrack(w)).toBe(1);
    w.startDay = FOCUS_FROM_DAY - 1;
    expect(focusAfterTrack(w)).toBe(0);
    // The curve, on a calendar far enough into the era that every end below falls in it.
    w.startDay = FOCUS_FROM_DAY + 5000;
    const at = (hours: number): number => {
      t.endedAt = w.tick - hours;
      return focusAfterTrack(w);
    };
    expect(at(23)).toBe(0);
    expect(at(24)).toBeCloseTo(FOCUS_FLOOR + ((1 - FOCUS_FLOOR) * 24) / (FOCUS_YEARS * 8760), 9);
    expect(at(FOCUS_YEARS * 8760 * 0.5)).toBeCloseTo(FOCUS_FLOOR + (1 - FOCUS_FLOOR) * 0.5, 3);
    expect(at(FOCUS_YEARS * 8760)).toBe(1);
    expect(at(FOCUS_YEARS * 8760 * 4)).toBe(1);
    // Monotone between.
    let last = -1;
    for (let h = 0; h <= FOCUS_YEARS * 8760; h += 500) {
      const f = at(h);
      expect(f).toBeGreaterThanOrEqual(last);
      last = f;
    }
    w.startDay = day1938;
  });

  it('the tick the track ended at is saved and loaded; a save that kept no tick has the focus over', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
    sim.step(24, quiet);
    sim.command({ kind: 'leaveTrack' });
    sim.step(30, quiet);
    const bytes = sim.save();
    const back = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
    back.load(bytes);
    expect(back.world.track!.ended).toBe(true);
    expect(back.world.track!.endedAt).toBe(24);
    expect(focusAfterTrack(back.world)).toBe(focusAfterTrack(sim.world));
    back.world.startDay = sim.world.startDay = FOCUS_FROM_DAY - 1;
    expect(focusAfterTrack(back.world)).toBeGreaterThan(0);
    expect(focusAfterTrack(back.world)).toBeLessThan(1);
    expect(focusAfterTrack(back.world)).toBe(focusAfterTrack(sim.world));
    expect(back.hash()).toBe(sim.hash());
    // A save from before R75a: its `ended` slot 1, no tick.
    const t = back.world.track!;
    const [section] = t.serialize();
    const old = Float64Array.from(section!.data as Float64Array);
    old[2] = 1;
    t.deserialize([{ name: TRACK_SECTION, dtype: 'f64', data: old }], back.world.tick);
    expect(t.ended).toBe(true);
    expect(t.endedAt).toBe(-Infinity);
    expect(focusAfterTrack(back.world)).toBe(1);
  });
});
