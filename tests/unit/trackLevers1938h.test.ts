import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62f (SPEC §7.7 "historical arrivals of forces and phase buffs"): a `buff` granted on its hour until its
// date; `forces` set down on their hour; a war's and a join's `without` leave those puppets neutral.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const TL: TimelineFile = {
  events: [
    { date: '1938-01-02', kind: 'buff', nation: 'GER', buff: 'attack', magnitude: 0.3, until: '1938-01-05' },
    { date: '1938-01-02', hour: 3, kind: 'forces', nation: 'GER', template: 'infantry_div', count: 3, at: [13.4, 52.5] },
    { date: '1938-01-03', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-03', hour: 1, kind: 'join', nation: 'ENG', beside: 'POL', against: 'GER', without: ['IRE', 'EGY'] },
  ],
};

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the historical track's levers (ROADMAP R62f)", () => {
  it('a buff on its hour until its date; forces set down on theirs; a join without the puppets it names', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TL);
    const w = sim.world;
    const GER = id('GER');
    sim.step(24, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBe(0);
    let skipped = 0;
    const count = (): number => {
      let n = 0;
      w.formations.forEach((f) => {
        if (w.formations.cols.nation[f] === GER) n++;
      });
      return n;
    };
    const before = count();
    sim.step(1, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBeCloseTo(0.3, 12);
    sim.step(3, quiet);
    expect(count()).toBe(before + 3);
    sim.step(48, (x) => {
      for (let i = 0; i < x.out.events.length; i += 6) if (x.out.events[i + 1] === EventKind.TrackSkipped) skipped++;
      quiet(x);
    });
    expect(skipped).toBe(0);
    const war = w.wars.between(GER, id('POL'))!.war;
    expect(war.sides[1]).toContain(id('ENG'));
    expect(war.sides[1]).toContain(id('AST'));
    expect(war.sides[1]).not.toContain(id('IRE'));
    expect(war.sides[1]).not.toContain(id('EGY'));
    // Its date: the buff is over.
    while (sim.tick <= 4 * 24) sim.step(1, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBe(0);
  });
});
