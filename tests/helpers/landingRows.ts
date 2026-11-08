/**
 * ROADMAP R47d: the landings bar's rows against the divisions' panels, hour by hour, on the critic's landing cases
 * (run 47's grid, `landingGrid.ts`; run 50's far routes, `critic/scripts/c47_far.ts`'s settings), through the worker
 * (`SimServer`), which makes both. What it reads, each hour, for the case's divisions (`RowCheck.broken`):
 * - `missing`: one in a landing of the player's (`world.landings`) in no row under way (a division the AI put aboard,
 *   with the played nation's armies the AI's by default, ADR-759, is at sea in its panel and in no landing of the
 *   player's: not the bar's);
 * - `twice`: one in two rows under way;
 * - `words`: one whose row says other than its panel (`FormationDetail.voyage`);
 * - `state`: a row gathering with one at sea, or a row at sea with one waiting at the port for it to sail
 *   (`waiting`, `gathering`, `ready`, `sibling`);
 * - `outcome`: a row over whose counts are not where its divisions ended, as the world shows them hour by hour, not
 *   the worker's tally (ROADMAP R50a; critic run 52, R52-B1: "lost at sea" for two inland, "landed" for two ashore on
 *   Sicily): `landed` afloat one hour and ashore at the row's land the next (`landedAway`, as the news judges it),
 *   `away` ashore away from it, `lost` gone while afloat; a row that says landed with none so, or other than landed
 *   with one.
 */
import type { Command } from '../../src/shared/commands';
import type { FormationDetail, LandingRow } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { landedAway } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from './earth';
import { GRID_SETUPS, type GridOp, type GridSetup, type GridWho } from './landingGrid';
import { nationId } from './sim1938';

const { w: W, h: H } = SIZE_1938;
const cellAt = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);

export type RowBrokenKind = 'missing' | 'twice' | 'words' | 'state' | 'outcome';
export const ROW_BROKEN_KINDS: RowBrokenKind[] = ['missing', 'twice', 'words', 'state', 'outcome'];

/** A worker with the player's landings' rows as last sent, and the case's divisions' events. */
export class RowRun {
  readonly s: SimServer;
  rows: LandingRow[] = [];
  readonly broken: { kind: RowBrokenKind; what: string }[] = [];
  /** The rows over already read; each of the case's divisions' row and whether it was afloat, last hour; where they ended, by row. */
  private checkedOver = new Set<number>();
  private rowOf = new Map<number, number>();
  private wasAfloat = new Set<number>();
  private ends = new Map<number, Map<number, 'landed' | 'away' | 'repulsed' | 'lost'>>();
  /** The case's divisions thrown back while afloat: their place aboard with no water (`amphibious`'s repulse, R52a). */
  private thrownBack = new Set<number>();
  hours = 0;

