import { describe, expect, it } from 'vitest';
import { INVADED_WEIGHT, SHIFT_PROBE } from '../../src/sim/ai/operational';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R98c (ADR-1090, the user's choice): of two fronts, the one where the enemy stands on the planner's own
// land has the more of its army. The war the user asked of: Germany's on Poland by God Mode on the first day, France
// joining at once. Before, half Germany's army stood at each front, and after a month Poland held 328 cells of
// Germany's (seed 1938; 210 to 218 on seeds 7, 99 and 4483).

const W = SIZE_1938.w;
const [GER, POL, FRA] = ['GER', 'POL', 'FRA'].map(nationId) as [number, number, number];

/** Germany's war on Poland after 30 days: [cells of Germany's that Poland holds, of Germany's that France holds, of France's that Germany holds]. */
function month(weight: number | undefined): [number, number, number] {
  if (weight === undefined) delete SHIFT_PROBE.weight;
  else SHIFT_PROBE.weight = weight;
  try {
    const s = new Sim({ scenario: '1938', seed: 1938, assets: assets1938(W) });
    s.command({ kind: 'declareWar', attacker: GER, defender: POL });
    for (let d = 0; d < 30; d++) {
      s.step(24, (w) => {
        w.out.events.length = 0;
        w.out.fires.length = 0;
      });
    }
    const { owner, controller } = s.world.cells;
    let [pol, fra, ger] = [0, 0, 0];
    for (let c = 0; c < owner.length; c++) {
      if (owner[c] === GER && controller[c] === POL) pol++;
      if (owner[c] === GER && controller[c] === FRA) fra++;
      if (owner[c] === FRA && controller[c] === GER) ger++;
    }
    expect(s.world.wars.atWar(GER, FRA), 'France is in the war').toBe(true);
    return [pol, fra, ger];
  } finally {
    delete SHIFT_PROBE.weight;
  }
}

describe('the invaded front has the more of the army (ROADMAP R98c)', () => {
  it("Germany against Poland and France: under half the land lost to Poland, none more to France, no less of France's taken", () => {
    expect(INVADED_WEIGHT).toBeGreaterThan(1);
    const before = month(1);
    const now = month(undefined);
    process.stderr.write(`Germany's cells held by Poland ${before[0]} -> ${now[0]}, by France ${before[1]} -> ${now[1]}; France's held by Germany ${before[2]} -> ${now[2]}\n`);
    // The measure of the rule's absence is a war Germany loses in the east.
    expect(before[0]).toBeGreaterThan(150);
    expect(now[0]).toBeLessThan(before[0] / 2);
    expect(now[1]).toBeLessThanOrEqual(before[1]);
    expect(now[2]).toBeGreaterThanOrEqual(before[2]);
  }, 240_000);
});
