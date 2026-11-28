import { afterEach, describe, expect, it } from 'vitest';
import { Refusal, type Command } from '../../src/shared/commands';
import { EventKind, RejectReason, TrackEnd } from '../../src/shared/events';
import { isLand } from '../../src/shared/terrain';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { orderRebase } from '../../src/sim/systems/air';
import { foreignTo, formationPath, marchTo } from '../../src/sim/systems/movement';
import { FIGHT_DAYS, TRACK_PROBE } from '../../src/sim/track';
import { Domain, type World } from '../../src/sim/world';
import { useTags, worldBreaks } from '../helpers/diploInvariants';
import { assets1938 } from '../helpers/earth';
import { addDivision } from '../helpers/sim1938';

// ROADMAP R240 (ADR-1169; found by R236's review). The first command applied while the historical track runs ends it
// (R62j0, ADR-945), and an order counts as applied whether or not it is given (a refused one is told by
// `MoveRejected`). The order was judged before the end, by the world the track steers: since R236 a march across a
// front the track holds was refused as a way barred by "nations outside its wars", which the held foe is not; the
// formation stood, the replay ended, and the same order given again was carried out. An order's command ends the track
// first, and the order is judged by the world it sets free: its holds gone, the occupations it excused given back, the
// war a hold outlives the timeline with at peace. The timeline's own orders (`redeploy`) keep the holds and end nothing.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const [GER, POL] = [id('GER'), id('POL')] as [number, number];
// The war-and-peace checker's lines by tag (ADR-804): after an order has ended the track the world breaks none of
// `held` and `realm` (`worldBreaks`), the occupations the track excused given back.
useTags((n) => TAGS_1938H[n - 1] ?? String(n));
const template = (t: string): number => TEMPLATES_1938.findIndex((x) => x.id === t);
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
type Timeline = TimelineFile['events'];
const war = (by: string, foe: string): Timeline[number] => ({ date: '1938-01-01', kind: 'war', attackers: [by], defenders: [foe] });
const hold = (by: string, foe: string): Timeline[number] => ({ date: '1938-01-01', hour: 1, kind: 'hold', sides: [[by], [foe]], until: '1939-01-01' });
const [WAR, HOLD] = [war('GER', 'POL'), hold('GER', 'POL')];
// Western Poland, taken by Germany on 15 January 1938, its days of fighting from the 8th.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const STAGE: Timeline[number] = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING };
const OPEN = 14 * 24 + 1 - FIGHT_DAYS * 24;
// Poland west of 22° E held by Germany, the two at peace: an occupation the track excuses, given back at its end (R84a).
const ZONE: [number, number][] = [[14.0, 54.5], [22.0, 54.5], [22.0, 50.0], [14.0, 50.0]];
const OCCUPIED: Timeline[number] = { date: '1938-01-01', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: ZONE };
// Germany's formations about Berlin sent by rail to East Prussia, beyond the held front.
const BERLIN: [number, number][] = [[12.3, 53.6], [14.4, 53.6], [14.4, 51.6], [12.3, 51.6]];
const REDEPLOY: Timeline[number] = { date: '1938-01-02', kind: 'redeploy', nation: 'GER', from: BERLIN, to: [[20.5, 53.8]], share: 1 };

/**
 * The fronts held: who is ordered, whose land lies beyond the line, the world's seed, and a place far inland (a
 * fleet's order there is refused). In their first five days two seeds of one front are the same marches (nothing is
 * left to chance under a hold), so the second seed has a front of its own: the China front, the replay's longest.
 */
const FRONTS = [
  { by: 'GER', foe: 'POL', seed: SEED_1938H, inland: [13.4, 52.5] },
  { by: 'JAP', foe: 'CHI', seed: 5, inland: [108.9, 34.3] },
] as const;
type Front = (typeof FRONTS)[number];
const HOURS = [6, 24, 48, 72, 120];
const OFFSETS = [1, 3, 8];

