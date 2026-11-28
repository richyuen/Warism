import { afterEach, describe, expect, it } from 'vitest';
import { project } from '../../src/sim/data/projection';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { CONTACT_CELLS } from '../../src/sim/systems/elements';
import { FALL_BACK_CELLS, FIGHT_DAYS, SET_DOWN_PER_CELL, TRACK_PROBE } from '../../src/sim/track';
import { Domain, FlipCause, type World } from '../../src/sim/world';
import { isLand } from '../../src/shared/terrain';
import { assets1938 } from '../helpers/earth';

// ROADMAP R243 (ADR-1168; found by R239, the rule the user chose: ADR-1167). The historical track's holds are between
// two nations wherever they stand (ADR-929), so a formation on an ally's front was held as its own nation is: a German
// division on Finland's land in August 1944 did not fight the Soviet Union, which fought Finland freely there and
// took the cell it stood on (the Eastern Front's hold stands to May 1945); the track set it down a cell back each
// morning (R239). Now, in a fight, a formation is held as the holder of the ground it stands on is, where that holder
// fights the same foe beside it: on an ally's fought front it fights, on an ally's frozen front it does not. And in
// the hour a cell is taken under it by a foe its nation is held off from, it is set down behind the line (its host's
// next cell): it falls back with its host's line, and is not left beside the foe until the next morning.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
type Event = TimelineFile['events'][number];
// Germany against Poland and Czechoslovakia, the two on one side.
const WAR: Event = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL', 'CZS'] };
const hold = (...held: string[]): Event => ({ date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], held], until: '1939-01-01' });
// Western Poland, as the sibling tests have it: a stage of Germany's on 15 January.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const STAGE: Event = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING };
const OPEN = 14 * 24 + 1 - FIGHT_DAYS * 24;
/** The cells of central Europe the tests look in: both of Germany's borders, with Poland and with Czechoslovakia. */
const BOX = { x0: 1085, x1: 1150, y0: 245, y1: 300 };

afterEach(() => {
  delete TRACK_PROBE.onLeft;
});

/** The seeds of the swept cases: the scenario's own and another (ADR-829). */
const SEEDS = [SEED_1938H, 7] as const;

/** The world of `events` on `seed` three hours in with its AI off (the armies stay where they stand), stepped on to `tick`. */
function still(events: Event[], tick = 3, seed: number = SEED_1938H): Sim {
  const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) }, { events });
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  if (tick > 3) sim.step(tick - 3, quiet);
  return sim;
}

/** The land formations of `nation` not aboard, heroes aside, by id. */
function landOf(w: World, nation: number): number[] {
  const out: number[] = [];
  w.formations.forEach((f) => {
    if (w.formations.cols.nation[f] === nation && w.rules?.templates[w.formations.cols.template[f]!]?.domain === Domain.land && !w.offLand(f) && !w.heroes.has(f)) out.push(f);
  });
  return out;
}
/** Formation `f` put in the middle of `cell`, off any march, in good order. */
function put(w: World, f: number, cell: number): void {
  const c = w.formations.cols;
  c.x[f] = (cell % w.cells.w) + 0.5;
  c.y[f] = Math.floor(cell / w.cells.w) + 0.5;
  c.moving[f] = 0;
  c.engaged[f] = 0;
  c.retreat[f] = 0;
  c.home[f] = 0;
  c.org[f] = 1;
  w.paths.delete(f);
  w.playerOrders.delete(f);
}
/**
 * Two land cells side by side in the box, the first held by `a` and the second by `b`, no land formation within `far`
 * cells of either (the fight read is the one the test sets up), neither among `not`; with `inside`, both for which it
 * holds.
 */
