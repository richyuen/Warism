/**
 * ROADMAP R33a: the grid of the player's landing orders, R33's acceptance test (ADR-829, PROMPT "KEEPING
 * WORK SHORT": an order's AT sweeps its parameters). A nation's two divisions nearest its capital are sent
 * over the sea by one click (escort on); from the hour after the first boards (one saved state) each case
 * gives one order, or two:
 * - `reclick`: at the hour, to the landing's target `off` cells away;
 * - `redirect`: at the hour, to the other target `off` cells away;
 * - `recall`: two hours on, to the other target; at the hour after that, back to the landing's `off` away;
 * - `cancel`: at the hour, to the capital (a march at home).
 * `who`: the one aboard, the one walking to its port (bound, not aboard), or both.
 *
 * Each case runs until every division has landed, been told (refused), died or come home, or 60 days after
 * its last order. What it reads (`GridCase.broken`):
 * - `split`: the divisions of one landing (their orders' targets within SAME_LANDING_CELLS) landed more than
 *   a day apart;
 * - `untold`: one not landed at the end, not told why (refused) and not dead;
 * - `away`: one landed abroad away from its landing (more than AT_PORT_CELLS from it, `landedAway`);
 * - `mark`: one landed at its order's target without a mark when it was ordered (`seaHint`), or away from it;
 * - `idle`: an idle spell aboard over 72 h (aboard transports standing, in no fight);
 * - `home`: a cancelled one landed abroad, or not at home at the end.
 * And a figure, not a kind (ROADMAP R33b): `wait`, the longest a division stood at its port in a landing that
 * had not sailed, ashore or aboard. Since R33b a landing's divisions wait ashore and board at the sail hour, so
 * `idle` alone would hide a long wait.
 *
 * "The one aboard" is the first of the click to reach its port (at R33a's HEAD it boarded on arrival: the same
 * division at the same hour), "one walking" one still marching to it.
 */
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { isLand } from '../../src/shared/terrain';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landedAway, landingOf, near, SAME_LANDING_CELLS } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision, seaHint } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from './earth';
import { nationId } from './sim1938';

const { w: W, h: H } = SIZE_1938;

export type GridOp = 'reclick' | 'redirect' | 'recall' | 'cancel';
export type GridWho = 'aboard' | 'walking' | 'all';
export const GRID_OPS: GridOp[] = ['reclick', 'redirect', 'recall', 'cancel'];
export const GRID_HOURS = [6, 24, 48, 72, 120];
export const GRID_OFFS = [0, 1, 2, 3];
export const GRID_WHO: GridWho[] = ['aboard', 'walking', 'all'];
export const BROKEN_KINDS = ['split', 'untold', 'away', 'mark', 'idle', 'home'] as const;
export type BrokenKind = (typeof BROKEN_KINDS)[number];

/** The longest idle spell aboard the AT allows, in hours. */
export const IDLE_HOURS = 72;
/** How long a case runs after its last order, in hours. */
const RUN_HOURS = 24 * 60;

export interface GridSetup {
  seed: number;
  nation: string;
  enemy: string;
  /** God's `forceWar` when not at war at the start (Britain and France), else `declareWar`. */
  force: boolean;
  /** The landing's target and the other's, and the capital (cells, x/y). */
  a: [number, number];
  b: [number, number];
  home: [number, number];
  /** The click's divisions; empty: the two nearest the capital on its land. */
  ids: number[];
}

export const GRID_SETUPS: GridSetup[] = [
  { seed: 3517, nation: 'JAP', enemy: 'CHI', force: false, a: cellOf(121.47, 31.23, W, H) as [number, number], b: [1703.5, 445.5], home: cellOf(139.69, 35.69, W, H) as [number, number], ids: [] },
  { seed: 15101, nation: 'ENG', enemy: 'FRA', force: true, a: [1034.5, 279.5], b: [1021.5, 291.5], home: cellOf(-0.13, 51.51, W, H) as [number, number], ids: [270, 271] },
];