afterEach(() => {
  TRACK_PROBE.holdsOff = false;
});

const make = (seed: number, events: Timeline, end?: string): Sim => new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) }, { events, ...(end ? { end } : {}) });

/** The world of `events` three hours in, the AI off from then (a test's orders stay its own). */
function world(events: Timeline, end?: string): Sim {
  const sim = make(SEED_1938H, events, end);
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  return sim;
}

/**
 * A front's two nations at war, their front held from the first hour, `HOURS[k]` in: the AI's own world until then
 * (the divisions stand at 6 hours and are on the march from a day in), the AI off from then. `into`: a sim of this
 * front to load it into (the sweep's: one world made, each case loaded).
 */
const kept = new Map<Front, Uint8Array[]>();
function heldAt(front: Front, k: number, into?: Sim): Sim {
  const events = [war(front.by, front.foe), hold(front.by, front.foe)];
  let saves = kept.get(front);
  if (!saves) {
    saves = [];
    const base = make(front.seed, events);
    for (const h of HOURS) {
      base.step(h - base.tick, quiet);
      saves.push(base.save());
    }
    kept.set(front, saves);
  }
  const sim = into ?? make(front.seed, events);
  sim.load(saves[k]!);
  sim.world.settings.aiEnabled = false;
  return sim;
}

interface Ev {
  kind: number;
  a: number;
  b: number;
  x: number;
}
/** Sends `cmds` in one hour, applied by a tick or between two ticks (`applyNow`: God Mode's way); the hour's events in order. */
function send(sim: Sim, cmds: Command[], now: boolean): Ev[] {
  quiet(sim.world);
  for (const cmd of cmds) expect(sim.command(cmd)).toBe(true);
  const out: Ev[] = [];
  const take = (w: World): void => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) out.push({ kind: ev[i + 1]!, a: ev[i + 2]!, b: ev[i + 3]!, x: ev[i + 4]! });
    quiet(w);
  };
  if (now) sim.applyNow(take);
  else sim.step(1, take);
  return out;
}
/** Why the track ended in those events: one entry an end. */
const ends = (ev: Ev[]): number[] => ev.filter((e) => e.kind === EventKind.TrackEnded).map((e) => e.b);
/** Why formation `f`'s orders were refused in those events. */
const refusals = (ev: Ev[], f: number): number[] => ev.filter((e) => e.kind === EventKind.MoveRejected && e.a === f).map((e) => e.x);
/** The commands refused in those events, by why. */
const refused = (ev: Ev[]): number[] => ev.filter((e) => e.kind === EventKind.CommandRefused).map((e) => e.b);
const first = (ev: Ev[], kind: number): number => ev.findIndex((e) => e.kind === kind);
const by = (now: boolean): string => (now ? 'by applyNow' : 'by a tick');

const cellOf = (w: World, f: number): number => Math.floor(w.formations.cols.y[f]!) * w.cells.w + Math.floor(w.formations.cols.x[f]!);
const point = (w: World, cell: number): { x: number; y: number } => ({ x: (cell % w.cells.w) + 0.5, y: Math.floor(cell / w.cells.w) + 0.5 });
const lonLat = (w: World, lon: number, lat: number): number => {
  const [u, v] = project(lon, lat);
  return Math.floor(v * w.cells.h) * w.cells.w + Math.floor(u * w.cells.w);
};
/** How many cells of formation `f`'s way nation `n` holds (-1: it is not on the march). */
function over(w: World, f: number, n: number): number {
  if (w.formations.cols.moving[f] !== 1) return -1;
  const path = formationPath(w, f);
  return path ? Array.from(path).filter((k) => w.cells.controller[k] === n).length : -1;
}
/** Whether `f` is a land formation of nation `n` on land, in no fight and on no retreat. */
const landOf = (w: World, f: number, n: number): boolean => {
  const c = w.formations.cols;
  return c.nation[f] === n && w.rules?.templates[c.template[f]!]?.domain === Domain.land && !w.offLand(f) && c.retreat[f] === 0 && c.engaged[f] === 0;
};
/** The first fleet and the first based wing of nation `n`. */
function afloatAndAloft(w: World, n: number): { fleet: number; wing: number } {
  let [fleet, wing] = [0, 0];
  w.formations.forEach((f) => {
    if (w.formations.cols.nation[f] !== n) return;
    if (fleet === 0 && w.isFleet(f)) fleet = f;
    if (wing === 0 && w.isWing(f) && w.wingBase.has(f)) wing = f;
  });
  expect(fleet * wing, 'a fleet and a wing of the nation').toBeGreaterThan(0);
  return { fleet, wing };
}

