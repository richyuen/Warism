import { afterEach, describe, expect, it } from 'vitest';
import { project } from '../../src/sim/data/projection';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { marchTo } from '../../src/sim/systems/movement';
import { FALL_BACK_CELLS, FIGHT_DAYS, SET_DOWN_PER_CELL, TRACK_PROBE } from '../../src/sim/track';
import { Domain, PlayerOrderKind, type World } from '../../src/sim/world';
import { isLand } from '../../src/shared/terrain';
import { assets1938 } from '../helpers/earth';

// ROADMAP R239 (ADR-1166; found by R236). Across a front the historical track holds nobody fights on land and no
// land is taken, and a march waits before each cell an enemy holds (PLAN 1.14): a formation the timeline leaves on
// the ground of a foe it is held off from stood there until the hold ended, or starved first. An `occupy` and a
// `withdraw` set down the formations their own stage cuts off (R66c, ADR-968). Nothing did for the rest: on the
// replay's own seed 75,055 formation-days, 68,179 of them 330 American formations on the land the Easter Offensive of
// 1972 gave the National Liberation Front (a `transfer`), 157 of those gone before the armistice. At a day's first
// hour such a formation, standing or waiting, is set down behind the line as a stage's are; with no land of its side
// in reach it is taken off, its men back to the pool.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
type Event = TimelineFile['events'][number];
// Western Poland, as the sibling tests have it.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const WAR: Event = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] };
const HOLD: Event = { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' };

afterEach(() => {
  delete TRACK_PROBE.onLeft;
  TRACK_PROBE.leftOff = false;
});

/** The world of `events` three hours in with its AI off (the armies stay where they stand), stepped on to `tick`. */
function still(events: Event[], tick: number): Sim {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, { events });
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  if (tick > 3) sim.step(tick - 3, quiet);
  return sim;
}

const cellOf = (w: World, f: number): number => Math.floor(w.formations.cols.y[f]!) * w.cells.w + Math.floor(w.formations.cols.x[f]!);
const holderOf = (w: World, f: number): number => w.cells.controller[cellOf(w, f)]!;
/** The land formations of `nation` not aboard, by id. */
function landOf(w: World, nation: number): number[] {
  const out: number[] = [];
  w.formations.forEach((f) => {
    if (w.formations.cols.nation[f] === nation && w.rules?.templates[w.formations.cols.template[f]!]?.domain === Domain.land && !w.offLand(f)) out.push(f);
  });
  return out;
}
/** Formation `f` put in the middle of `cell`, off any march: where the timeline has left it. */
function put(w: World, f: number, cell: number): void {
  const c = w.formations.cols;
  c.x[f] = (cell % w.cells.w) + 0.5;
  c.y[f] = Math.floor(cell / w.cells.w) + 0.5;
  c.moving[f] = 0;
  c.engaged[f] = 0;
  c.retreat[f] = 0;
  c.home[f] = 0;
  w.paths.delete(f);
  w.playerOrders.delete(f);
}
/** The first land cell `holder` holds in the box of cells for which `ok`. */
function cellWhere(w: World, holder: number, x0: number, x1: number, y0: number, y1: number, ok: (x: number, y: number) => boolean = () => true): number {
  const W = w.cells.w;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (w.cells.controller[y * W + x] === holder && isLand(w.cells.terrain[y * W + x]!) && ok(x, y)) return y * W + x;
  throw new Error(`no cell of nation ${holder}'s in ${x0}..${x1}, ${y0}..${y1}`);
}
/** Whether a cell within `far` cells (as the crow flies) of (x, y) is `holder`'s. */
function near(w: World, holder: number, x: number, y: number, far: number): boolean {
  const W = w.cells.w;
  for (let dy = -far; dy <= far; dy++) for (let dx = -far; dx <= far; dx++) if (Math.hypot(dx, dy) <= far && w.cells.controller[(y + dy) * W + x + dx] === holder) return true;
  return false;
}

