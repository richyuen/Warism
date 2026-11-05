import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import type { FromWorker } from '../../src/shared/protocol';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R29b (critic run 40, R40-B1): a landing redirected to a target another convoy already loads
// for. Seed 3517, Japan at war with China: its two divisions nearest Tokyo sent to Shanghai by a click
// (escort on); two hours after the first boards at Tokyo, a fresh division (the third nearest) is sent
// to Fuzhou, which makes a convoy at another port, then the two are sent there too. The one aboard was
// put ashore and bound for that convoy, and walked there for weeks while its own transports, called
// for the second, sailed there empty: one landed at h657, the others at h1291. Now its own transports
// take it there aboard (`sailAboard`), and the three land together. Driven as the page drives the
// worker (`cmds`, applied at once).

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

type Then = 'recall' | 'reclick' | null;

function run(gap: number, then: Then = null): { landed: Map<number, number>; walked: boolean; refused: number[]; ids: number[]; panel: string | undefined; where: Map<number, number> } {
  // Refusals as the page is told them (`orderNews`): at the click, applied at once, as well as later.
  const refused: number[] = [];
  const s = new SimServer((m: FromWorker) => {
    if (m.type === 'orderNews' && m.news.kind === 'refused') refused.push(m.news.id);
  });
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 3517, assets: assets1938(W) } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
  const w = s.sim!.world;
  if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
  const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
  const landed = new Map<number, number>();
  let boarded = false;
  let ids: number[] = [];
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (!ids.includes(ev[i + 2]!)) continue;
        if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
        if (ev[i + 1] === EventKind.FormationEmbarked) boarded = true;
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
  ids = all.sort((a, b) => a[1] - b[1]).slice(0, 3).map((d) => d[0]);
  const [pair, fresh] = [ids.slice(0, 2), ids[2]!];
  const click = (sel: number[], x: number, y: number): void => {
    const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
  };
  click(pair, ...SHANGHAI);
  for (let h = 0; h < 24 * 10 && !boarded; h++) step();
  expect(boarded, 'the first boards').toBe(true);
  step();
  step();
  const first = pair.find((id) => w.embarked.has(id))!;
  expect(first, 'one aboard').toBeDefined();
  click([fresh], ...FUZHOU);
  for (let h = 0; h < gap; h++) step();
  click(pair, ...FUZHOU);
  // Its panel while its transports sail to the convoy's port (ROADMAP R30c).
  const panel = (s as unknown as { voyageOf(w: World, id: number): { state: string } | null }).voyageOf(w, first)?.state;
  // ROADMAP R30b (critic run 41, R41-N2, R40-N1): four hours later the two clicked back onto Shanghai (the
  // redirect undone), or onto Fuzhou again (the landing it has).
  if (then !== null) {
    for (let h = 0; h < 4; h++) step();
    click(pair, ...(then === 'recall' ? SHANGHAI : FUZHOU));
  }
  // The one aboard is never ashore before its landing: aboard, not marching to a port (red: it walked ~50 days).
  let walked = false;
  for (let h = 0; h < 24 * 90 && ids.some((id) => !landed.has(id)); h++) {
    if (!landed.has(first) && !w.embarked.has(first)) walked = true;
    step();
  }
  const where = new Map(ids.map((id) => [id, Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)]));
  process.stderr.write(`R29b gap ${gap} ${then}: first ${first}, panel ${panel}, walked ${walked}, refused ${refused}, landed ${[...landed]}\n`);
  return { landed, walked, refused, ids, panel, where };
}

describe('a landing redirected to a convoy loading elsewhere: the one aboard goes on its own transports (ROADMAP R29b)', () => {
  for (const gap of [0, 1]) {
    it(`the fresh one sent to Fuzhou ${gap === 0 ? 'in the same hour as' : 'an hour before'} the two: the one aboard stays aboard; the three land together`, () => {
      const r = run(gap);
      expect(r.refused, 'none refused').toEqual([]);
      expect(r.walked, 'the one aboard never walks (red: ~50 days to Sasebo)').toBe(false);
      expect(r.landed.size, 'all three landed').toBe(3);
      const at = [...r.landed.values()];
      expect(Math.max(...at) - Math.min(...at), 'together (red: h657 and h1291)').toBeLessThanOrEqual(24);
      expect(Math.max(...at), 'about as soon as the three from a standing start (h976)').toBeLessThanOrEqual(1000);
      expect(r.panel, 'its panel: aboard, sailing to the port for the rest (red: "At sea, bound for its landing")').toBe('toPortAboard');
    }, 300_000);
  }

  it('the two clicked back onto Shanghai four hours later: none refused, both land at Shanghai together (red: the one aboard refused at sea, lands at Fuzhou)', () => {
    const r = run(0, 'recall');
    const pair = r.ids.slice(0, 2);
    expect(r.refused, 'none refused').toEqual([]);
    const at = pair.map((id) => r.landed.get(id));
    expect(at.every((t) => t !== undefined), 'both landed').toBe(true);
    expect(Math.abs(at[0]! - at[1]!), 'together').toBeLessThanOrEqual(24);
    const [sx, sy] = [Math.floor(SHANGHAI[0]), Math.floor(SHANGHAI[1])];
    for (const id of pair) {
      const cell = r.where.get(id)!;
      expect(Math.hypot((cell % W) - sx, Math.floor(cell / W) - sy), `${id} at Shanghai`).toBeLessThan(15);
    }
  }, 300_000);

  it('the two clicked onto Fuzhou again four hours later: it changes nothing, none refused (red: the one aboard refused at sea)', () => {
    const r = run(0, 'reclick');
    expect(r.refused, 'none refused').toEqual([]);
    expect(r.landed.size, 'all three landed').toBe(3);
    const at = [...r.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
  }, 300_000);
});