/**
 * A land formation of nation `n` on its own ground, standing or (`marching`) in the middle of a step of a march, and
 * the cell `off` cells past the front from it: the nearest cell within 10 that `beyond` says is across the line, and on
 * from it the same way. null with none such.
 */
function onto(w: World, n: number, beyond: (cell: number) => boolean, off: number, marching: boolean, skip: ReadonlySet<number> = new Set()): { f: number; cell: number } | null {
  const c = w.formations.cols;
  const { w: W, h: H, controller, terrain } = w.cells;
  let found: { f: number; cell: number } | null = null;
  w.formations.forEach((f) => {
    if (found || skip.has(f) || !landOf(w, f, n) || (c.moving[f] === 1 && c.stepFrac[f]! > 0) !== marching || (!marching && c.moving[f] === 1)) return;
    const [fx, fy] = [Math.floor(c.x[f]!), Math.floor(c.y[f]!)];
    if (controller[fy * W + fx] !== n || beyond(fy * W + fx)) return;
    let [px, py, far] = [0, 0, Infinity];
    for (let dy = -10; dy <= 10; dy++) {
      for (let dx = -10; dx <= 10; dx++) {
        const [x, y] = [fx + dx, fy + dy];
        if (x < 0 || x >= W || y < 0 || y >= H || !beyond(y * W + x) || Math.hypot(dx, dy) >= far) continue;
        [px, py, far] = [x, y, Math.hypot(dx, dy)];
      }
    }
    if (far === Infinity) return;
    const [x, y] = [Math.round(px + ((px - fx) / far) * (off - 1)), Math.round(py + ((py - fy) / far) * (off - 1))];
    if (x < 0 || x >= W || y < 0 || y >= H || !beyond(y * W + x) || !isLand(terrain[y * W + x]!)) return;
    found = { f, cell: y * W + x };
  });
  return found;
}
/** `onto` across a front: the cells its foe holds. */
const past = (w: World, front: Front, off: number, marching: boolean, skip?: ReadonlySet<number>): { f: number; cell: number } | null => onto(w, id(front.by), (cell) => w.cells.controller[cell] === id(front.foe), off, marching, skip);

/** The land cell nearest formation `f`, within 60 cells, that a nation outside its wars holds (`foreignTo`). */
function neutralNear(w: World, f: number): number {
  const c = w.formations.cols;
  const { w: W, h: H, controller, terrain } = w.cells;
  const [fx, fy] = [Math.floor(c.x[f]!), Math.floor(c.y[f]!)];
  let [cell, far] = [-1, Infinity];
  for (let dy = -60; dy <= 60; dy++) {
    for (let dx = -60; dx <= 60; dx++) {
      const [x, y] = [fx + dx, fy + dy];
      if (x < 0 || x >= W || y < 0 || y >= H || Math.hypot(dx, dy) >= far || !isLand(terrain[y * W + x]!) || !foreignTo(w, c.nation[f]!, controller[y * W + x]!)) continue;
      [cell, far] = [y * W + x, Math.hypot(dx, dy)];
    }
  }
  expect(cell, 'ground of a nation outside its wars within 60 cells').toBeGreaterThanOrEqual(0);
  return cell;
}

