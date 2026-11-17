import { describe, expect, it } from 'vitest';
import { tellMassingsOff } from '../../src/sim/ai/massing';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { massOffBreaks } from '../helpers/diploInvariants';
import { nationId } from '../helpers/sim1938';

// ROADMAP R134 (critic run 75, R75-N3): seed 58619, day 884: France's massing on Germany ran out its days at hour 0 and
// was told called off; in that hour France joined a war on Germany by another door, and History had "called off" and
// the war under one date (and France's massing on Switzerland called off a row above Switzerland's annexation). A
// call-off is told at the tick's end (`tellMassingsOff`), when its nation is not at war with the target by then, both
// living. The checker (`massOffBreaks`, run by diploInvariants on every hour) holds it.

const { w: W } = SIZE_1938;
const [FRA, GER, SWI] = ['FRA', 'GER', 'SWI'].map(nationId) as [number, number, number];
const offs = (w: World): number[][] => {
  const out: number[][] = [];
  for (let i = 0; i < w.out.events.length; i += 6) if (w.out.events[i + 1] === EventKind.MassingCalledOff) out.push([w.out.events[i + 2]!, w.out.events[i + 3]!]);
  return out;
};

describe('a massing called off is told at the tick\'s end, if no war on its target by then (ROADMAP R134)', () => {
  it('told with no war; not told when its nation went to war with the target in the hour, or the target died', () => {
    const w = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }).world;
    w.out.events.length = 0;
    w.massOff.push({ n: FRA, t: GER, x: 1, y: 1 });
    tellMassingsOff(w);
    expect(offs(w)).toEqual([[FRA, GER]]);
    expect(w.massOff).toEqual([]);
    expect(massOffBreaks(w, w.out.events)).toEqual([]);

    w.out.events.length = 0;
    w.massOff.push({ n: FRA, t: GER, x: 1, y: 1 }, { n: FRA, t: SWI, x: 1, y: 1 });
    declareWar(w, GER, FRA);
    w.nations.cols.living[SWI] = 0;
    tellMassingsOff(w);
    expect(offs(w)).toEqual([]);
  }, 300_000);

  it("the checker breaks on a call-off told in an hour whose end has the war, or a dead target (R129's order)", () => {
    const w = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }).world;
    declareWar(w, GER, FRA);
    w.nations.cols.living[SWI] = 0;
    const events = [w.tick, EventKind.MassingCalledOff, FRA, GER, 1, 1, w.tick, EventKind.MassingCalledOff, FRA, SWI, 1, 1];
    expect(massOffBreaks(w, events)).toEqual(["massing: FRA's on GER called off, and at war with it at the hour's end", "massing: FRA's on SWI called off, one of the two dead"]);
  }, 300_000);
});