export interface GridBase {
  setup: GridSetup;
  sim: Sim;
  saved: Uint8Array;
  ids: number[];
  /** The hour of the saved state. */
  t0: number;
}

export interface GridCase {
  op: GridOp;
  hour: number;
  off: number;
  who: GridWho;
  /** No such division at the base (none walking), or the order's cell not land. */
  skipped?: string;
  broken: { kind: BrokenKind; what: string }[];
  /** Per division: landed at (tick), told (reason), dead, longest idle aboard (h), longest wait at its port (h). */
  divisions: { id: number; landed: number | null; told: number | null; dead: boolean; idle: number; wait: number }[];
}

const cellAt = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
const DIRS: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];

/** The cell `off` cells from `p` in the first direction whose 1–3 cells off are all land of `p`'s land. */
function offset(w: World, p: [number, number], off: number): [number, number] {
  if (off === 0) return p;
  const comp = navOf(w).grid.component;
  const k = comp[cellAt(p[0], p[1])];
  const dir = DIRS.find(([dx, dy]) => [1, 2, 3].every((r) => {
    const c = cellAt(p[0] + dx * r, p[1] + dy * r);
    return isLand(w.cells.terrain[c]!) && comp[c] === k;
  })) ?? DIRS[0]!;
  return [p[0] + dir[0] * off, p[1] + dir[1] * off];
}

const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};

/** The base state of a setup: the click made, stepped to the hour after the first boards. */
export function gridBase(setup: GridSetup): GridBase {
  const sim = new Sim({ scenario: '1938', seed: setup.seed, assets: assets1938(W) });
  const w = sim.world;
  const [n, e] = [nationId(setup.nation), nationId(setup.enemy)];
  sim.command({ kind: 'setPlayer', nation: n });
  sim.step(1, quiet);
  if (!w.wars.atWar(n, e)) sim.command(setup.force ? { kind: 'forceWar', attacker: n, defender: e } : { kind: 'declareWar', attacker: n, defender: e });
  sim.step(1, quiet);
  let ids = setup.ids;
  if (ids.length === 0) {
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const k = comp[cellAt(setup.home[0], setup.home[1])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== n || w.isFleet(id) || w.offLand(id) || comp[cellAt(c.x[id]!, c.y[id]!)] !== k) return;
      all.push([id, (c.x[id]! - setup.home[0]) ** 2 + (c.y[id]! - setup.home[1]) ** 2]);
    });
    ids = all.sort((x, y) => x[1] - y[1] || x[0] - y[0]).slice(0, 2).map((d) => d[0]);
  }
  for (const id of [...ids].sort((x, y) => x - y)) sim.command({ kind: 'moveFormation', id, x: setup.a[0], y: setup.a[1], nation: n, escort: true });
  let there = false;
  for (let h = 0; h < 24 * 20 && !there; h++) {
    sim.step(1, quiet);
    there = ids.some((id) => atItsPort(w, id));
  }
  if (!there) throw new Error(`seed ${setup.seed}: nobody at its port in 20 days`);
  sim.step(1, quiet);
  return { setup, sim, saved: sim.save(), ids, t0: w.tick };
}

interface Order { at: number; ids: number[]; to: [number, number] }

/** Whether division `id` stands at its landing's port, ashore or aboard, the landing not sailed. */
function atItsPort(w: World, id: number): boolean {
  const l = landingOfDivision(w, id);
  return l !== undefined && l.state === LandingState.gathering && w.formations.cols.moving[id] !== 1;
}