function sideBySide(w: World, a: number, b: number, not: number[] = [], inside: (x: number, y: number) => boolean = () => true, far = 5): [number, number] {
  const W = w.cells.w;
  const c = w.formations.cols;
  const at: [number, number][] = [];
  w.formations.forEach((f) => {
    if (w.rules?.templates[c.template[f]!]?.domain === Domain.land && !w.offLand(f)) at.push([c.x[f]!, c.y[f]!]);
  });
  const lonely = (cell: number): boolean => at.every(([x, y]) => Math.hypot(x - (cell % W) - 0.5, y - Math.floor(cell / W) - 0.5) > far);
  const land = (cell: number, holder: number): boolean => w.cells.controller[cell] === holder && isLand(w.cells.terrain[cell]!);
  for (let y = BOX.y0; y <= BOX.y1; y++) {
    for (let x = BOX.x0; x <= BOX.x1; x++) {
      const p = y * W + x;
      if (!land(p, a) || not.includes(p) || !inside(x, y) || !lonely(p)) continue;
      for (const q of [p - 1, p + 1, p - W, p + W]) if (land(q, b) && !not.includes(q) && inside(q % W, Math.floor(q / W)) && lonely(q)) return [p, q];
    }
  }
  throw new Error(`no quiet cells of nations ${a} and ${b} side by side`);
}
/** The hours of the next `hours` in which each of `fs` was in a fight, and the men each lost over them. */
function fought(sim: Sim, fs: number[], hours: number): { hours: number[]; lost: number[] } {
  const c = sim.world.formations.cols;
  const before = fs.map((f) => c.strength[f]!);
  const n = fs.map(() => 0);
  for (let h = 0; h < hours; h++) {
    sim.step(1, quiet);
    fs.forEach((f, i) => void (n[i] = n[i]! + (sim.world.formations.has(f) && sim.world.formations.cols.engaged[f] === 1 ? 1 : 0)));
  }
  return { hours: n, lost: fs.map((f, i) => before[i]! - (sim.world.formations.has(f) ? sim.world.formations.cols.strength[f]! : 0)) };
}