/**
 * A German land formation about Berlin and a cell Germany holds, 8 cells or more apart, whose way with no hold goes
 * over 4 cells of Poland's or more, and for which `round` says whether the hold leaves a way (Silesia: round by German
 * land) or none (East Prussia: none but over Poland). Asked of a world of its own (the asking orders marches).
 */
function across(round: boolean): { f: number; cell: number } {
  const w = heldAt(FRONTS[0], 0).world;
  const c = w.formations.cols;
  const W = w.cells.w;
  let found: { f: number; cell: number } | null = null;
  w.formations.forEach((f) => {
    if (found || !landOf(w, f, GER) || c.moving[f] === 1 || c.x[f]! < 1095 || c.x[f]! > 1105 || c.y[f]! < 260 || c.y[f]! > 272) return;
    const [fx, fy] = [Math.floor(c.x[f]!), Math.floor(c.y[f]!)];
    for (let y = 250; y <= 290 && !found; y += 2) {
      for (let x = 1098; x <= 1140 && !found; x += 2) {
        if (w.cells.controller[y * W + x] !== GER || Math.hypot(x - fx, y - fy) < 8) continue;
        const way = (off: boolean): number => {
          TRACK_PROBE.holdsOff = off;
          const n = marchTo(w, f, x + 0.5, y + 0.5) ? over(w, f, POL) : -1;
          TRACK_PROBE.holdsOff = false;
          c.moving[f] = 0;
          w.paths.delete(f);
          return n;
        };
        if (way(true) >= 4 && (way(false) >= 0) === round) found = { f, cell: y * W + x };
      }
    }
  });
  expect(found, `a German march over Poland with ${round ? 'a' : 'no'} way round`).not.toBeNull();
  return found!;
}

