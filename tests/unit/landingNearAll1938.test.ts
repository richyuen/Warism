import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R25c (critic run 37, R37-N1): the whole click re-clicked two cells south of Shanghai: the
// one aboard was told 18 (true), the three walking to their convoy 6, "no transports … with room",
// while each kept its transports and landed with them: four "not done" rows for an order that changed
// nothing. A click near their landing is now their landing (R25a, `sameLanding` for a bound division
// too): no refusal, and the four land together. Japan at war with China, its four divisions nearest
// Tokyo to Shanghai by one click (escort on); at hour 26 all four clicked again near it.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

function run(dx: number, dy: number): void {
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
  const refused = new Set<number>();
  const landed = new Map<number, number>();
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.MoveRejected && four.includes(ev[i + 2]!)) refused.add(ev[i + 2]!);
        if (ev[i + 1] === EventKind.FormationLanded && four.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  while (w.tick < 26) step();
  const place = new Map(four.map((id) => [id, w.embarked.get(id)?.fleet ?? w.seaFetch.get(id)]));
  expect(four.filter((id) => w.seaFetch.has(id) && !w.embarked.has(id)).length, 'some walking to their convoy').toBeGreaterThan(0);
  for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0] + dx, y: SHANGHAI[1] + dy, nation: JAP, escort: true });
  step();
  expect([...refused], 'none refused').toEqual([]);
  for (const id of four) expect(w.embarked.get(id)?.fleet ?? w.seaFetch.get(id), `${id} keeps its transports`).toBe(place.get(id));
  for (let h = 0; h < 24 * 80 && landed.size < 4; h++) step();
  process.stderr.write(`R25c (${dx}, ${dy}): refused ${[...refused]}, landed ${[...landed.values()]}\n`);
  expect(landed.size, 'all four landed').toBe(4);
  expect(Math.max(...landed.values()) - Math.min(...landed.values()), 'together').toBeLessThanOrEqual(24);
}

describe('a near re-click of the whole click is no refusal (ROADMAP R25c)', () => {
  it.each([
    [0, 2],
    [-2, 2],
  ])("Japan's four to Shanghai, all four clicked again (%i, %i) cells off: none refused, each keeps its transports; the four land together", (dx, dy) => {
    run(dx, dy);
  });
});