describe("a formation on an ally's land is held as that ally is (ROADMAP R243)", () => {
  // Where the foe stands swept (its own cell beside the host's, or the host's ground beside the guest's), and who is
  // with the guest (alone, or a formation of its host's in its cell).
  for (const foeOn of ['its own land', "the host's land"] as const) {
    for (const [company, seed] of (['alone', "beside a host's formation"] as const).flatMap((c) => SEEDS.map((x) => [c, x] as const))) {
      it(`its own nation held off from the foe, its host's front fought: it fights (the foe on ${foeOn}, the guest ${company}, seed ${seed})`, () => {
        const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
        const sim = still([WAR, hold('CZS')], 3, seed);
        const w = sim.world;
        expect(w.holds(CZS, GER) && !w.holds(POL, GER)).toBe(true);
        const [czech] = landOf(w, CZS);
        const [german] = landOf(w, GER);
        const [pole] = landOf(w, POL);
        // The guest on Poland's ground; the foe a cell off, on its own ground or on Poland's.
        const [p, q] = foeOn === 'its own land' ? sideBySide(w, POL, GER) : sideBySide(w, POL, POL);
        put(w, czech!, p);
        put(w, german!, q);
        if (company !== 'alone') put(w, pole!, p);
        expect(w.standsFor(CZS, p, GER)).toBe(POL);
        expect(w.holdsHere(CZS, GER, p, q)).toBe(false);
        const fs = company === 'alone' ? [czech!, german!] : [czech!, german!, pole!];
        const got = fought(sim, fs, 6);
        expect(got.hours, 'the hours each was in the fight').toEqual(fs.map(() => 6));
        for (const lost of got.lost) expect(lost).toBeGreaterThan(0);
      }, 300_000);

      it(`its own nation free against the foe, its host's front frozen: it does not fight (the foe on ${foeOn}, the guest ${company}, seed ${seed})`, () => {
        const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
        const sim = still([WAR, hold('POL')], 3, seed);
        const w = sim.world;
        expect(!w.holds(CZS, GER) && w.holds(POL, GER)).toBe(true);
        const [czech] = landOf(w, CZS);
        const [german] = landOf(w, GER);
        const [pole] = landOf(w, POL);
        const [p, q] = foeOn === 'its own land' ? sideBySide(w, POL, GER) : sideBySide(w, POL, POL);
        put(w, czech!, p);
        put(w, german!, q);
        if (company !== 'alone') put(w, pole!, p);
        expect(w.holdsHere(CZS, GER, p, q)).toBe(true);
        const fs = company === 'alone' ? [czech!, german!] : [czech!, german!, pole!];
        const got = fought(sim, fs, 6);
        expect(got.hours, 'the hours each was in a fight').toEqual(fs.map(() => 0));
        expect(got.lost.map((l) => Math.max(0, l))).toEqual(fs.map(() => 0));
      }, 300_000);
    }
  }

  it('on its own land it is held as its nation is, either way', () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    // Czechoslovakia held, Poland free: a Czech formation on Czech land does not fight; a Pole on Polish land does.
    for (const held of ['CZS', 'POL'] as const) {
      const sim = still([WAR, hold(held)]);
      const w = sim.world;
      const [czech] = landOf(w, CZS);
      const [pole] = landOf(w, POL);
      const [g1, g2] = landOf(w, GER);
      const [c0, c1] = sideBySide(w, CZS, GER);
      const [p0, p1] = sideBySide(w, POL, GER, [c0, c1]);
      expect(Math.hypot((c0 % w.cells.w) - (p0 % w.cells.w), Math.floor(c0 / w.cells.w) - Math.floor(p0 / w.cells.w)), 'the two fights apart').toBeGreaterThan(4 * w.atSize(CONTACT_CELLS));
      put(w, czech!, c0);
      put(w, g1!, c1);
      put(w, pole!, p0);
      put(w, g2!, p1);
      const got = fought(sim, [czech!, g1!, pole!, g2!], 6);
      expect(got.hours, `with ${held} held`).toEqual(held === 'CZS' ? [0, 0, 6, 6] : [6, 6, 0, 0]);
    }
  }, 300_000);

  it("in the days of a stage on its host's frozen front it fights as its host does, and not before them", () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    const sim = still([WAR, hold('POL'), STAGE], OPEN - 12);
    const w = sim.world;
    const [czech] = landOf(w, CZS);
    const [german] = landOf(w, GER);
    // Inside the stage's ring: the border west of Poznań.
    const [p, q] = sideBySide(w, POL, GER, [], (x, y) => x >= 1100 && x <= 1125 && y >= 262 && y <= 285);
    put(w, czech!, p);
    put(w, german!, q);
    expect(w.holdsHere(CZS, GER, p, q), 'before the days of the stage').toBe(true);
    expect(fought(sim, [czech!, german!], 6).hours).toEqual([0, 0]);
    // The stage's days: the hold is lifted there for Germany's side and their foes (R66d).
    sim.step(OPEN + 5 - sim.tick, quiet);
    expect(w.holdsPlan(POL, GER), "the stage's days are open").toBe(false);
    put(w, czech!, p);
    put(w, german!, q);
    expect(w.holdsHere(CZS, GER, p, q), 'in the days of the stage').toBe(false);
    const got = fought(sim, [czech!, german!], 3);
    expect(got.hours).toEqual([3, 3]);
  }, 300_000);

  it("a puppet host named by the hold: its overlord's formation on its land is held as it is", () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    // Czechoslovakia Poland's puppet, the hold on Czechoslovakia alone (the Burma front's shape: the Raj named, not
    // the United Kingdom).
    const puppet: Event = { date: '1938-01-01', kind: 'puppet', overlord: 'POL', subject: 'CZS', autonomy: 50 };
    const sim = still([puppet, WAR, hold('CZS')]);
    const w = sim.world;
    expect(w.nations.cols.overlord[CZS]).toBe(POL);
    expect(w.holds(CZS, GER) && !w.holds(POL, GER)).toBe(true);
    const [pole, pole2] = landOf(w, POL);
    const [g1, g2] = landOf(w, GER);
    // A Pole on Czech land beside a German: held as Czechoslovakia is. A Pole on Polish land beside one: it fights.
    const [c0, c1] = sideBySide(w, CZS, GER);
    const [p0, p1] = sideBySide(w, POL, GER, [c0, c1]);
    put(w, pole!, c0);
    put(w, g1!, c1);
    put(w, pole2!, p0);
    put(w, g2!, p1);
    expect(w.standsFor(POL, c0, GER)).toBe(CZS);
    expect(fought(sim, [pole!, g1!, pole2!, g2!], 6).hours).toEqual([0, 0, 6, 6]);
  }, 300_000);
});