describe.each(FRONTS)('an order given while the historical track runs is judged by the world it sets free (ROADMAP R240): $by on $foe, seed $seed', (front) => {
  const [BY, FOE] = [id(front.by), id(front.foe)];

  it("a march onto the held foe's land, 1, 3 and 8 cells past the front, 6 hours to 5 days in: the track ends, and it is on the march over that land", () => {
    let [standing, marching] = [0, 0];
    const sim = heldAt(front, 0);
    const w = sim.world;
    for (const [k, h] of HOURS.entries()) {
      for (const off of OFFSETS) {
        for (const moving of [false, true]) {
          for (const named of [false, true]) {
            for (const now of [false, true]) {
              heldAt(front, k, sim);
              expect(w.track!.ended).toBe(false);
              expect(w.holdsPlan(BY, FOE)).toBe(true);
              const pick = past(w, front, off, moving);
              if (!pick) continue;
              const tag = `${h} hours in, ${off} cells past the front, ${moving ? 'in the middle of a step' : 'standing'}, ${named ? 'its nation named' : 'no nation named'}, ${by(now)}`;
              const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...point(w, pick.cell), ...(named ? { nation: BY } : {}) }], now);
              expect(ends(ev), tag).toEqual([TrackEnd.intervention]);
              expect(refused(ev), tag).toEqual([]);
              expect(first(ev, EventKind.TrackEnded), tag).toBeLessThan(first(ev, EventKind.CommandApplied));
              expect(w.track!.ended, tag).toBe(true);
              expect(w.wars.atWar(BY, FOE), tag).toBe(true);
              const told = refusals(ev, pick.f);
              // Within a tick a player's march that meets the enemy stands and fights (ADR-759): the order was given.
              if (!now && named && told.length === 1 && told[0] === RejectReason.Contact) continue;
              expect(told, tag).toEqual([]);
              expect(over(w, pick.f, FOE), `${tag}: cells of the foe's on its way`).toBeGreaterThan(0);
              if (moving) marching++;
              else standing++;
            }
          }
        }
      }
    }
    // Both kinds of unit at each offset, by each way and name.
    expect(standing, 'cases of a standing formation').toBeGreaterThanOrEqual(OFFSETS.length * 4);
    expect(marching, 'cases of a formation in the middle of a step').toBeGreaterThanOrEqual(OFFSETS.length * 4);
  }, 600_000);

  it('several marches of one hour: the first ends the track, and each is given', () => {
    for (const all of [false, true]) {
      for (const now of [false, true]) {
        const sim = heldAt(front, 0);
        const w = sim.world;
        const picks: { f: number; cell: number }[] = [];
        const skip = new Set<number>();
        for (let p = past(w, front, 3, false, skip); p && (all || picks.length < 3); p = past(w, front, 3, false, skip)) {
          picks.push(p);
          skip.add(p.f);
        }
        expect(picks.length).toBeGreaterThanOrEqual(3);
        const ev = send(sim, picks.map((p) => ({ kind: 'moveFormation' as const, id: p.f, ...point(w, p.cell) })), now);
        const tag = `${picks.length} marches, ${by(now)}`;
        expect(ends(ev), tag).toEqual([TrackEnd.intervention]);
        expect(ev.filter((e) => e.kind === EventKind.CommandApplied), tag).toHaveLength(picks.length);
        expect(first(ev, EventKind.TrackEnded), tag).toBeLessThan(first(ev, EventKind.CommandApplied));
        for (const p of picks) {
          expect(refusals(ev, p.f), `${tag}: formation ${p.f}`).toEqual([]);
          expect(over(w, p.f, FOE), `${tag}: formation ${p.f}, cells of the foe's on its way`).toBeGreaterThan(0);
        }
        expect(worldBreaks(w), tag).toEqual([]);
      }
    }
  }, 600_000);

  it("the end comes before the order is judged, whatever the order: a march, a fleet's, a wing's mission and rebase, a paradrop", () => {
    for (const now of [false, true]) {
      const probe = heldAt(front, 0).world;
      const pick = past(probe, front, 3, false)!;
      const { fleet, wing } = afloatAndAloft(probe, BY);
      const neutral = neutralNear(probe, pick.f);
      // Each refused for a reason the track has no part in: across a nation outside the war, a fleet sent inland, a
      // strike and a base half a world away, a division at no airbase.
      const orders: [string, number, Command][] = [
        ['a march over a nation outside the war', pick.f, { kind: 'moveFormation', id: pick.f, ...point(probe, neutral) }],
        ['a fleet sent inland', fleet, { kind: 'moveFormation', id: fleet, ...point(probe, lonLat(probe, front.inland[0], front.inland[1])) }],
        ["a wing's strike beyond its range", wing, { kind: 'wingMission', id: wing, mission: 'strike', x: 100.5, y: 300.5 }],
        ["a wing's rebase to no base", wing, { kind: 'wingRebase', id: wing, x: 100.5, y: 300.5 }],
        ['a paradrop from no airbase', pick.f, { kind: 'paradrop', id: pick.f, ...point(probe, pick.cell) }],
      ];
      for (const [what, f, cmd] of orders) {
        const sim = heldAt(front, 0);
        const ev = send(sim, [cmd], now);
        const tag = `${what}, ${by(now)}`;
        expect(ends(ev), tag).toEqual([TrackEnd.intervention]);
        expect(refusals(ev, f), tag).toHaveLength(1);
        const [ended, told, applied] = [first(ev, EventKind.TrackEnded), ev.findIndex((e) => e.kind === EventKind.MoveRejected && e.a === f), first(ev, EventKind.CommandApplied)];
        expect(ended, `${tag}: the end before the refusal`).toBeLessThan(told);
        expect(told, `${tag}: the refusal before the command's own row`).toBeLessThan(applied);
      }
      // Across a nation outside the war the reason is the right one (it was the held front's too, R240).
      const sim = heldAt(front, 0);
      const ev = send(sim, [orders[0]![2]], now);
      expect(refusals(ev, pick.f)).toEqual([RejectReason.NoRoute]);
      expect(sim.world.formations.cols.moving[pick.f]).toBe(0);
    }
  }, 600_000);

  it("a command refused ends nothing: another nation's formation named, one on the retreat, a place that is no number or off the map", () => {
    const sim = heldAt(front, 0);
    const w = sim.world;
    const c = w.formations.cols;
    const pick = past(w, front, 3, false)!;
    const at = cellOf(w, pick.f);
    const { wing } = afloatAndAloft(w, BY);
    const to = point(w, pick.cell);
    const cases: [string, Command, number][] = [
      ["another nation's formation named", { kind: 'moveFormation', id: pick.f, ...to, nation: FOE }, Refusal.NoSuch],
      ['no number', { kind: 'moveFormation', id: pick.f, x: NaN, y: to.y }, Refusal.NotANumber],
      ['off the map', { kind: 'moveFormation', id: pick.f, x: 1e9, y: to.y }, Refusal.OutOfRange],
      ["a paradrop of another nation's", { kind: 'paradrop', id: pick.f, ...to, nation: FOE }, Refusal.NoSuch],
      ["a mission of another nation's wing", { kind: 'wingMission', id: wing, mission: 'patrol', ...to, nation: FOE }, Refusal.NoSuch],
      ["a rebase of another nation's wing", { kind: 'wingRebase', id: wing, ...to, nation: FOE }, Refusal.NoSuch],
    ];
    for (const now of [true, false]) {
      for (const [what, cmd, why] of cases) {
        const ev = send(sim, [cmd], now);
        const tag = `${what}, ${by(now)}`;
        expect(refused(ev), tag).toEqual([why]);
        expect(ends(ev), tag).toEqual([]);
        expect(w.track!.ended, tag).toBe(false);
        expect(refusals(ev, pick.f), tag).toEqual([]);
      }
      // On the retreat it takes no order (ADR-173): between two ticks, the mark the test's own.
      c.retreat[pick.f] = 1;
      const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...to }], true);
      c.retreat[pick.f] = 0;
      expect(refused(ev)).toEqual([Refusal.OnRetreat]);
      expect(ends(ev)).toEqual([]);
      expect(w.track!.ended).toBe(false);
    }
    expect(c.moving[pick.f]).toBe(0);
    expect(cellOf(w, pick.f)).toBe(at);
    expect(w.holdsPlan(BY, FOE)).toBe(true);
    // And the first taken ends it.
    const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...to }], true);
    expect(ends(ev)).toEqual([TrackEnd.intervention]);
    expect(over(w, pick.f, FOE)).toBeGreaterThan(0);
  }, 600_000);
});

