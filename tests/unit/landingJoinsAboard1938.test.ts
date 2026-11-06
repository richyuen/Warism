import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import type { FromWorker } from '../../src/shared/protocol';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { assets1938 } from '../helpers/earth';
import { atItsPort, hasLanding } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R29b (critic run 40, R40-B1): a landing redirected to a target another convoy already loads
// for. Seed 3517, Japan at war with China: its two divisions nearest Tokyo sent to Shanghai by a click
// (escort on); two hours after the first boards at Tokyo, a fresh division (the third nearest) is sent
// to Fuzhou, which makes a convoy at another port, then the two are sent there too. The one aboard was
// put ashore and bound for that convoy, and walked there for weeks while its own transports, called
// for the second, sailed there empty: one landed at h657, the others at h1291. Now its own transports
// take it there aboard (`sailAboard`), and the three land together. ROADMAP R33b (ADR-830): a landing's
// divisions wait at its port ashore and board at the sail hour; the redirected two join the fresh one's
// landing, or make one with the transports their own left them, and the three land together; the one at
// the port does not walk to another. `sailAboard` and its panel state (R29b, R30c) went with the rule that
// kept a division aboard at its port. Driven as the page drives the
// worker (`cmds`, applied at once).

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

type Then = 'recall' | 'reclick' | null;

function run(gap: number, then: Then = null): { landed: Map<number, number>; walked: boolean; refused: number[]; ids: number[]; panel: string | undefined; where: Map<number, number>; idle: boolean } {
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
  let ids: number[] = [];
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (!ids.includes(ev[i + 2]!)) continue;
        if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
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
  for (let h = 0; h < 24 * 10 && !pair.some((id) => atItsPort(w, id)); h++) step();
  expect(pair.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
  step();
  step();
  const first = pair.find((id) => atItsPort(w, id))!;
  expect(first, 'one at its port').toBeDefined();
  // The transports called for the second (ROADMAP R31d, R41-N1): its landing's last group.
  const called = landingOfDivision(w, pair.find((id) => id !== first)!)?.fleets.at(-1);
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
  // The one at the port never marches to another before its landing (red: it walked ~50 days).
  let walked = false;
  // Those transports, from day 5: carrying, in a convoy, under way, or the AI's; not idle under the player's order.
  let idle = false;
  for (let h = 0; h < 24 * 90 && ids.some((id) => !landed.has(id)); h++) {
    if (!landed.has(first) && !w.embarked.has(first) && c.moving[first] === 1) walked = true;
    const g = called ?? 0;
    if (h >= 120 && w.formations.has(g) && w.playerOrders.has(g) && !hasLanding(w, g) && c.moving[g] !== 1 && ![...w.embarked.values()].some((e) => e.fleet === g)) idle = true;
    step();
  }
  const where = new Map(ids.map((id) => [id, Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)]));
  process.stderr.write(`R29b gap ${gap} ${then}: first ${first}, panel ${panel}, called ${called} idle ${idle}, walked ${walked}, refused ${refused}, landed ${[...landed]}\n`);
  return { landed, walked, refused, ids, panel, where, idle };
}

describe('a landing redirected to a convoy loading elsewhere: the one aboard goes on its own transports (ROADMAP R29b)', () => {
  for (const gap of [0, 1]) {
    // ROADMAP R33b: the two are their own landing, redirected with its port and transports (`redirectGathering`);
    // the fresh one's is another, at its port. Each lands together; R29b's ferry of the one aboard to the
    // other port (`sailAboard`) went with the rule that kept it aboard there (ADR-830).
    it(`the fresh one sent to Fuzhou ${gap === 0 ? 'in the same hour as' : 'an hour before'} the two: the one at the port does not walk; the two land together`, () => {
      const r = run(gap);
      expect(r.refused, 'none refused').toEqual([]);
      expect(r.walked, 'the one at the port never walks (red: ~50 days to Sasebo)').toBe(false);
      expect(r.landed.size, 'all three landed').toBe(3);
      const at = r.ids.slice(0, 2).map((id) => r.landed.get(id)!);
      expect(Math.max(...at) - Math.min(...at), 'the two together (red: h657 and h1291)').toBeLessThanOrEqual(24);
      expect(Math.max(...r.landed.values()), 'about as soon as the three from a standing start (h976)').toBeLessThanOrEqual(1000);
      expect(r.idle, "the transports called for the second not idle under the player's order (R31d; red: a month at Tokyo)").toBe(false);
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
    const at = r.ids.slice(0, 2).map((id) => r.landed.get(id)!);
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
  }, 300_000);
});
