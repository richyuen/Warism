import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R23b (critic run 35, R35-B1): the division waiting aboard clicked to the same landing
// again went ashore (R22b), was bound anew to the transports another division of the click was
// walking to, and boarded them first: that one found no room at Tokyo and waited on the quay for
// weeks while the rest landed. The critic's case: Japan at war with China, its four divisions
// nearest Tokyo sent to Shanghai by one click (the escort asked for, as the panel's box is ticked);
// the first aboard clicked to Shanghai again. Now it stays aboard; the four land together, no later
// than without the second click.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

interface Run {
  landed: number[];
  refused: number;
  quay: number;
}

function shanghai(again: boolean): Run {
  const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = sim.world;
  w.settings.player = JAP;
  if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  sim.step(1);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
  for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
  const run: Run = { landed: [], refused: 0, quay: 0 };
  const landed = new Map<number, number>();
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.MoveRejected && four.includes(ev[i + 2]!)) run.refused++;
        if (ev[i + 1] === EventKind.FormationLanded && four.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  let first = 0;
  for (let h = 0; h < 24 * 10 && first === 0; h++) {
    step();
    first = four.find((id) => w.embarked.has(id)) ?? 0;
  }
  expect(first, 'one aboard').not.toBe(0);
  const was = { ...w.embarked.get(first)! };
  if (again) {
    sim.command({ kind: 'moveFormation', id: first, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
    step();
    expect(w.embarked.get(first), 'still aboard, in its place').toEqual(was);
  }
  // Each hour, a division of the four bound for transports that have sailed with others aboard is left on the quay.
  for (let h = 0; h < 24 * 80 && landed.size < 4; h++) {
    step();
    for (const id of four) {
      const g = w.seaFetch.get(id);
      if (g !== undefined && c.moving[g] === 1 && [...w.embarked.values()].some((e) => e.fleet === g)) run.quay++;
    }
  }
  run.landed = [...landed.values()];
  return run;
}

describe('ordered to its landing again, the division aboard stays (ROADMAP R23b)', () => {
  it("Japan's four to Shanghai, the one aboard clicked to Shanghai again: none left on the quay; landed together, no later", () => {
    const plain = shanghai(false);
    const run = shanghai(true);
    process.stderr.write(`R23b: once ${plain.landed}; clicked again ${run.landed} (left on the quay ${run.quay} h)\n`);
    expect(plain.landed).toHaveLength(4);
    expect(run.landed, 'all four landed').toHaveLength(4);
    expect(run.refused, 'not refused').toBe(0);
    expect(run.quay, 'none left on the quay while its transports sail').toBe(0);
    expect(Math.max(...run.landed) - Math.min(...run.landed), 'together').toBeLessThanOrEqual(24);
    expect(Math.max(...run.landed), 'no later than clicked once').toBeLessThanOrEqual(Math.max(...plain.landed) + 24);
  });
});