describe('an order while the track runs, on Germany and Poland (ROADMAP R240)', () => {
  it("a march to its own land beyond the held foe's: with no way round it is given, over the foe's land; with one, it goes the straight way too", () => {
    for (const round of [false, true]) {
      for (const now of [false, true]) {
        const pick = across(round);
        const sim = heldAt(FRONTS[0], 0);
        const w = sim.world;
        const tag = `${round ? 'a way round' : 'no way round'}, ${by(now)}`;
        const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...point(w, pick.cell) }], now);
        expect(ends(ev), tag).toEqual([TrackEnd.intervention]);
        expect(refusals(ev, pick.f), tag).toEqual([]);
        expect(over(w, pick.f, POL), `${tag}: cells of Poland's on its way`).toBeGreaterThanOrEqual(4);
        expect(w.formations.cols.targetCell[pick.f], tag).toBe(pick.cell);
      }
    }
  }, 600_000);

  it("the timeline's own order across a held front is refused as before, and the track runs on", () => {
    const sim = world([WAR, HOLD, REDEPLOY]);
    const w = sim.world;
    const c = w.formations.cols;
    const ring = new Set<number>();
    while (sim.tick < 24) sim.step(1, quiet);
    w.formations.forEach((f) => {
      if (landOf(w, f, GER) && c.x[f]! >= 1096 && c.x[f]! <= 1104 && c.y[f]! >= 261 && c.y[f]! <= 271) ring.add(f);
    });
    expect(ring.size).toBeGreaterThanOrEqual(4);
    const ev = send(sim, [], false);
    expect(ends(ev)).toEqual([]);
    expect(w.track!.ended).toBe(false);
    expect(w.track!.next).toBe(3);
    for (const f of ring) {
      expect(refusals(ev, f), `formation ${f}`).toEqual([RejectReason.NoRoute]);
      expect(c.moving[f], `formation ${f}`).toBe(0);
    }
    expect(w.holdsPlan(GER, POL)).toBe(true);
  }, 600_000);

  it("in the days of a stage a march onto the stage's land is given, and the track ends", () => {
    for (const now of [false, true]) {
      const sim = world([WAR, HOLD, STAGE]);
      const w = sim.world;
      while (sim.tick < OPEN + 1) sim.step(1, quiet);
      expect(w.holds(GER, POL)).toBe(true);
      expect(w.holdsPlan(GER, POL)).toBe(false);
      const [u0, v0] = project(14.0, 54.5);
      const [u1, v1] = project(19.0, 50.0);
      const { w: W, h: H } = w.cells;
      const inRing = (cell: number): boolean => (cell % W) + 0.5 >= u0 * W && (cell % W) + 0.5 <= u1 * W && Math.floor(cell / W) + 0.5 >= v0 * H && Math.floor(cell / W) + 0.5 <= v1 * H;
      const pick = onto(w, GER, (cell) => w.cells.controller[cell] === POL && inRing(cell), 2, false)!;
      expect(pick).not.toBeNull();
      const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...point(w, pick.cell) }], now);
      expect(ends(ev)).toEqual([TrackEnd.intervention]);
      expect(refusals(ev, pick.f)).toEqual([]);
      expect(over(w, pick.f, POL)).toBeGreaterThan(0);
    }
  }, 600_000);

  it('a hold that outlives the timeline: its war ends in a white peace as the track ends, and the march is refused by that peace', () => {
    for (const now of [false, true]) {
      const sim = world([WAR, HOLD], '1938-06-01');
      const w = sim.world;
      expect(w.holdsPlan(GER, POL)).toBe(true);
      const pick = onto(w, GER, (cell) => w.cells.controller[cell] === POL, 3, false)!;
      const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...point(w, pick.cell) }], now);
      expect(ends(ev)).toEqual([TrackEnd.intervention]);
      expect(w.wars.atWar(GER, POL)).toBe(false);
      expect(refusals(ev, pick.f)).toEqual([RejectReason.NoRoute]);
      expect(first(ev, EventKind.PeaceSigned)).toBeGreaterThanOrEqual(0);
      expect(first(ev, EventKind.PeaceSigned)).toBeLessThan(ev.findIndex((e) => e.kind === EventKind.MoveRejected && e.a === pick.f));
      expect(w.formations.cols.moving[pick.f]).toBe(0);
      expect(worldBreaks(w)).toEqual([]);
    }
  }, 600_000);

  it('ground the track holds for a nation at peace with its owner goes back as it ends: a march onto it is refused at once, not given and barred an hour on', () => {
    for (const now of [false, true]) {
      const sim = world([OCCUPIED]);
      const w = sim.world;
      const { controller, owner } = w.cells;
      expect(w.wars.atWar(GER, POL)).toBe(false);
      const pick = onto(w, GER, (cell) => controller[cell] === GER && owner[cell] === POL, 3, false)!;
      expect(pick).not.toBeNull();
      // While the track runs the checker reads the occupation it excuses; once its end has given it back, none.
      expect(worldBreaks(w).filter((l) => l.startsWith('held: GER on POL'))).toHaveLength(1);
      const ev = send(sim, [{ kind: 'moveFormation', id: pick.f, ...point(w, pick.cell) }], now);
      expect(ends(ev)).toEqual([TrackEnd.intervention]);
      expect(worldBreaks(w)).toEqual([]);
      expect(controller[pick.cell]).toBe(POL);
      expect(refusals(ev, pick.f)).toEqual([RejectReason.NoRoute]);
      expect(w.formations.cols.moving[pick.f]).toBe(0);
      // No march of its to be barred in the hours after.
      const later: Ev[] = [];
      for (let h = 0; h < 3; h++) later.push(...send(sim, [], false));
      expect(refusals(later, pick.f)).toEqual([]);
    }
  }, 600_000);

  it("a wing's rebase to an airbase on such ground is refused: no base of its side there once the track has ended", () => {
    const base = world([OCCUPIED]);
    const save = base.save();
    const warsaw = base.world.airbases.findIndex((b) => b.name === 'Warsaw');
    const at = point(base.world, base.world.airbases[warsaw]!.cell);
    expect(base.world.cells.controller[base.world.airbases[warsaw]!.cell]).toBe(GER);
    expect(base.world.cells.owner[base.world.airbases[warsaw]!.cell]).toBe(POL);
    // A German wing that the rebase is given to while the track runs.
    const wings: number[] = [];
    base.world.formations.forEach((f) => {
      if (base.world.formations.cols.nation[f] === GER && base.world.isWing(f) && base.world.wingBase.has(f)) wings.push(f);
    });
    const wing = wings.find((f) => {
      const probe = make(SEED_1938H, [OCCUPIED]);
      probe.load(save);
      return orderRebase(probe.world, f, at.x, at.y) === 0;
    });
    expect(wing, 'a German wing within a ferry flight of Warsaw').toBeDefined();
    for (const now of [false, true]) {
      const sim = make(SEED_1938H, [OCCUPIED]);
      sim.load(save);
      const w = sim.world;
      const from = w.wingBase.get(wing!);
      const ev = send(sim, [{ kind: 'wingRebase', id: wing!, ...at }], now);
      expect(ends(ev)).toEqual([TrackEnd.intervention]);
      expect(w.cells.controller[w.airbases[warsaw]!.cell]).toBe(POL);
      expect(refusals(ev, wing!)).toEqual([RejectReason.NoBase]);
      expect(w.wingBase.get(wing!)).toBe(from);
    }
  }, 600_000);

  it('a paradrop onto such ground is refused: the ground of a nation at peace once the track has ended', () => {
    for (const now of [false, true]) {
      const sim = world([OCCUPIED]);
      const w = sim.world;
      const c = w.formations.cols;
      // Germany's two transport groups at the first's airbase, a garrison brigade there (as `paradrop1938.test.ts`).
      const wings = [...w.wingBase].filter(([f, b]) => c.nation[f] === GER && b > 0 && TEMPLATES_1938[c.template[f]!]!.id === 'air_transport_group').map(([f]) => f).sort((a, b) => a - b);
      expect(wings).toHaveLength(2);
      const base = w.wingBase.get(wings[0]!)!;
      w.wingBase.set(wings[1]!, base);
      const home = w.airbases[base - 1]!.cell;
      const brigade = addDivision(w, GER, ...w.cellPoint(home), template('garrison_brigade'));
      // Poznań, in the zone.
      const target = lonLat(w, 16.9, 52.4);
      expect(w.cells.controller[target]).toBe(GER);
      expect(w.cells.owner[target]).toBe(POL);
      const ev = send(sim, [{ kind: 'paradrop', id: brigade, ...point(w, target) }], now);
      expect(ends(ev)).toEqual([TrackEnd.intervention]);
      expect(w.cells.controller[target]).toBe(POL);
      expect(refusals(ev, brigade)).toEqual([RejectReason.NoRoute]);
      expect(cellOf(w, brigade)).toBe(home);
      for (const g of wings) expect(w.sorties.has(g)).toBe(false);
    }
  }, 600_000);
});