/** One case of the grid from the base's saved state. */
export function gridCase(b: GridBase, op: GridOp, hour: number, off: number, who: GridWho): GridCase {
  const { sim, setup } = b;
  sim.load(b.saved);
  const w = sim.world;
  const n = nationId(setup.nation);
  const c = w.formations.cols;
  const out: GridCase = { op, hour, off, who, broken: [], divisions: [] };
  const aboard = b.ids.find((id) => atItsPort(w, id));
  const walking = b.ids.find((id) => !atItsPort(w, id) && landingOfDivision(w, id) !== undefined && c.moving[id] === 1);
  const sel = who === 'all' ? b.ids : who === 'aboard' ? (aboard === undefined ? [] : [aboard]) : walking === undefined ? [] : [walking];
  if (sel.length === 0) return { ...out, skipped: `no division ${who}` };
  const comp = navOf(w).grid.component;
  const homeComp = comp[cellAt(setup.home[0], setup.home[1])]!;
  const a = offset(w, setup.a, off);
  const bb = offset(w, setup.b, off);
  const orders: Order[] =
    op === 'reclick' ? [{ at: hour, ids: sel, to: a }]
    : op === 'redirect' ? [{ at: hour, ids: sel, to: bb }]
    : op === 'recall' ? [{ at: 2, ids: sel, to: setup.b }, { at: 2 + hour, ids: sel, to: a }]
    : [{ at: hour, ids: sel, to: setup.home }];
  // Each division's order (its target, and the mark it was given), as taken.
  const intent = new Map<number, { to: number; mark: { land: number } | null; over: boolean; ordered: boolean }>(b.ids.map((id) => [id, { to: cellAt(setup.a[0], setup.a[1]), mark: null, over: true, ordered: false }]));
  const landed = new Map<number, number>();
  const landedAt = new Map<number, [number, number]>();
  const abroad = new Map<number, number>();
  const told = new Map<number, number>();
  const dead = new Set<number>();
  const idle = new Map<number, number>(b.ids.map((id) => [id, 0]));
  const wait = new Map<number, number>(b.ids.map((id) => [id, 0]));
  const waitSpell = new Map<number, number>(b.ids.map((id) => [id, 0]));
  const spell = new Map<number, number>(b.ids.map((id) => [id, 0]));
  // Once its order is over (landed, told, dead, or home from a cancel) a division is the AI's (ADR-759): not read on.
  const settled = new Set<number>();
  const hourOf = (): void => {
    for (const id of b.ids) {
      if (!w.formations.has(id) || settled.has(id)) continue;
      const i = intent.get(id)!;
      if (dead.has(id) || told.has(id) || landed.has(id) || abroad.has(id) || (!i.over && !w.embarked.has(id) && c.moving[id] !== 1 && w.cells.owner[cellAt(c.x[id]!, c.y[id]!)] === n)) {
        settled.add(id);
        continue;
      }
      const e = w.embarked.get(id);
      const standing = e !== undefined && w.formations.has(e.fleet) && c.moving[e.fleet] !== 1 && c.engaged[e.fleet] !== 1;
      const s = standing ? spell.get(id)! + 1 : 0;
      spell.set(id, s);
      idle.set(id, Math.max(idle.get(id)!, s));
      const ws = atItsPort(w, id) ? waitSpell.get(id)! + 1 : 0;
      waitSpell.set(id, ws);
      wait.set(id, Math.max(wait.get(id)!, ws));
    }
  };
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        const id = ev[i + 2]!;
        if (!b.ids.includes(id) || settled.has(id)) continue;
        const k = ev[i + 1];
        if (k === EventKind.MoveRejected) told.set(id, ev[i + 4]!);
        if (k === EventKind.FormationDestroyed) dead.add(id);
        if (k === EventKind.FormationLanded) {
          const [lx, ly] = [ev[i + 4]!, ev[i + 5]!];
          // Ashore on its own nation's land (a stray landing at home, PLAN 4.8n) is not a landing abroad.
          if (x.cells.owner[cellAt(lx, ly)] === n) continue;
          const l = landingOf(x, intent.get(id)!.to);
          if (l && !landedAway(x, l.land, lx, ly)) {
            landed.set(id, x.tick);
            landedAt.set(id, [lx, ly]);
          } else abroad.set(id, x.tick);
        }
      }
      quiet(x);
      hourOf();
    });
  let t = 0;
  for (const o of orders) {
    while (t < o.at) {
      step();
      t++;
    }
    const live = o.ids.filter((id) => w.formations.has(id));
    const marks = new Map(live.map((id) => {
      const hint = seaHint(w, [id], o.to[0], o.to[1]);
      return [id, hint.how === 1 && hint.land >= 0 ? { land: hint.land } : null];
    }));
    for (const id of [...live].sort((x, y) => x - y)) sim.command({ kind: 'moveFormation', id, x: o.to[0], y: o.to[1], nation: n, escort: true } as Command);
    // A refusal at the click leaves the order before it; one later ends its landing (told).
    for (const id of live) {
      told.delete(id);
      settled.delete(id);
    }
    step();
    t++;
    for (const id of live) {
      // Refused at the click, or landed already: the order before it stands.
      if (told.has(id) || landed.has(id) || abroad.has(id)) continue;
      const to = cellAt(o.to[0], o.to[1]);
      intent.set(id, { to, mark: marks.get(id)!, over: comp[to] !== homeComp, ordered: true });
    }
    for (const id of live) {
      if (!told.has(id)) continue;
      told.delete(id);
      settled.delete(id);
    }
  }
  const done = (): boolean => b.ids.every((id) => !w.formations.has(id) || settled.has(id));
  for (let h = 0; h < RUN_HOURS && !done(); h++) step();
  // Groups: the divisions whose targets are within SAME_LANDING_CELLS, over the sea, not told.
  const r = w.atSize(SAME_LANDING_CELLS);
  const groups: number[][] = [];
  for (const id of b.ids) {
    const i = intent.get(id)!;
    if (!i.over || told.has(id) || dead.has(id) || !w.formations.has(id)) continue;
    const g = groups.find((x) => near(w, intent.get(x[0]!)!.to, i.to, r));
    if (g) g.push(id);
    else groups.push([id]);
  }
  for (const g of groups) {
    const at = g.map((id) => landed.get(id)).filter((v): v is number => v !== undefined);
    if (at.length > 1 && Math.max(...at) - Math.min(...at) > 24) out.broken.push({ kind: 'split', what: `${g.map((id) => `${id}@${landed.get(id) ?? '-'}`).join(' ')}` });
    for (const id of g) if (!landed.has(id)) out.broken.push({ kind: 'untold', what: `${id} not landed by t${w.tick}, untold${w.embarked.has(id) ? ' (aboard)' : ''}` });
  }
  for (const [id, at] of abroad) out.broken.push({ kind: intent.get(id)!.over ? 'away' : 'home', what: `${id} landed abroad, away from its landing, t${at}` });
  for (const id of b.ids) {
    const i = intent.get(id)!;
    if (i.over && i.ordered && landed.has(id)) {
      if (!i.mark) out.broken.push({ kind: 'mark', what: `${id} landed at t${landed.get(id)} with no mark at its order` });
      else if (landedAway(w, i.mark.land, ...landedAt.get(id)!)) out.broken.push({ kind: 'mark', what: `${id} landed away from its mark` });
    }
    if (!i.over && w.formations.has(id) && !settled.has(id)) out.broken.push({ kind: 'home', what: `${id} cancelled, not at home at t${w.tick}${w.embarked.has(id) ? ' (aboard)' : ''}` });
    if (idle.get(id)! > IDLE_HOURS) out.broken.push({ kind: 'idle', what: `${id} idle aboard ${idle.get(id)} h` });
    out.divisions.push({ id, landed: landed.get(id) ?? null, told: told.get(id) ?? null, dead: dead.has(id), idle: idle.get(id)!, wait: wait.get(id)! });
  }
  return out;
}
