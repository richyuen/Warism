import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R23a (critic run 35, R35-B2): a refused order took the division waiting aboard off its
// transports. The critic's case: Japan at war with China, its four divisions nearest Tokyo sent to
// Shanghai by one click; the first boards at Tokyo and waits for the rest. Ordered then onto the open
// sea, or onto Calais (France at peace), it is refused (R22g's `OpenSea`, R20's `Neutral`) and was
// left ashore at Tokyo, out of the landing. Now it stays aboard, and the four land together.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const OPEN_SEA = cellOf(150, 30, W, H) as [number, number];
const CALAIS = cellOf(1.86, 50.95, W, H) as [number, number];

function refusedAboard(to: [number, number], why: number): void {
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
  for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP });
  const refused: number[] = [];
  const landed = new Map<number, number>();
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.MoveRejected && four.includes(ev[i + 2]!)) refused.push(ev[i + 2]!, ev[i + 4]!);
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
  const place = [c.x[first], c.y[first]];
  expect(four.some((id) => !w.embarked.has(id)), 'another still to come').toBe(true);

  sim.command({ kind: 'moveFormation', id: first, x: to[0], y: to[1], nation: JAP });
  step();
  expect(refused, 'refused, and why').toEqual([first, why]);
  expect(w.embarked.get(first), 'still aboard, for its landing').toEqual(was);
  expect([c.x[first], c.y[first]], 'where it was').toEqual(place);

  for (let h = 0; h < 24 * 70 && landed.size < 4; h++) step();
  expect([...landed.keys()].sort(), 'all four landed').toEqual([...four].sort());
  expect(Math.max(...landed.values()) - Math.min(...landed.values()), 'together').toBeLessThanOrEqual(24);
}

describe('a refused order leaves the division aboard (ROADMAP R23a)', () => {
  it('the first of four aboard at Tokyo, ordered onto the open sea: refused, still aboard; the four land together', () => {
    refusedAboard(OPEN_SEA, RejectReason.OpenSea);
  });
  it('ordered onto Calais, France at peace: refused, still aboard; the four land together', () => {
    refusedAboard(CALAIS, RejectReason.Neutral);
  });
});
