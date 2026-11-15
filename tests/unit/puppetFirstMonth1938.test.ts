import { describe, expect, it } from 'vitest';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { AUTONOMY_DRIFT, TRIBUTE } from '../../src/sim/systems/puppets';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R84c (ADR-1061; critic run 69, R69-B3: on 37009 France made Germany its puppet in the peace of 1 December
// 1941's first hour, and Germany paid it that month's tribute, of a month it was free). A puppet made in a month's start
// hour has its first month the next: no tribute, drift or other monthly step in that hour.

const id = (t: string): number => TAGS_1938.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const FEB = 31 * 24;
const MAR = FEB + 28 * 24;

describe("a puppet's first month (ROADMAP R84c)", () => {
  it('made in the month-start hour, it pays from the next month', () => {
    const run = (puppet: boolean): Sim => {
      const sim = new Sim({ scenario: '1938', seed: 99, assets: assets1938(SIZE_1938.w) });
      sim.step(FEB, quiet);
      if (puppet) sim.command({ kind: 'createPuppet', overlord: id('GER'), subject: id('AUT'), autonomy: 40 });
      sim.step(1, quiet);
      return sim;
    };
    const a = run(true);
    const b = run(false);
    const nc = a.world.nations.cols;
    const [ger, aus] = [id('GER'), id('AUT')];
    expect(nc.overlord[aus]).toBe(ger);
    expect(nc.puppetAt[aus]).toBe(FEB + 1);
    // Its first month-start hour: no tribute either way, and no drift.
    expect(nc.gold[aus]).toBe(b.world.nations.cols.gold[aus]);
    expect(nc.gold[ger]).toBe(b.world.nations.cols.gold[ger]);
    expect(nc.autonomy[aus]).toBe(40);
    // The next month's: its monthly pass runs (tribute, then the drift taken), its gold less than the month's accounts.
    a.step(MAR - FEB - 1, quiet);
    const s = nc.gold[aus]!;
    a.step(1, quiet);
    const tribute = TRIBUTE * (1 - 40 / 100) * nc.income[aus]!;
    expect(tribute).toBeGreaterThan(0);
    expect(nc.autonomy[aus]).toBeCloseTo(40 + AUTONOMY_DRIFT, 9);
    expect(nc.gold[aus]! - s).toBeLessThan(nc.income[aus]! - nc.expenses[aus]! - tribute / 2);
  });
});