  constructor(
    seed: number,
    readonly nation: number,
    public ids: number[] = [],
  ) {
    this.s = new SimServer((msg) => {
      if (msg.type === 'landings') this.rows = msg.rows;
    });
    this.s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed, assets: assets1938(W) } }, 0);
    this.s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation } }, 1);
  }

  get world(): World {
    return this.s.sim!.world;
  }

  /** What division `id`'s panel says of its voyage. */
  panel(id: number): FormationDetail['voyage'] {
    return (this.s as unknown as { voyageOf(w: World, id: number): FormationDetail['voyage'] }).voyageOf(this.world, id);
  }

  cmds(cmds: Command[]): void {
    this.s.handle({ type: 'cmds', cmds }, 0);
  }

  /** One hour, its events read for the case's divisions, then the rows checked. */
  step(): void {
    this.s.handle({ type: 'step', reqId: 0, n: 1 }, 0);
    this.hours++;
    this.check();
  }

  private check(): void {
    const w = this.world;
    const t = w.tick;
    const open = this.rows.filter((r) => r.state !== 'over');
    const seen = new Map<number, number>();
    for (const r of open) {
      for (const d of r.divisions) {
        if (seen.has(d.id)) this.broken.push({ kind: 'twice', what: `t${t} ${d.id} in ${seen.get(d.id)} and ${r.id}` });
        seen.set(d.id, r.id);
        const p = this.panel(d.id);
        if (JSON.stringify(p) !== JSON.stringify(d.voyage)) this.broken.push({ kind: 'words', what: `t${t} ${d.id}: row ${JSON.stringify(d.voyage)} panel ${JSON.stringify(p)}` });
        const v = d.voyage?.state;
        if (r.state === 'gathering' && v === 'atSea') this.broken.push({ kind: 'state', what: `t${t} row ${r.id} gathering, ${d.id} at sea` });
        if (r.state === 'sailing' && (v === 'waiting' || v === 'gathering' || v === 'ready' || v === 'sibling')) this.broken.push({ kind: 'state', what: `t${t} row ${r.id} at sea, ${d.id} ${v}` });
      }
    }
    for (const id of this.ids) {
      if (!w.formations.has(id) || seen.has(id)) continue;
      const p = this.panel(id);
      if (landingOfDivision(w, id) !== undefined) this.broken.push({ kind: 'missing', what: `t${t} ${id}: in landing ${landingOfDivision(w, id)!.id}, panel ${p?.state ?? 'none'}, in no row` });
    }
    // Where each division of a row under way ended, from the world: off the water this hour (ashore, at the row's land or
    // away from it), or gone while afloat.
    const land = new Map(this.rows.map((r) => [r.id, r.land]));
    for (const id of this.ids) {
      const row = this.rowOf.get(id);
      const afloat = w.formations.has(id) && (w.embarked.has(id) || w.afloat(id));
      // Thrown back: so from that hour, wherever it comes ashore after (it may be at sea still when its row is over).
      // (Or aboard the group of one so: it sails home with all aboard.)
      const fleet = w.embarked.get(id)?.fleet;
      const sent = fleet !== undefined && [...w.embarked].some(([d, e]) => e.fleet === fleet && e.water === -1 && (d === id || this.thrownBack.has(d) || this.ids.includes(d)));
      if (row !== undefined && sent && !this.thrownBack.has(id)) {
        this.thrownBack.add(id);
        const e = this.ends.get(row) ?? new Map<number, 'landed' | 'away' | 'repulsed' | 'lost'>();
        e.set(id, 'repulsed');
        this.ends.set(row, e);
      }
      if (row !== undefined && this.wasAfloat.has(id) && !afloat && !(this.thrownBack.has(id) && w.formations.has(id))) {
        const e = this.ends.get(row) ?? new Map<number, 'landed' | 'away' | 'repulsed' | 'lost'>();
        if (!w.formations.has(id)) e.set(id, 'lost');
        else {
          const [lx, ly] = land.get(row) ?? [NaN, NaN];
          e.set(id, landedAway(w, Math.floor(ly) * W + Math.floor(lx), w.formations.cols.x[id]!, w.formations.cols.y[id]!) ? 'away' : 'landed');
        }
        this.ends.set(row, e);
      }
      if (afloat) this.wasAfloat.add(id);
      else this.wasAfloat.delete(id);
      if (seen.has(id)) this.rowOf.set(id, seen.get(id)!);
    }
    for (const r of this.rows) {
      if (r.state !== 'over' || this.checkedOver.has(r.id) || !r.outcome) continue;
      this.checkedOver.add(r.id);
      const mine = r.divisions.filter((d) => this.ids.length === 0 || this.ids.includes(d.id)).map((d) => d.id);
      if (mine.length !== r.divisions.length) continue;
      const e = [...(this.ends.get(r.id)?.values() ?? [])];
      const was = { landed: e.filter((x) => x === 'landed').length, away: e.filter((x) => x === 'away').length, repulsed: e.filter((x) => x === 'repulsed').length, lost: e.filter((x) => x === 'lost').length };
      const o = r.outcome;
      const said = { landed: o.landed, away: o.away ?? 0, repulsed: o.repulsed ?? 0, lost: o.lost };
      if (o.kind === 'cancelled') said.away = was.away; // turned back: ashore at its port, not broken off
      if (JSON.stringify(said) !== JSON.stringify(was)) this.broken.push({ kind: 'outcome', what: `t${t} row ${r.id} ${o.kind} says ${JSON.stringify(said)}, they ended ${JSON.stringify(was)}` });
      if ((o.kind === 'landed') !== was.landed > 0) this.broken.push({ kind: 'outcome', what: `t${t} row ${r.id} ${o.kind}, ${was.landed} of its divisions landed` });
      for (const id of mine) if (this.rowOf.get(id) === r.id) this.rowOf.delete(id);
    }
  }

  /** Whether the case's divisions are done with landings: in no landing and none at sea, for a day. */
  settled(): boolean {
    const w = this.world;
    return this.ids.every((id) => !w.formations.has(id) || (landingOfDivision(w, id) === undefined && !w.embarked.has(id) && !w.seaBound.has(id))) && this.rows.every((r) => r.state === 'over');
  }
}

/** The divisions of `nation` nearest `from` on its land, `n` of them, by id. */
export function nearestDivisions(w: World, nation: number, from: [number, number], n: number): number[] {
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const k = comp[cellAt(from[0], from[1])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== nation || w.isFleet(id) || w.offLand(id) || comp[cellAt(c.x[id]!, c.y[id]!)] !== k) return;
    all.push([id, (c.x[id]! - from[0]) ** 2 + (c.y[id]! - from[1]) ** 2]);
  });
  return all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, n).map((d) => d[0]).sort((a, b) => a - b);
}