const cellOf = (w: World, f: number): number => Math.floor(w.formations.cols.y[f]!) * w.cells.w + Math.floor(w.formations.cols.x[f]!);
/** The cells `far` cells from `cell` as the front presses (the larger of the two offsets). */
function ringAt(w: World, cell: number, far: number): number[] {
  const W = w.cells.w;
  const out: number[] = [];
  for (let dy = -far; dy <= far; dy++) for (let dx = -far; dx <= far; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === far) out.push(cell + dy * W + dx);
  return out;
}
/** `hours` more hours with `fs` kept in good order (too strong to break), each hour told to `each`. */
function unbroken(sim: Sim, fs: number[], hours: number, each: (tick: number) => void = () => undefined): void {
  for (let h = 0; h < hours; h++) {
    for (const f of fs) if (sim.world.formations.has(f)) sim.world.formations.cols.org[f] = 1;
    sim.step(1, quiet);
    each(sim.tick);
  }
}

/**
 * A Polish border cell under pressure, Germany held off from Czechoslovakia (`events`): on it `guests` formations of
 * Czechoslovakia's and, with `host`, one of Poland's own; with `fight`, a German formation beside it on German ground
 * (in contact); ten more two cells off (out of contact: their pressure takes the cell). `inside`: where the cell is.
 */
function pressed(events: Event[], start: number, o: { guests?: number; host?: boolean; fight?: boolean; seed?: number; inside?: (x: number, y: number, w: World) => boolean } = {}): { sim: Sim; czechs: number[]; pole: number; german: number; stack: number[]; p: number; q: number } {
  const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
  const sim = still(events, start, o.seed);
  const w = sim.world;
  expect(w.atSize(1), 'the map of the default size: contact 1.5 cells, pressure 2').toBe(1);
  const czechs = landOf(w, CZS).slice(0, o.guests ?? 1);
  const pole = landOf(w, POL)[0]!;
  const [german, ...stack] = landOf(w, GER).slice(0, 11);
  const [p, q] = sideBySide(w, POL, GER, [], (x, y) => o.inside?.(x, y, w) ?? true);
  const far = ringAt(w, p, 2).find((c) => w.cells.controller[c] === GER && isLand(w.cells.terrain[c]!));
  expect(far, "a German cell two cells from the formation's").toBeDefined();
  for (const f of czechs) put(w, f, p);
  if (o.host) put(w, pole, p);
  if (o.fight) put(w, german!, q);
  for (const g of stack) put(w, g, far!);
  return { sim, czechs, pole, german: german!, stack, p, q };
}
/** Stepped, `keep` in good order, until `cell` is Germany's: the hour it was taken (within `most` hours). */
function untilTaken(sim: Sim, keep: number[], cell: number, most = 30, each: (tick: number) => void = () => undefined): number {
  const GER = id('GER');
  for (let h = 0; h < most && sim.world.cells.controller[cell] !== GER; h++) unbroken(sim, keep, 1, each);
  expect(sim.world.cells.controller[cell], `the cell taken within ${most} hours`).toBe(GER);
  return sim.tick;
}
const holderOf = (w: World, f: number): number => w.cells.controller[cellOf(w, f)]!;

