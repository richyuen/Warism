import { describe, expect, it } from 'vitest';
import { capitalCell } from '../../src/sim/systems/capitals';
import { destroyFormation } from '../../src/sim/systems/elements';
import { declareWar } from '../../src/sim/systems/war';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { FlipCause, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R87a (ADR-1071; critic run 72, R72-N1): a capital moved by capture never went back. The Soviet Union sat at
// Tashkent from October 1941 to 1991 in the replay, France at Cayenne. Once a day a nation goes back to its home city
// (the seat its scenario set) when it owns and controls it and no enemy's land lies within CAPITAL_SAFE_STEPS.

const id = (t: string): number => TAGS_1938.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const world1938 = (): Sim => {
  const s = new Sim({ scenario: '1938', seed: 7, assets: assets1938(SIZE_1938.w) });
  s.world.settings.aiEnabled = false;
  return s;
};
const give = (w: World, cell: number, to: number): void => {
  w.setOwner(cell, to);
  w.setController(cell, to, false, FlipCause.peace);
};

describe('a capital goes back to its home city (ROADMAP R87a)', () => {
  it('the seat a loss moved returns at the next midnight once the city is the nation’s again', () => {
    const sim = world1938();
    const w = sim.world;
    const sov = id('SOV');
    const home = w.nations.cols.homeCity[sov]!;
    expect(home).toBeGreaterThan(0);
    expect(w.cities.cols.capitalOf[home]).toBe(sov);
    const moscow = w.cities.cols.cell[home]!;
    give(w, moscow, id('POL'));
    sim.step(1, quiet);
    expect(w.cities.cols.capitalOf[home]).toBe(0);
    expect(capitalCell(w, sov)).not.toBe(moscow);
    expect(w.nations.cols.homeCity[sov]).toBe(home); // a loss keeps the home
    give(w, moscow, sov);
    sim.step(24, quiet);
    expect(w.cities.cols.capitalOf[home]).toBe(sov);
    expect(capitalCell(w, sov)).toBe(moscow);
    // Saved and loaded with the world.
    const other = world1938();
    other.load(sim.save());
    expect(other.world.nations.cols.homeCity[sov]).toBe(home);
  });

  it('not while an enemy holds land within reach of it', () => {
    const sim = world1938();
    const w = sim.world;
    const sov = id('SOV');
    const ger = id('GER');
    const home = w.nations.cols.homeCity[sov]!;
    const moscow = w.cities.cols.cell[home]!;
    give(w, moscow, id('POL'));
    sim.step(1, quiet);
    give(w, moscow, sov);
    expect(declareWar(w, ger, sov)).not.toBeNull();
    // A German cell beside Moscow, and no Soviet army to take it back.
    w.formations.forEach((f) => {
      if (w.formations.cols.nation[f] === sov) destroyFormation(w, f);
    });
    const next = moscow + 1;
    give(w, next, ger);
    sim.step(48, quiet);
    expect(w.cities.cols.capitalOf[home]).toBe(0);
    // The cell given back, the war on but the enemy far off: home.
    give(w, next, sov);
    sim.step(24, quiet);
    expect(w.wars.atWar(ger, sov)).toBe(true);
    expect(w.cities.cols.capitalOf[home]).toBe(sov);
  });
});