/** At war with `foe` (God's when `force`), the hour after. */
function toWar(r: RowRun, foe: number, force: boolean): void {
  const w = r.world;
  r.step();
  if (!w.wars.atWar(r.nation, foe)) r.cmds([force ? { kind: 'forceWar', attacker: r.nation, defender: foe } : { kind: 'declareWar', attacker: r.nation, defender: foe }]);
  r.step();
}

const order = (r: RowRun, ids: number[], to: [number, number]): void =>
  r.cmds(ids.filter((id) => r.world.formations.has(id)).sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation' as const, id, x: to[0], y: to[1], nation: r.nation, escort: true })));

/** Runs until the case's divisions are settled (two days at least: an order is taken at the next hour), or `hours`. */
function runOut(r: RowRun, hours: number): void {
  for (let h = 0; h < hours && (h < 48 || !r.settled()); h++) r.step();
}

/** Run 50's far routes (`c47_far.ts`'s settings): `n` divisions of `tag` nearest `from` (lon, lat) to `to`. */
export interface FarCase { seed: number; tag: string; foe: string; from: [number, number]; to: [number, number]; n: number; days: number }

export const FAR_CASES: FarCase[] = [
  { seed: 20661, tag: 'JAP', foe: 'CHI', from: [139.69, 35.69], to: [121.47, 31.23], n: 2, days: 150 },
  { seed: 20661, tag: 'JAP', foe: 'CHI', from: [139.69, 35.69], to: [120.38, 36.07], n: 2, days: 150 },
  { seed: 20841, tag: 'JAP', foe: 'CHI', from: [139.69, 35.69], to: [121.47, 31.23], n: 3, days: 150 },
  { seed: 20665, tag: 'ENG', foe: 'GER', from: [-0.1, 51.5], to: [8.6, 53.5], n: 2, days: 150 },
  { seed: 20845, tag: 'GER', foe: 'ENG', from: [13.4, 52.5], to: [1.3, 52.6], n: 2, days: 150 },
  { seed: 20843, tag: 'ITA', foe: 'ENG', from: [12.5, 41.9], to: [14.45, 35.9], n: 2, days: 150 },
  { seed: 20667, tag: 'USA', foe: 'JAP', from: [-122.4, 37.8], to: [139.69, 35.69], n: 1, days: 200 },
  { seed: 3517, tag: 'USA', foe: 'ENG', from: [-87.6, 41.9], to: [1.3, 52.6], n: 1, days: 200 },
];

export function farRows(f: FarCase): RowRun {
  const nation = nationId(f.tag);
  const from = cellOf(f.from[0], f.from[1], W, H) as [number, number];
  const to = cellOf(f.to[0], f.to[1], W, H) as [number, number];
  const r = new RowRun(f.seed, nation);
  toWar(r, nationId(f.foe), false);
  const ids = nearestDivisions(r.world, nation, from, f.n);
  r.ids = ids;
  order(r, ids, [Math.floor(to[0]) + 0.5, Math.floor(to[1]) + 0.5]);
  runOut(r, f.days * 24);
  return r;
}

/** A case of run 47's grid (`landingGrid.ts`): the base's click, then the case's order(s), run out. */
export function gridRows(setup: GridSetup, op: GridOp, hour: number, who: GridWho): RowRun | null {
  const nation = nationId(setup.nation);
  const r = new RowRun(setup.seed, nation);
  toWar(r, nationId(setup.enemy), setup.force);
  const ids = setup.ids.length > 0 ? setup.ids : nearestDivisions(r.world, nation, setup.home, 2);
  r.ids = ids;
  order(r, ids, setup.a);
  const w = r.world;
  const atPort = (id: number): boolean => {
    const l = landingOfDivision(w, id);
    return l !== undefined && l.state === LandingState.gathering && w.formations.cols.moving[id] !== 1;
  };
  let there = false;
  for (let h = 0; h < 24 * 20 && !there; h++) {
    r.step();
    there = ids.some(atPort);
  }
  if (!there) return null;
  r.step();
  const aboard = ids.find(atPort);
  const walking = ids.find((id) => !atPort(id) && landingOfDivision(w, id) !== undefined && w.formations.cols.moving[id] === 1);
  const sel = who === 'all' ? ids : who === 'aboard' ? (aboard === undefined ? [] : [aboard]) : walking === undefined ? [] : [walking];
  if (sel.length === 0) return null;
  const orders: { at: number; to: [number, number] }[] =
    op === 'reclick' ? [{ at: hour, to: setup.a }]
    : op === 'redirect' ? [{ at: hour, to: setup.b }]
    : op === 'recall' ? [{ at: 2, to: setup.b }, { at: 2 + hour, to: setup.a }]
    : [{ at: hour, to: setup.home }];
  let t = 0;
  for (const o of orders) {
    for (; t < o.at; t++) r.step();
    order(r, sel, o.to);
  }
  runOut(r, 24 * 60);
  return r;
}

export { GRID_SETUPS };
