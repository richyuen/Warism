import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, groupOf } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R28a (critic run 39, R39-B1): a landing the player redirects took other transports while
// its own lay idle. Each division's order chose transports while the others still held the landing's,
// so the first went to another port, and the rest followed it there by the same-target rule: two re-sent
// to Fuzhou walked to Sasebo and landed at h1291 (h657 from a standing start); of three, the two sent
// on landed 21 days apart; the four re-clicked three cells south-west were all refused "no
// transports". The hour's orders are now judged together: transports held only by divisions this
// hour's orders take elsewhere are theirs to take (`world.leaving`). Seed 3517, Japan at war with
// China, its two, three or four divisions nearest Tokyo sent to Shanghai by one click (escort on);
// two hours after the first boards, some of them clicked again.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

interface Case {
  sim: Sim;
  ids: number[];
  refused: Map<number, number>;
  landed: Map<number, number>;
  step: () => void;
}

function start(n: number): Case {
  const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
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
  const ids = all.sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  for (const id of ids) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
  const refused = new Map<number, number>();
  const landed = new Map<number, number>();
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (!ids.includes(ev[i + 2]!)) continue;
        if (ev[i + 1] === EventKind.MoveRejected) refused.set(ev[i + 2]!, ev[i + 4]!);
        if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  // ROADMAP R33b: a landing's divisions wait at its port ashore (ADR-830): the first at its port.
  for (let h = 0; h < 24 * 10 && !ids.some((id) => atItsPort(w, id)); h++) step();
  expect(ids.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
  step();
  step();
  return { sim, ids, refused, landed, step };
}

/** The transports `id` is aboard, or its landing's first group (ROADMAP R33b). */
const place = (s: Sim, id: number): number | undefined => s.world.embarked.get(id)?.fleet ?? groupOf(s.world, id);

/** Clicks `again` to (`x`, `y`); steps until those clicked have landed (or 90 days). Their old transports, and their new. */
function reclick(k: Case, again: number[], x: number, y: number): { was: (number | undefined)[]; now: (number | undefined)[] } {
  const was = again.map((id) => place(k.sim, id));
  for (const id of again) k.sim.command({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true });
  k.step();
  const now = again.map((id) => place(k.sim, id));
  for (let h = 0; h < 24 * 90 && again.some((id) => !k.landed.has(id)); h++) k.step();
  return { was, now };
}

describe('a changed landing takes its own transports (ROADMAP R28a)', () => {
  it('two re-sent to Fuzhou two hours after the first boards: from their own port, they land together, about as soon as from a standing start', () => {
    const k = start(2);
    const { was, now } = reclick(k, k.ids, ...FUZHOU);
    process.stderr.write(`R28a two: ${was} -> ${now}, refused ${[...k.refused]}, landed ${[...k.landed]}\n`);
    expect([...k.refused], 'none refused').toEqual([]);
    // The landing's own transports go with it (red: 1151 and 1152, called to Sasebo, 1136 idle at Tokyo);
    // the second may go on another group standing at the same port (R21e), as from a standing start.
    expect(was, 'the first on transports it had').toContain(now[0]);
    expect(k.landed.size, 'both landed').toBe(2);
    const at = [...k.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
    expect(Math.max(...at), 'about as soon as from a standing start (h657; red: h1291)').toBeLessThanOrEqual(750);
  }, 300_000);

  it('of three, two re-sent to Fuzhou: the two land together', () => {
    const k = start(3);
    const two = k.ids.slice(0, 2);
    const { was, now } = reclick(k, two, ...FUZHOU);
    process.stderr.write(`R28a three: ${was} -> ${now}, refused ${[...k.refused]}, landed ${[...k.landed]}\n`);
    expect([...k.refused], 'none refused').toEqual([]);
    const at = two.map((id) => k.landed.get(id));
    expect(at.every((t) => t !== undefined), 'both landed').toBe(true);
    expect(Math.abs(at[0]! - at[1]!), 'together (red: 21 days apart)').toBeLessThanOrEqual(24);
  }, 300_000);

  // ROADMAP R28c: two clicks an hour apart. The first, alone aboard its own transports, sails for Fuzhou
  // at once; the second's own, still under way to the port for it, were not offered (under way), and it
  // went on another group from another port, landing at h794 against h657 from a standing start.
  it('two re-sent to Fuzhou an hour apart: the second takes its own transports, under way to the port for it', () => {
    const k = start(2);
    const was = k.ids.map((id) => place(k.sim, id));
    k.sim.command({ kind: 'moveFormation', id: k.ids[0]!, x: FUZHOU[0], y: FUZHOU[1], nation: JAP, escort: true });
    k.step();
    const { now } = reclick(k, [k.ids[1]!], ...FUZHOU);
    for (let h = 0; h < 24 * 90 && k.landed.size < 2; h++) k.step();
    process.stderr.write(`R28c: ${was} -> ${place(k.sim, k.ids[0]!)},${now}, refused ${[...k.refused]}, landed ${[...k.landed]}\n`);
    expect([...k.refused], 'none refused').toEqual([]);
    expect(now[0], 'the second on its own transports').toBe(was[1]);
    expect(k.landed.size, 'both landed').toBe(2);
    expect(k.landed.get(k.ids[1]!)!, 'the second about as soon as from a standing start (h657; red: h794)').toBeLessThanOrEqual(700);
  }, 300_000);

  it('the four re-clicked three cells south-west: none refused, they land together', () => {
    const k = start(4);
    const { was, now } = reclick(k, k.ids, SHANGHAI[0] - 3, SHANGHAI[1] + 3);
    process.stderr.write(`R28a four: ${was} -> ${now}, refused ${[...k.refused]}, landed ${[...k.landed]}\n`);
    expect([...k.refused], 'none refused (red: all four, "no transports")').toEqual([]);
    expect(k.landed.size, 'all four landed').toBe(4);
    const at = [...k.landed.values()];
    expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
  }, 300_000);
});
