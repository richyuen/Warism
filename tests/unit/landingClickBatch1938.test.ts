import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R29a (critic run 40, R40-B2): the game applied each selected division's order at once, one
// at a time (one `hud.command` each, `now`), so R28a's whole-click judgement (`noteLeaving`) and
// R27c's `tellLandingsLeft` saw one division at a time: the four of a landing re-clicked three cells
// south-west were told, all but the last, "the rest keep the old landing", and landed together. A
// click's orders now reach the worker as one message (`cmds`, `Hud.commands`) and are applied
// together. Driven here as the page drives the worker: seed 3517, Japan at war with China, its
// divisions nearest Tokyo sent to Shanghai by one click (escort on); two hours after the first
// boards, some of them clicked again.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

interface Game {
  server: SimServer;
  ids: number[];
  news: OrderNews[];
  landed: Map<number, number>;
  refused: Set<number>;
  step: () => void;
  /** One click of the map on (`x`, `y`) with `ids` selected, as `Player` sends it. */
  click: (ids: number[], x: number, y: number) => void;
}

function start(n: number): Game {
  const news: OrderNews[] = [];
  const s = new SimServer((m: FromWorker) => {
    if (m.type === 'orderNews') news.push(m.news);
  });
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 3517, assets: assets1938(W) } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
  const w = s.sim!.world;
  if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
  const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
  const landed = new Map<number, number>();
  const refused = new Set<number>();
  let ids: number[] = [];
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (!ids.includes(ev[i + 2]!)) continue;
        if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
        if (ev[i + 1] === EventKind.MoveRejected) refused.add(ev[i + 2]!);
      }
      drain(x);
    });
  step();
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  ids = all.sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  const click = (sel: number[], x: number, y: number): void => {
    const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
  };
  click(ids, ...SHANGHAI);
  for (let h = 0; h < 24 * 10 && !ids.some((id) => atItsPort(w, id)); h++) step();
  // ROADMAP R33b: a landing's divisions wait at its port ashore (ADR-830): the first at its port.
  expect(ids.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
  step();
  step();
  news.length = 0;
  return { server: s, ids, news, landed, refused, step, click };
}

const told = (g: Game): number[] => g.news.filter((n) => n.kind === 'leftLanding').map((n) => n.id);

/** Steps until `ids` have landed, or 90 days. */
function land(g: Game, ids: number[]): void {
  for (let h = 0; h < 24 * 90 && ids.some((id) => !g.landed.has(id)); h++) g.step();
}

describe("a click's orders are applied together, as the game sends them (ROADMAP R29a)", () => {
  it('the four re-clicked three cells south-west by one click: nobody told it leaves the landing; none refused, they land together', () => {
    const g = start(4);
    g.click(g.ids, SHANGHAI[0] - 3, SHANGHAI[1] + 3);
    expect(told(g), 'nobody told (red: all but the last)').toEqual([]);
    land(g, g.ids);
    process.stderr.write(`R29a four: landed ${[...g.landed]}, news ${JSON.stringify(g.news.map((n) => [n.kind, n.id]))}\n`);
    expect(told(g), 'nobody told').toEqual([]);
    expect([...g.refused], 'none refused').toEqual([]);
    expect(g.landed.size, 'all four landed').toBe(4);
    const at = [...g.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
  }, 300_000);

  it('the two re-sent to Fuzhou by one click: nobody told; they land together, about as soon as from a standing start', () => {
    const g = start(2);
    g.click(g.ids, ...FUZHOU);
    land(g, g.ids);
    process.stderr.write(`R29a two: landed ${[...g.landed]}, news ${JSON.stringify(g.news.map((n) => [n.kind, n.id]))}\n`);
    expect(told(g), 'nobody told (red: the first)').toEqual([]);
    expect([...g.refused], 'none refused').toEqual([]);
    const at = [...g.landed.values()];
    expect(at.length, 'both landed').toBe(2);
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
    expect(Math.max(...at), 'about as soon as from a standing start (h657)').toBeLessThanOrEqual(750);
  }, 300_000);

  it('of three, the two sent to Fuzhou by one click: both told, as the third keeps the landing; the two land together', () => {
    const g = start(3);
    const two = g.ids.slice(0, 2);
    g.click(two, ...FUZHOU);
    expect(told(g).sort((a, b) => a - b), 'both told').toEqual([...two].sort((a, b) => a - b));
    land(g, two);
    const at = two.map((id) => g.landed.get(id));
    process.stderr.write(`R29a three: landed ${[...g.landed]}\n`);
    expect(at.every((t) => t !== undefined), 'both landed').toBe(true);
    expect(Math.abs(at[0]! - at[1]!), 'together').toBeLessThanOrEqual(24);
  }, 300_000);
});
