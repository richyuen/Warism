import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { isBound, landingId, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R24a (critic run 36, R36-B1): a refused order cleared the binding of a division walking to
// its convoy (or waiting at its port), so it was dropped from its landing and stood at Tokyo for
// good; with the whole click re-clicked a cell off Shanghai and all four refused, the convoy sailed
// with the one aboard alone. The critic's case: Japan at war with China, its four divisions nearest
// Tokyo to Shanghai by one click (escort on); at hour 26 a walking one ordered onto the open sea, or
// all four clicked one cell east of Shanghai. Now a refused order leaves each as it was, and the
// four land together.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const OPEN_SEA = cellOf(150, 30, W, H) as [number, number];

function run(again: 'walker-sea' | 'all-east'): void {
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
  // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
  // of its own there, a sibling): this test's one landing at Tokyo.
  nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 4, 6]);
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
  const place = new Map(four.map((id) => [id, landingId(w, id)]));
  expect(four.filter((id) => isBound(w, id) && w.formations.cols.moving[id] === 1).length, 'some walking to their convoy').toBeGreaterThan(0);
  if (again === 'walker-sea') {
    const walker = four.find((id) => isBound(w, id) && w.formations.cols.moving[id] === 1)!;
    sim.command({ kind: 'moveFormation', id: walker, x: OPEN_SEA[0], y: OPEN_SEA[1], nation: JAP, escort: true });
  } else for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0] + 1, y: SHANGHAI[1], nation: JAP, escort: true });
  step();
  for (const id of refused) expect(landingId(w, id), `${id}, refused, keeps its landing`).toBe(place.get(id));
  for (let h = 0; h < 24 * 80 && landed.size < 4; h++) step();
  process.stderr.write(`R24a ${again}: refused ${[...refused]}, landed ${[...landed.values()]}\n`);
  expect(landed.size, 'all four landed').toBe(4);
  expect(Math.max(...landed.values()) - Math.min(...landed.values()), 'together').toBeLessThanOrEqual(24);
}

describe('a refused order leaves every division its landing (ROADMAP R24a)', () => {
  it("Japan's four to Shanghai, one walking to its port ordered onto the open sea: refused, still bound; the four land together", () => {
    run('walker-sea');
  });
  it("Japan's four to Shanghai, all four clicked a cell east of it: none left out; the four land together", () => {
    run('all-east');
  });
});
