/**
 * ROADMAP R33d (ADR-830; as `diploInvariants`, ADR-803): the rules of the player's landings, checked every hour
 * of a run with random landing orders. A nation at war (`GRID_SETUPS`' targets), the player; its six divisions
 * nearest its capital are the pool. Every 12 to 72 hours (an RNG of its own, not the sim's) one click: one, two,
 * three or all of the pool, to the landing's target or the other's (0–3 cells off), to the sea off the first's
 * beach (ROADMAP R36b), or home (a cancel); the farther of the pool make late orders, and re-sent ones make
 * recalls, redirects, re-clicks and part of a landing sent elsewhere (R36a) of every kind.
 *
 * Broken, each with its hour:
 * - `one`: a division or a group in two landings;
 * - `empty`: a landing with no division, or one whose division or group is gone or another nation's;
 * - `aboardGathering`: a division aboard standing transports two hours running while its landing gathers (they
 *   wait ashore and board at the sail hour; a landing at sea joined to one gathering sails to its port aboard);
 * - `aboardNoLanding`: a division aboard transports under the player's order (`playerOrders`), in no landing on
 *   them (bar God's `seaBound`; one whose order is over is the AI's to ship, ADR-759);
 * - `idle`: a spell aboard a landing's transports over IDLE_HOURS, standing in no fight;
 * - `returning`: a landing returning with no march after it (`then`);
 * - `cancelWater`: a landing returning for a march onto water (critic run 44, R44-B2: an order to the sea was taken
 *   as a cancel, and refused a day later at its port);
 * - `leftBehind`: at the hour a landing sails, one of its divisions standing ashore (critic run 44, R44-B1: a part
 *   re-sent kept too few transports; the rest stood at the port, untold, and landed alone weeks later);
 * - `escort`: an escort for no landing two hours running (one ending this hour is let go the next);
 * - `stuck`: a division in a gathering landing for over STUCK_DAYS;
 * - `save`: a save that does not load bit-identical (on the probe days).
 * Each kind is told once a division, group or landing (its first hour).
 */
import type { Command } from '../../src/shared/commands';
import { isLand } from '../../src/shared/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { LandingState } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from './earth';
import { GRID_SETUPS, IDLE_HOURS, type GridSetup } from './landingGrid';
import { nationId } from './sim1938';

const { w: W } = SIZE_1938;
/** The longest a division may stand in a gathering landing, in days (R31f's late march is a week; the longest walk ~21 days). */
export const STUCK_DAYS = 45;

export interface LandingCase {
  /** The sim's seed. */
  seed: number;
  /** The setup (nation, targets, capital) by its seed in `GRID_SETUPS`. */
  setup: number;
  days: number;
  /** The order RNG's seed. */
  orders: number;
  /** Days on which a save is loaded and compared. */
  probeDays: number[];
  /** Each hour after the step, and each click (a tool's trace). */
  onHour?: (w: World, click?: { ids: number[]; x: number; y: number }) => void;
}

/** mulberry32: the fuzz's orders, apart from the sim's RNG. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS: [number, number][] = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];

/** The rules each hour on `w` for player `n`; `idle` and `since` carry spells between hours. */
function check(w: World, n: number, idle: Map<number, number>, since: Map<number, number>, orphans: Set<number>, moored: Set<number>, was: Map<number, number>, put: (key: string, line: string) => void): void {
  const t = `t${w.tick}`;
  const out = { push: (line: string): void => put(line.replace(/^t\d+ /, '').replace(/ (aboard|standing|for|in|,|has|gathering).*$/, ''), line) };
  const f = w.formations;
  const c = f.cols;
  const divs = new Map<number, number>();
  const aboardNow = new Set<number>();
  const groups = new Map<number, number>();
  for (const l of w.landings.values()) {
    if (l.divisions.size === 0) out.push(`${t} empty: landing ${l.id} has no division`);
    for (const id of l.divisions.keys()) {
      if (divs.has(id)) out.push(`${t} one: division ${id} in landings ${divs.get(id)} and ${l.id}`);
      divs.set(id, l.id);
      if (!f.has(id) || c.nation[id] !== l.nation) out.push(`${t} empty: landing ${l.id}'s division ${id} gone or another's`);
      const e = w.embarked.get(id);
      if (l.state === LandingState.gathering && e !== undefined && f.has(e.fleet) && c.moving[e.fleet] !== 1) {
        if (moored.has(id)) out.push(`${t} aboardGathering: ${id} aboard ${e.fleet} standing, landing ${l.id} gathering`);
        else moored.add(id);
        aboardNow.add(id);
      }
    }
    for (const o of l.fleets) {
      if (groups.has(o)) out.push(`${t} one: group ${o} in landings ${groups.get(o)} and ${l.id}`);
      groups.set(o, l.id);
      if (!f.has(o) || c.nation[o] !== l.nation) out.push(`${t} empty: landing ${l.id}'s group ${o} gone or another's`);
    }
    if (l.state === LandingState.returning && l.then < 0) out.push(`${t} returning: landing ${l.id} with no march after`);
    if (l.state === LandingState.returning && l.then >= 0 && !isLand(w.cells.terrain[l.then]!)) out.push(`${t} cancelWater: landing ${l.id} returning for a march onto water`);
    if (l.state === LandingState.sailing && was.get(l.id) === LandingState.gathering) {
      for (const id of l.divisions.keys()) if (f.has(id) && !w.embarked.has(id) && c.moving[id] !== 1) out.push(`${t} leftBehind: ${id} ashore as landing ${l.id} sails`);
    }
  }
  was.clear();
  for (const l of w.landings.values()) was.set(l.id, l.state);
  for (const [o, e] of w.escorts) {
    if (w.landings.has(e.convoy)) orphans.delete(o);
    else if (orphans.has(o)) out.push(`${t} escort: ${o} for landing ${e.convoy}, none two hours on`);
    else orphans.add(o);
  }
  for (const [id, e] of w.embarked) {
    if (c.nation[id] !== n || w.seaBound.has(id)) continue;
    const l = divs.get(id);
    if (w.playerOrders.has(id) && (l === undefined || !w.landings.get(l)!.fleets.includes(e.fleet))) out.push(`${t} aboardNoLanding: ${id} aboard ${e.fleet}, landing ${l ?? 'none'}`);
    // Idle aboard: of a landing's (the AI's own shipping is its own).
    const standing = l !== undefined && f.has(e.fleet) && c.moving[e.fleet] !== 1 && c.engaged[e.fleet] !== 1;
    const s = standing ? (idle.get(id) ?? 0) + 1 : 0;
    idle.set(id, s);
    if (s === IDLE_HOURS + 1) out.push(`${t} idle: ${id} aboard ${e.fleet} standing ${IDLE_HOURS} h`);
  }
  for (const id of [...idle.keys()]) if (!w.embarked.has(id)) idle.delete(id);
  for (const id of [...moored]) if (!aboardNow.has(id)) moored.delete(id);
  for (const [id, l] of divs) {
    if (w.landings.get(l)!.state !== LandingState.gathering) {
      since.delete(id);
      continue;
    }
    const s = since.get(id) ?? w.tick;
    since.set(id, s);
    if (w.tick - s === STUCK_DAYS * 24) out.push(`${t} stuck: ${id} in gathering landing ${l} for ${STUCK_DAYS} days`);
  }
  for (const id of [...since.keys()]) if (!divs.has(id)) since.delete(id);
}

