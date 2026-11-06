import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision, seaHint } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R36b (critic run 44, R44-B2): all of a landing at sea clicked onto the sea was taken as a cancel: it
// sailed home and was refused `OpenSea` a day later at its port, the invasion thrown away. Seed 3517, Japan's two
// nearest Tokyo sent to Shanghai by one click (escort on); a day after it sails, both clicked onto the sea: its
// own water, one cell off the beach, the open sea east, the Yellow Sea. Each: the hover says why (`seaHint` 3),
// both refused `OpenSea` at the click, the landing keeps its course, both land at Shanghai together.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

interface Base {
  bytes: Uint8Array;
  pair: number[];
  waters: [string, number, number][];
}

let base: Base | null = null;

function atSea(): Base {
  if (base) return base;
  const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
  const w = sim.world;
  const quiet = (x: World): void => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: JAP });
  sim.step(1, quiet);
  if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  sim.step(1, quiet);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const pair = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
  for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true } as Command);
  sim.applyNow(quiet);
  const sailing = (): boolean => pair.every((id) => w.embarked.has(id) && landingOfDivision(w, id)?.state === LandingState.sailing);
  for (let h = 0; h < 24 * 60 && !sailing(); h++) sim.step(1, quiet);
  expect(sailing(), 'the two at sea').toBe(true);
  sim.step(24, quiet);
  const own = landingOf(w, Math.floor(SHANGHAI[1]) * W + Math.floor(SHANGHAI[0]))!.water;
  const waters: [string, number, number][] = [
    ['its own water', (own % W) + 0.5, Math.floor(own / W) + 0.5],
    ['a cell off the beach', 1718.5, 413.5],
    ['the open sea east', 1730.5, 413.5],
    ['the Yellow Sea', 1703.5, 373.5],
  ];
  base = { bytes: sim.save(), pair, waters };
  return base;
}

describe('a landing at sea clicked onto the sea is refused at the click and keeps its course (ROADMAP R36b)', () => {
  for (const k of [0, 1, 2, 3]) {
    it(`water ${k}: the hover says why; both refused OpenSea at the click; they land at Shanghai together`, () => {
      const b = atSea();
      const [name, x, y] = b.waters[k]!;
      const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
      sim.load(b.bytes);
      const w = sim.world;
      const c = w.formations.cols;
      expect(seaHint(w, b.pair, x, y).how, `${name}: the hover's answer`).toBe(3);
      const id0 = landingOfDivision(w, b.pair[0]!)!.id;
      const refused: [number, number, number][] = [];
      const landed = new Map<number, number>();
      const take = (x: World): void => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (!b.pair.includes(ev[i + 2]!)) continue;
          if (ev[i + 1] === EventKind.MoveRejected) refused.push([ev[i + 2]!, ev[i + 4]!, x.tick]);
          if (ev[i + 1] === EventKind.FormationLanded && !landed.has(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
        }
        ev.length = 0;
        x.out.fires.length = 0;
      };
      const t = w.tick;
      for (const id of b.pair) sim.command({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true } as Command);
      sim.applyNow(take);
      expect(refused.map(([id, why]) => [id, why]), `${name}: refused at the click`).toEqual(b.pair.map((id) => [id, RejectReason.OpenSea]));
      expect(refused.every(([, , at]) => at === t), 'in the click\'s hour').toBe(true);
      const l = landingOfDivision(w, b.pair[0]!)!;
      expect([l.id, l.state], 'the landing keeps its course').toEqual([id0, LandingState.sailing]);
      for (let h = 0; h < 24 * 30 && landed.size < 2; h++) sim.step(1, take);
      expect(landed.size, `${name}: both landed`).toBe(2);
      const at = [...landed.values()];
      expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
      for (const id of b.pair) expect(Math.hypot(c.x[id]! - SHANGHAI[0], c.y[id]! - SHANGHAI[1]), `${id} at Shanghai`).toBeLessThan(15);
    }, 300_000);
  }
});

// ROADMAP R38f (critic run 45, R45-N3): a sea hover with a gathering landing's divisions, or land formations in no
// landing, selected said nothing. Seed 3517: the two nearest Tokyo sent to Shanghai, an hour on (ashore, gathering),
// and the third nearest in no landing; over the open sea: the hover says a click there is refused (`ashore`,
// `plain`), and the third, clicked there, is refused `OpenSea`.
describe('a sea hover with a gathering landing or a land selection says a click there is refused (ROADMAP R38f)', () => {
  it('the hover answers 3 (ashore; plain), and the plain click is refused OpenSea', () => {
    const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
    const w = sim.world;
    const refused: [number, number][] = [];
    const quiet = (x: World): void => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected) refused.push([ev[i + 2]!, ev[i + 4]!]);
      ev.length = 0;
      x.out.fires.length = 0;
    };
    sim.command({ kind: 'setPlayer', nation: JAP });
    sim.step(1, quiet);
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    sim.step(1, quiet);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 3).map((d) => d[0]);
    const [pair, third] = [ids.slice(0, 2), ids[2]!];
    for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true } as Command);
    sim.applyNow(quiet);
    sim.step(1, quiet);
    expect(pair.every((id) => landingOfDivision(w, id)?.state === LandingState.gathering && !w.embarked.has(id)), 'gathering, ashore').toBe(true);
    const [x, y] = [1730.5, 413.5];
    const a = seaHint(w, pair, x, y);
    expect([a.how, a.ashore], 'a gathering landing: refused, ashore').toEqual([3, true]);
    const p = seaHint(w, [third], x, y);
    expect([p.how, p.plain], 'a land selection: refused, plain').toEqual([3, true]);
    refused.length = 0;
    sim.command({ kind: 'moveFormation', id: third, x, y, nation: JAP, escort: true } as Command);
    sim.applyNow(quiet);
    sim.step(1, quiet);
    expect(refused.filter(([id]) => id === third).map(([, why]) => why), 'the plain click refused OpenSea').toEqual([RejectReason.OpenSea]);
  }, 300_000);
});