describe("a formation the timeline leaves on a held foe's ground is set down behind the line (ROADMAP R239)", () => {
  // The hour of the event swept: at a day's first hour, an hour after it, an hour before it.
  for (const hour of [0, 1, 23]) {
    it(`land ceded under them at hour ${hour}: at the next day's first hour each stands on its own land, none lost, two to a cell at the most`, () => {
      const [GER, POL] = [id('GER'), id('POL')];
      const day = 19;
      const transfer: Event = { date: '1938-01-20', hour, kind: 'transfer', to: 'GER', from: ['POL'], ring: RING };
      const sim = still([WAR, HOLD, transfer], day * 24 + hour);
      const w = sim.world;
      const W = w.cells.w;
      const [u0, v0] = project(14.0, 54.5);
      const [u1, v1] = project(19.0, 50.0);
      const inRing = (f: number): boolean => {
        const [x, y] = [w.formations.cols.x[f]!, w.formations.cols.y[f]!];
        return x >= u0 * W && x <= u1 * W && y >= v0 * w.cells.h && y <= v1 * w.cells.h;
      };
      const there = landOf(w, POL).filter((f) => inRing(f) && holderOf(w, f) === POL);
      expect(there.length, "Poland's formations on the land to be ceded").toBeGreaterThanOrEqual(5);
      const men = w.nations.cols.manpower[POL]!;
      const told: number[] = [];
      TRACK_PROBE.onLeft = (_formation, n, holder, to) => {
        expect([n, holder]).toEqual([POL, GER]);
        told.push(to);
      };
      // The hour of the transfer.
      sim.step(1, quiet);
      const onGerman = (): number[] => there.filter((f) => w.formations.has(f) && holderOf(w, f) === GER);
      expect(w.holdsPlan(POL, GER), 'the hold stands again').toBe(true);
      if (hour === 0) expect(onGerman(), "set down in the transfer's own hour, a day's first").toEqual([]);
      else {
        // Until the next day's first hour they stand where the transfer left them.
        expect(onGerman().length, 'left on German ground by the transfer').toBe(there.length);
        sim.step(24 - hour - 1, quiet);
        expect(onGerman().length, "an hour before the day's first").toBe(there.length);
        sim.step(1, quiet);
        expect(onGerman(), "at the day's first hour").toEqual([]);
      }
      // Every one of them still there, on Poland's own land, off any march; its men untouched.
      for (const f of there) {
        expect(w.formations.has(f), `formation ${f}`).toBe(true);
        expect(holderOf(w, f), `formation ${f}'s ground`).toBe(POL);
        expect(w.formations.cols.moving[f]).toBe(0);
      }
      expect(w.nations.cols.manpower[POL]).toBe(men);
      expect(told.length).toBe(there.length);
      // Along the line, not all on its nearest cell: SET_DOWN_PER_CELL of them a cell.
      const by = new Map<number, number>();
      for (const to of told) by.set(to, (by.get(to) ?? 0) + 1);
      expect(Math.max(...by.values())).toBeLessThanOrEqual(SET_DOWN_PER_CELL);
      // And they stay: a day on, where they were set down.
      const at = there.map((f) => cellOf(w, f));
      sim.step(24, quiet);
      expect(there.map((f) => cellOf(w, f))).toEqual(at);
    }, 300_000);
  }

  it("in a stage's days they are left where they stand; when its days end, set down", () => {
    const [GER, POL] = [id('GER'), id('POL')];
    const stage: Event = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING };
    const open = 14 * 24 + 1 - FIGHT_DAYS * 24;
    const sim = still([WAR, HOLD, stage], open + 5);
    const w = sim.world;
    expect(w.holdsPlan(POL, GER), "the stage's days are open").toBe(false);
    // A Polish formation on Germany's ground, a cell or two from the border: left there by the fighting.
    const f = landOf(w, POL)[0]!;
    const cell = cellWhere(w, GER, 1100, 1125, 262, 285, (x, y) => near(w, POL, x, y, 2) && !near(w, POL, x, y, 1));
    put(w, f, cell);
    // Three day-starts in the stage's days: it stands.
    sim.step(3 * 24, quiet);
    expect(cellOf(w, f)).toBe(cell);
    // The stage's hour, 15 January 01:00, and on to the next day's first hour: the hold stands, and it is set down.
    sim.step(14 * 24 + 2 - sim.tick, quiet);
    expect(w.holdsPlan(POL, GER)).toBe(true);
    expect(cellOf(w, f), "until the day's first hour").toBe(cell);
    sim.step(15 * 24 + 1 - sim.tick, quiet);
    expect(w.formations.has(f)).toBe(true);
    expect(holderOf(w, f)).toBe(POL);
  }, 300_000);

  it('the land of an ally in its war serves, where that is the nearest', () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    const war: Event = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL', 'CZS'] };
    const hold: Event = { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL', 'CZS']], until: '1939-01-01' };
    const sim = still([war, hold], 30);
    const w = sim.world;
    expect(w.wars.sameSide(POL, CZS)).toBe(true);
    // A Czech formation on German ground by the Corridor, Poland next to it and Czechoslovakia 12 cells and more south.
    const czech = landOf(w, CZS)[0]!;
    const north = cellWhere(w, GER, 1105, 1135, 250, 262, (x, y) => near(w, POL, x, y, 1));
    expect(near(w, CZS, north % w.cells.w, Math.floor(north / w.cells.w), 12)).toBe(false);
    put(w, czech, north);
    const told: [number, number][] = [];
    TRACK_PROBE.onLeft = (formation, _n, _holder, to) => void told.push([formation, to]);
    sim.step(48 - sim.tick + 1, quiet);
    expect(w.formations.has(czech)).toBe(true);
    expect(holderOf(w, czech), "the Czech formation's ground").toBe(POL);
    expect(told).toEqual([[czech, cellOf(w, czech)]]);
  }, 300_000);

  it('with no land of its side in reach it is taken off, its men back to the pool', () => {
    const [GER, POL] = [id('GER'), id('POL')];
    // The same world twice, the formation put in the same place: with the rule, and with it off (the pool's other
    // comings and goings of the day are the same in both).
    const after = (off: boolean): { has: boolean; men: number; strength: number; told: [number, number][] } => {
      const sim = still([WAR, HOLD], 30);
      const w = sim.world;
      // A Polish formation in the Rhineland: Poland's land is 45 cells and more off, FALL_BACK_CELLS are 40.
      const pole = landOf(w, POL)[0]!;
      const rhine = cellWhere(w, GER, 1060, 1064, 286, 292);
      expect(near(w, POL, rhine % w.cells.w, Math.floor(rhine / w.cells.w), FALL_BACK_CELLS + 4)).toBe(false);
      put(w, pole, rhine);
      const told: [number, number][] = [];
      TRACK_PROBE.onLeft = (formation, _n, _holder, to) => void told.push([formation === pole ? 1 : 0, to]);
      // To the hour before the day's first, then that hour.
      sim.step(47 - sim.tick + 1, quiet);
      const strength = w.formations.cols.strength[pole]!;
      TRACK_PROBE.leftOff = off;
      sim.step(1, quiet);
      TRACK_PROBE.leftOff = false;
      return { has: w.formations.has(pole), men: w.nations.cols.manpower[POL]!, strength, told };
    };
    const [on, off] = [after(false), after(true)];
    expect(off.has, 'with the rule off it stands there').toBe(true);
    expect(off.told).toEqual([]);
    expect(on.has, 'the Polish formation in the Rhineland').toBe(false);
    expect(on.told).toEqual([[1, -1]]);
    expect(on.strength).toBeGreaterThan(1000);
    expect(on.men - off.men, 'its men, back in the pool').toBeCloseTo(on.strength, 3);
  }, 300_000);

  it('left where it is: one the timeline keeps for its stage, and one on a march that does not wait', () => {
    const [GER, POL] = [id('GER'), id('POL')];
    const sim = still([WAR, HOLD], 30);
    const w = sim.world;
    const [kept, walker, plain] = landOf(w, POL);
    const border = (not: number[]): number => cellWhere(w, GER, 1100, 1125, 262, 285, (x, y) => near(w, POL, x, y, 1) && !not.includes(y * w.cells.w + x));
    const a = border([]);
    const b = border([a]);
    const c = border([a, b]);
    // Kept where it arrived for its stage (R66d).
    put(w, kept!, a);
    w.playerOrders.set(kept!, { kind: PlayerOrderKind.kept, until: 400 * 24, through: false });
    // On a march to Poland's own land next to it: its next step is off that ground.
    put(w, walker!, b);
    const W = w.cells.w;
    let to = -1;
    for (const k of [b - 1, b + 1, b - W, b + W, b - W - 1, b - W + 1, b + W - 1, b + W + 1]) if (to < 0 && w.cells.controller[k] === POL) to = k;
    expect(to).toBeGreaterThanOrEqual(0);
    expect(marchTo(w, walker!, (to % W) + 0.5, Math.floor(to / W) + 0.5)).toBe(true);
    // And one that only stands there, for the difference.
    put(w, plain!, c);
    const told: number[] = [];
    TRACK_PROBE.onLeft = (formation) => void told.push(formation);
    sim.step(48 - sim.tick + 1, quiet);
    expect(told).toEqual([plain]);
    expect(cellOf(w, kept!)).toBe(a);
    expect(holderOf(w, plain!)).toBe(POL);
    // The walker went by itself: within a step of where it stood, and on to its own land.
    expect(Math.hypot((cellOf(w, walker!) % W) - (b % W), Math.floor(cellOf(w, walker!) / W) - Math.floor(b / W))).toBeLessThanOrEqual(1.5);
    sim.step(72, quiet);
    expect(holderOf(w, walker!)).toBe(POL);
    expect(told).toEqual([plain]);
  }, 300_000);
});