/** The broken rules of one run, each a line (empty: none). */
export function landingBreaks(k: LandingCase): string[] {
  const setup: GridSetup = GRID_SETUPS.find((s) => s.seed === k.setup)!;
  const sim = new Sim({ scenario: '1938', seed: k.seed, assets: assets1938(W) });
  const w = sim.world;
  const [n, e] = [nationId(setup.nation), nationId(setup.enemy)];
  const quiet = (x: World): void => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: n });
  sim.step(1, quiet);
  if (!w.wars.atWar(n, e)) sim.command(setup.force ? { kind: 'forceWar', attacker: n, defender: e } : { kind: 'declareWar', attacker: n, defender: e });
  sim.step(1, quiet);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const at = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
  const home = comp[at(setup.home[0], setup.home[1])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== n || w.isFleet(id) || w.offLand(id) || comp[at(c.x[id]!, c.y[id]!)] !== home) return;
    all.push([id, (c.x[id]! - setup.home[0]) ** 2 + (c.y[id]! - setup.home[1]) ** 2]);
  });
  const pool = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 6).map((d) => d[0]);
  const r = rng(k.orders);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;
  const out: string[] = [];
  const told = new Set<string>();
  const put = (key: string, line: string): void => {
    if (told.has(key)) return;
    told.add(key);
    out.push(line);
  };
  const orphans = new Set<number>();
  const moored = new Set<number>();
  const idle = new Map<number, number>();
  const since = new Map<number, number>();
  const was = new Map<number, number>();
  let next = w.tick;
  const end = w.tick + k.days * 24;
  const probes = new Set(k.probeDays.map((d) => w.tick + d * 24));
  while (w.tick < end) {
    if (w.tick >= next) {
      const live = pool.filter((id) => w.formations.has(id) && c.nation[id] === n);
      if (live.length > 0) {
        const size = pick([1, 1, 2, 3, live.length]);
        const sel = [...live].sort(() => r() - 0.5).slice(0, size).sort((a, b) => a - b);
        const where = pick(['a', 'a', 'b', 'sea', 'home'] as const);
        const [dx, dy] = pick(DIRS);
        const off = pick([0, 1, 2, 3]);
        // The sea: the water off the first target's beach, 0–3 cells further out (ROADMAP R36b).
        const sea = landingOf(w, Math.floor(setup.a[1]) * W + Math.floor(setup.a[0]))!.water;
        const [x, y] = where === 'home' ? setup.home : where === 'sea' ? [(sea % W) + 0.5 + dx * off, Math.floor(sea / W) + 0.5 + dy * off] : [(where === 'a' ? setup.a : setup.b)[0] + dx * off, (where === 'a' ? setup.a : setup.b)[1] + dy * off];
        for (const id of sel) sim.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true } as Command);
        k.onHour?.(w, { ids: sel, x, y });
      }
      next = w.tick + 12 + Math.floor(r() * 61);
    }
    sim.step(1, quiet);
    check(w, n, idle, since, orphans, moored, was, put);
    k.onHour?.(w);
    if (probes.has(w.tick)) {
      const bytes = sim.save();
      const other = new Sim({ scenario: '1938', seed: k.seed, assets: assets1938(W) });
      other.load(bytes);
      const again = other.save();
      if (again.length !== bytes.length || again.some((b, i) => b !== bytes[i])) out.push(`t${w.tick} save: not bit-identical after a load`);
    }
    if (out.length > 200) break;
  }
  return out;
}
