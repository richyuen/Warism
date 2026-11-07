import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind, RejectReason } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { LandingState, landingOfDivision, seaHint } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R33c (ADR-830): a landing at sea is ordered as one. Seed 3517, Japan's two nearest Tokyo sent to
// Shanghai by a click (escort on); a day after it sails:
// - one of the two ordered to Fuzhou alone: refused `AtSea` ("select all of the landing"; before, `Aboard`'s
//   "takes no order until it lands", false for a whole landing), the page told; both land at Shanghai together;
// - the map's hint over Fuzhou for the one at sea marks a landing (R43-N4: none for a division at sea);
// - both ordered to Fuzhou by one click: taken, both land there together.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

function atSea(both: boolean): { news: OrderNews[]; landed: Map<number, number>; pair: number[]; marks: number; w: World } {
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
  let pair: number[] = [];
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationLanded && pair.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
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
  pair = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
  // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
  // of its own there, a sibling): this test's one landing at Tokyo.
  nearPort(w, pair, portNamed(w, 'Tokyo'), [0, 4]);
  const click = (sel: number[], x: number, y: number): void => {
    const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
  };
  click(pair, ...SHANGHAI);
  const sailing = (): boolean => pair.every((id) => w.embarked.has(id) && landingOfDivision(w, id)?.state === LandingState.sailing);
  for (let h = 0; h < 24 * 60 && !sailing(); h++) step();
  expect(sailing(), 'the two at sea').toBe(true);
  for (let h = 0; h < 24; h++) step();
  expect(landed.size, 'not landed yet').toBe(0);
  const marks = seaHint(w, [pair[0]!], ...FUZHOU).marks.length;
  news.length = 0;
  click(both ? pair : [pair[0]!], ...FUZHOU);
  for (let h = 0; h < 24 * 60 && landed.size < 2; h++) step();
  return { news, landed, pair, marks, w };
}

describe('a landing at sea is ordered as one (ROADMAP R33c)', () => {
  it('one of the two at sea ordered to Fuzhou: refused, told to order the whole landing; the two land at Shanghai together; its hint marks a landing', () => {
    const r = atSea(false);
    expect(r.marks, 'a mark for the one at sea (R43-N4)').toBe(1);
    const told = r.news.filter((n) => n.kind === 'refused').map((n) => [n.id, n.reason]);
    expect(told, 'refused AtSea, told').toEqual([[r.pair[0], RejectReason.AtSea]]);
    expect(r.landed.size, 'both landed').toBe(2);
    const at = [...r.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
    for (const id of r.pair) expect(Math.hypot(r.w.formations.cols.x[id]! - SHANGHAI[0], r.w.formations.cols.y[id]! - SHANGHAI[1]), `${id} at Shanghai`).toBeLessThan(15);
  }, 300_000);

  it('both at sea ordered to Fuzhou by one click: taken; they land there together', () => {
    const r = atSea(true);
    expect(r.news.filter((n) => n.kind === 'refused'), 'none refused').toEqual([]);
    expect(r.landed.size, 'both landed').toBe(2);
    const at = [...r.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
    for (const id of r.pair) expect(Math.hypot(r.w.formations.cols.x[id]! - FUZHOU[0], r.w.formations.cols.y[id]! - FUZHOU[1]), `${id} at Fuzhou`).toBeLessThan(15);
  }, 300_000);
});