describe('a guest falls back with its host\'s line: set down in the hour a cell is taken under it (ROADMAP R243)', () => {
  // The hour swept (the cell taken in the evening, about the day's first hour, in the morning), and who is with it
  // (alone, or a formation of its host's in its cell, which stays).
  for (const start of [3, 8, 15]) {
    for (const [host, seed] of [false, true].flatMap((h) => SEEDS.map((x) => [h, x] as const))) {
      it(`the fight begun at hour ${start}, ${host ? "a host's formation beside it" : 'alone'}, seed ${seed}: in the hour its cell is taken it stands on its host's land, and fights again from there`, () => {
        const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
        const { sim, czechs, pole, german, p } = pressed([WAR, hold('CZS')], start, { host, fight: true, seed });
        const w = sim.world;
        const [czech] = czechs;
        const told: [number, number, number, number][] = [];
        TRACK_PROBE.onLeft = (...a) => void told.push(a);
        const fs = host ? [czech!, german, pole] : [czech!, german];
        // To the hour the cell is taken: it fought for it where it stood.
        let fights = 0;
        const at = untilTaken(sim, fs, p, 30, () => void (fights += w.formations.cols.engaged[czech!] === 1 ? 1 : 0));
        expect(at, 'the hour the cell was taken').toBeGreaterThan(start + 15);
        expect(fights, 'hours it fought for the cell').toBeGreaterThanOrEqual(at - start - 1);
        // In that hour: set down on Poland's land beside the cell, told once; a Polish formation is where it was.
        expect(told.length).toBe(1);
        expect(told[0]!.slice(0, 3)).toEqual([czech, CZS, GER]);
        expect(cellOf(w, czech!)).toBe(told[0]![3]);
        expect(holderOf(w, czech!), "the guest's ground").toBe(POL);
        expect(Math.max(Math.abs((cellOf(w, czech!) % w.cells.w) - (p % w.cells.w)), Math.abs(Math.floor(cellOf(w, czech!) / w.cells.w) - Math.floor(p / w.cells.w))), 'cells back').toBe(1);
        if (host) expect(cellOf(w, pole), "the host's own formation").toBe(p);
        // The foe comes on to the cell it took: the guest fights it from its host's next cell.
        put(w, german, p);
        const again = fought(sim, [czech!, german], 3);
        expect(again.hours).toEqual([3, 3]);
        expect(holderOf(w, czech!)).toBe(POL);
      }, 300_000);
    }
  }

  it("the line driven back twelve cells in eight days under an idle guest: at no hour's end is it on the foe's ground, and no day's first hour finds it there", () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    const { sim, czechs, stack } = pressed([WAR, hold('CZS')], 3);
    const w = sim.world;
    const [czech] = czechs;
    const told: number[] = [];
    TRACK_PROBE.onLeft = (formation, _n, _holder, to) => void (formation === czech ? told.push(to) : undefined);
    let onFoe = 0;
    let found = 0;
    const each = (tick: number): void => {
      const held = holderOf(w, czech!) === GER && w.holdsPlan(CZS, GER);
      if (held) onFoe++;
      // As the checker's `left` reads, at a day's first hour.
      if (held && tick % 24 === 0) found++;
    };
    let taken = 0;
    for (let cell = 0; cell < 12; cell++) {
      // The foe's stack two cells from the cell it stands on now: out of contact, its pressure takes the cell.
      const g = cellOf(w, czech!);
      expect(w.cells.controller[g], `cell ${cell}: the guest's ground`).toBe(POL);
      const far = ringAt(w, g, 2).find((c) => w.cells.controller[c] === GER && isLand(w.cells.terrain[c]!));
      expect(far, `cell ${cell}: a German cell two cells from the guest's`).toBeDefined();
      for (const s of stack) put(w, s, far!);
      untilTaken(sim, [czech!, ...stack], g, 48, each);
      taken++;
      expect(w.formations.has(czech!)).toBe(true);
    }
    expect(taken).toBe(12);
    expect(sim.tick, 'more than STAND_DAYS').toBeGreaterThan(7 * 24);
    expect([onFoe, found], "hours' ends on the foe's ground, days' first hours found there").toEqual([0, 0]);
    // Set down twelve times, each time on Poland's land.
    expect(told.length).toBe(12);
    expect(holderOf(w, czech!)).toBe(POL);
  }, 300_000);

  it('three guests on the cell: each set down in that hour, two to a cell at the most', () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    const { sim, czechs, p } = pressed([WAR, hold('CZS')], 3, { guests: 3 });
    const w = sim.world;
    expect(czechs.length).toBe(3);
    const told: [number, number, number, number][] = [];
    TRACK_PROBE.onLeft = (...a) => void told.push(a);
    untilTaken(sim, czechs, p, 48);
    expect(told.map(([formation, n, holder]) => [formation, n, holder])).toEqual(czechs.map((f) => [f, CZS, GER]));
    const by = new Map<number, number>();
    for (const [, , , to] of told) by.set(to, (by.get(to) ?? 0) + 1);
    expect(Math.max(...by.values())).toBeLessThanOrEqual(SET_DOWN_PER_CELL);
    for (const f of czechs) expect(holderOf(w, f)).toBe(POL);
  }, 300_000);

  it("left where they stand in that hour: one of a nation the foe is not held off from, one on the retreat (until the day's first hour), and all in a stage's days", () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    {
      // A Polish formation (Poland's front is fought): its cell taken, it stays and fights, as before.
      const { sim, pole, german, p } = pressed([WAR, hold('CZS')], 3, { guests: 0, host: true, fight: true });
      const w = sim.world;
      const told: number[] = [];
      TRACK_PROBE.onLeft = (formation) => void told.push(formation);
      untilTaken(sim, [pole, german], p);
      let idle = 0;
      unbroken(sim, [pole, german], 30, () => void (idle += w.formations.cols.engaged[pole] === 1 && cellOf(w, pole) === p ? 0 : 1));
      expect([told, idle]).toEqual([[], 0]);
    }
    {
      // A guest on the retreat when the cell falls: not set down in that hour (it walks off by itself); standing
      // there still at the day's first hour, it is, as any formation left on a held foe's ground (R239).
      const { sim, czechs, p } = pressed([WAR, hold('CZS')], 3);
      const w = sim.world;
      const [czech] = czechs;
      const told: number[] = [];
      TRACK_PROBE.onLeft = (formation) => void told.push(sim.tick * 0 + formation);
      const at = untilTaken(sim, [czech!], p, 48, () => void (w.formations.cols.retreat[czech!] = 30));
      expect(told, 'in the hour the cell fell').toEqual([]);
      expect(holderOf(w, czech!)).toBe(GER);
      w.formations.cols.retreat[czech!] = 0;
      sim.step(24 - (at % 24) + 1, quiet);
      expect(told, "at the day's first hour").toEqual([czech]);
      expect(holderOf(w, czech!)).toBe(POL);
    }
    {
      // Both held off, a stage of Germany's on Poland's land: in its days the cell is fought for, and a guest whose
      // cell is taken then stays where it stands (the hold is lifted between the two there, R66d).
      const { sim, czechs, german, p } = pressed([WAR, hold('CZS', 'POL'), STAGE], OPEN + 5, { fight: true, inside: (x, y) => x >= 1100 && x <= 1125 && y >= 262 && y <= 285 });
      const w = sim.world;
      const [czech] = czechs;
      expect(w.holdsPlan(CZS, GER), "the stage's days are open").toBe(false);
      const told: number[] = [];
      TRACK_PROBE.onLeft = (formation) => void told.push(formation);
      const at = untilTaken(sim, [czech!, german], p, 48);
      expect(at).toBeLessThan(14 * 24 + 1);
      expect(told.filter((f) => f === czech)).toEqual([]);
      expect(cellOf(w, czech!)).toBe(p);
      expect(w.cells.controller[p]).toBe(GER);
      expect(POL).toBeGreaterThan(0);
    }
  }, 300_000);
  it("a stage's days elsewhere between the two nations keep no one on the foe's ground outside the stage's area: set down in the hour its cell falls, and at the day's first hour", () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    // A stage of Germany's on Czech land in western Bohemia, far from Poland's border; German divisions beside it, so
    // that its days open (ADR-977).
    const ring: [number, number][] = [[12.3, 50.6], [14.0, 50.6], [14.0, 49.2], [12.3, 49.2]];
    const elsewhere: Event = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['CZS'], ring };
    const there = (w: World, c: number): boolean => w.holdsAt(CZS, GER, c, c);
    const { sim, czechs, p } = pressed([WAR, hold('CZS'), elsewhere], OPEN + 5, { guests: 2, inside: (x, y, w) => there(w, y * w.cells.w + x) });
    const w = sim.world;
    const W = w.cells.w;
    const [u, v] = project(12.6, 50.9);
    const saxony = Math.floor(v * w.cells.h) * W + Math.floor(u * W);
    expect(w.cells.controller[saxony], 'a German cell north of the stage').toBe(GER);
    for (const g of landOf(w, GER).slice(11, 23)) put(w, g, saxony);
    sim.step(1, quiet);
    expect(w.holds(CZS, GER) && !w.holdsPlan(CZS, GER), "the stage's days are open between the two").toBe(true);
    expect(there(w, saxony), "the hold is lifted in the stage's area").toBe(false);
    expect(there(w, p), "and stands at Poland's border").toBe(true);
    const [czech, other] = czechs;
    // The second guest left on German ground beside the border, by no flip (as the timeline leaves one).
    const beyond = ringAt(w, p, 1).find((c) => w.cells.controller[c] === GER && isLand(w.cells.terrain[c]!) && there(w, c));
    expect(beyond).toBeDefined();
    put(w, other!, beyond!);
    const told: [number, number][] = [];
    TRACK_PROBE.onLeft = (formation, _n, _holder, to) => void told.push([formation, to]);
    // The cell taken under the first: set down in that hour.
    const at = untilTaken(sim, [czech!], p, 48);
    expect(told.filter(([formation]) => formation === czech).length, 'the guest whose cell fell').toBe(1);
    expect(holderOf(w, czech!)).toBe(POL);
    // The day's first hour has come by then, or comes: the one left there is set down too.
    if (told.every(([formation]) => formation !== other)) sim.step(24 - (at % 24) + 1, quiet);
    expect(told.filter(([formation]) => formation === other).length, 'the one left on German ground').toBe(1);
    expect([POL, CZS]).toContain(holderOf(w, other!));
    expect(!w.holdsPlan(CZS, GER), "the stage's days still open").toBe(true);
  }, 300_000);
  it('with no land of its side in reach when its cell falls, it is taken off in that hour, its men back to the pool', () => {
    const [GER, POL, CZS] = [id('GER'), id('POL'), id('CZS')];
    const sim = still([WAR, hold('CZS')]);
    const w = sim.world;
    const W = w.cells.w;
    // One cell of Poland's in north-west Germany (made so here: an exclave), a Czech guest on it: no land of
    // Poland's or Czechoslovakia's within FALL_BACK_CELLS of it over land.
    const sides = (c: number): boolean => w.cells.controller[c] === POL || w.cells.controller[c] === CZS;
    const alone = (c: number): boolean => {
      for (let dy = -FALL_BACK_CELLS - 4; dy <= FALL_BACK_CELLS + 4; dy++) for (let dx = -FALL_BACK_CELLS - 4; dx <= FALL_BACK_CELLS + 4; dx++) if (Math.abs(dx) + Math.abs(dy) <= FALL_BACK_CELLS + 4 && sides(c + dy * W + dx)) return false;
      return true;
    };
    const c = w.formations.cols;
    const quietAt = (cell: number): boolean => {
      let near = false;
      w.formations.forEach((f) => void (near ||= !w.offLand(f) && Math.hypot(c.x[f]! - (cell % W) - 0.5, c.y[f]! - Math.floor(cell / W) - 0.5) <= 5));
      return !near;
    };
    let x = -1;
    for (let cy = 250; cy <= 275 && x < 0; cy++) for (let cx = 1050; cx <= 1075 && x < 0; cx++) if (w.cells.controller[cy * W + cx] === GER && isLand(w.cells.terrain[cy * W + cx]!) && alone(cy * W + cx) && quietAt(cy * W + cx)) x = cy * W + cx;
    expect(x, 'a quiet German cell far from both').toBeGreaterThanOrEqual(0);
    w.setController(x, POL, false, FlipCause.other);
    const czech = landOf(w, CZS)[0]!;
    const stack = landOf(w, GER).slice(0, 10);
    const far = ringAt(w, x, 2).find((c) => w.cells.controller[c] === GER && isLand(w.cells.terrain[c]!));
    expect(far, "a German cell two cells from the guest's").toBeDefined();
    put(w, czech, x);
    for (const f of stack) put(w, f, far!);
    expect(w.standsFor(CZS, x, GER), "a guest on Poland's cell").toBe(POL);
    const told: [number, number][] = [];
    TRACK_PROBE.onLeft = (formation, _n, _holder, to) => void told.push([formation, to]);
    const pool = (): number => w.nations.cols.manpower[CZS]!;
    let [men, strength] = [0, 0];
    for (let h = 0; h < 48 && w.cells.controller[x] !== GER; h++) {
      [men, strength] = [pool(), w.formations.cols.strength[czech]!];
      unbroken(sim, [czech, ...stack], 1);
    }
    expect(w.cells.controller[x], 'the cell taken').toBe(GER);
    expect(sim.tick % 24, "not a day's first hour: the set-down of the flip").not.toBe(1);
    // In that hour: taken off, told so, its men in its nation's pool.
    expect(w.formations.has(czech)).toBe(false);
    expect(told).toEqual([[czech, -1]]);
    expect(strength).toBeGreaterThan(1000);
    expect(pool() - men, 'its men, back in the pool in that hour').toBeCloseTo(strength, 3);
  }, 300_000);
});
