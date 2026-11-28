import { project } from '../../src/sim/data/projection';
import type { Admin1Meta } from '../../src/shared/admin1';
import { dayOfIso } from '../../src/shared/calendar';
import { Refusal } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { cellDist, CONTACT_CELLS, elementIndex } from '../../src/sim/systems/elements';
import { waitsForFront } from '../../src/sim/systems/movement';
import { Domain, PlayerOrderKind, type World } from '../../src/sim/world';
import { matchColumns, referenceHolders, referenceOwners } from '../../tools/diag/historyMatch';
import { Breaks, bondsOf, membersOf, silentExits, useTags, worldBreaks } from './diploInvariants';
import { assets1938 } from './earth';
import { neighbourPairs } from './neighbours';
import { deltaE } from '../../src/shared/color';

// ROADMAP R62k (ADR-947): the historical track's checker, on any seed, from its start to its end.
//   skip    no timeline event passed over but by rule: one that no longer applies on that seed (a party dead or not
//           born, a war already joined or over, nothing left to do); on the scenario's own seed none at all;
//   course  no war declared and no peace made while the track runs but in an hour of a timeline event, or with a
//           party's death in that hour (the fighting's own: a capital taken, a nation's last land lost);
//   exit, realm, held  the diplomatic rules of `diploInvariants` (ADR-803) through the track, `held` save the land
//           the timeline occupies at peace (an armistice's line, a zone of occupation): its holder is then the
//           timeline's, as its maps' `occupied`.
//   colours on the scenario's own seed, at the end: every two nations that share a land border on the world's map
//           differ by END_COLOUR_DE (ΔE CIE76) in the colours drawn (`nations.color`; ROADMAP R84d, critic run 69);
//   strays  on another seed than the scenario's: on each of the timeline's maps with `occupied`, land held by another
//           than history's where history had it unchanged from the start under STRAY_BAR (ADR-968; the scenario's own
//           seed is held to it by `historyMatch1938h`).
//   stand   no land formation waits STAND_DAYS with one order at a front the timeline holds (ROADMAP R236, ADR-1163):
//           its next step onto the land of a foe it holds a front with, no stage's days open between the two. Land
//           there is taken by no one: the march goes round by its own side's, or its order ends. From whatever
//           ground it stands on, since ROADMAP R239.
//   left    no land formation stands, or waits on a march, on the ground of a foe the timeline holds its front with
//           at two days' first hours running, in whatever cells (ROADMAP R239, ADR-1166; R243, ADR-1168), outside
//           the area of a stage whose days are open between the two (`World.holdsAt` of its own cell): the track
//           sets it down behind the line at a day's first hour, and in the hour a cell is taken under it, or takes
//           it off. Not one on a march that does not wait (it goes by itself), nor one the timeline keeps where it
//           arrived for its stage. Before R243 the bar was two days in one cell, and a week in any (a guest on an
//           ally's land that the held foe took cell by cell was set down each morning and overrun again the same
//           day: a German and a Romanian on Finland's in August 1944), and a stage's days anywhere passed over
//           every formation of its two nations.
//   guest   in a fight a land formation is held as the nation it stands for where it stands (ROADMAP R243, ADR-1168,
//           `World.standsFor`: on the land of an ally in its war with that foe, that ally). One that stands for
//           another nation than its own is not found at two days' first hours running in contact with a foe's
//           formation and out of the fight, the two not held off as they stand; nor in a fight, every foe's formation
//           in its contact held off from it as they stand.

/** The least ΔE of two land neighbours' colours on the world's map at the track's end (R84d; the critic's bar). */
export const END_COLOUR_DE = 30;

/** The share of land held astray at a map's date (`MatchColumns.strayShare`) a seed is held to (ADR-968). */
export const STRAY_BAR = 0.01;
/** The days a march may wait at a front the timeline holds, its order the same, before it is one that stands (R236). */
export const STAND_DAYS = 7;
/**
 * A place the timeline gives a nation by a date, read at noon on the scenario's own seed: [date, holder, lon, lat]. R84j
 * (critic run 69: Kuwait still Kuwait's on 3 August 1990, overrun in two days): Kuwait City Iraq's on 3 August.
 */
export const HELD_BY: readonly [string, string, number, number][] = [['1990-08-03', 'IRQ', 47.98, 29.37]];

const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
/** The refusals of an event that no longer applies on a seed (`TrackSkipped`'s why). */
export const BY_RULE: ReadonlySet<number> = new Set([Refusal.DeadNation, Refusal.NoNation, Refusal.AtWar, Refusal.NoEffect, Refusal.Alive]);
const COURSE_KINDS: ReadonlySet<number> = new Set([EventKind.WarDeclared, EventKind.PeaceSigned, EventKind.WarEnded]);
const DEATH_KINDS: ReadonlySet<number> = new Set([EventKind.NationEliminated, EventKind.NationAnnexed, EventKind.NationCollapsed]);

export interface TrackRun {
  /** The broken lines, each kind once (its first hour). */
  lines: string[];
  /** Each event passed over: [its number from 1, why]. */
  skipped: [number, number][];
  /** The hour the track ended (or the last stepped). */
  end: number;
  sim: Sim;
  /**
   * The alliances the track hands over, each its leader's tag to its members' tags, sorted: read before the hour that
   * ends it, since the free AI's first day runs in that hour (R71b, ADR-993: on 31 December 1975 it made India a
   * member of NATO). Empty when the run stops before the end.
   */
  handover: Map<string, string[]>;
}

/**
 * The marches that have waited STAND_DAYS today with one order at a front the timeline holds (`stand`, R236): asked
 * once a day, the days of each counted in `days` (by formation: its order's target, the days so far).
 */
function standing(w: World, days: Map<number, { target: number; n: number }>): string[] {
  const c = w.formations.cols;
  const out: string[] = [];
  const waiting = new Set<number>();
  w.formations.forEach((f) => {
    if (!waitsForFront(w, f)) return;
    const nation = c.nation[f]!;
    const path = w.paths.get(f)!;
    const holder = w.cells.controller[path[c.pathStep[f]! + 1]!]!;
    if (!w.holdsPlan(nation, holder)) return;
    waiting.add(f);
    const d = days.get(f);
    const n = d && d.target === c.targetCell[f] ? d.n + 1 : 1;
    days.set(f, { target: c.targetCell[f]!, n });
    if (n === STAND_DAYS) out.push(`stand: a formation of ${tag(nation)} has waited ${STAND_DAYS} days with one order at the front the timeline holds against ${tag(holder)}`);
  });
  for (const f of [...days.keys()]) if (!waiting.has(f)) days.delete(f);
  return out;
}

/**
 * The land formations found on a held foe's ground at this day's first hour (`left`, R239): standing, or waiting on a
 * march, no stage's days open between the two; asked once a day, those seen kept in `seen` (by formation: the holder
 * of its ground). One read may find a formation there: the track's own look comes in the tick after it. Two running
 * may not, in whatever cells: the look did not take it, or it was set down and overrun again (R243).
 */
function leftBehind(w: World, seen: Map<number, number>): string[] {
  const c = w.formations.cols;
  const W = w.cells.w;
  const out: string[] = [];
  const now = new Map<number, number>();
  w.formations.forEach((f) => {
    if (w.rules?.templates[c.template[f]!]?.domain !== Domain.land || w.offLand(f)) return;
    const nation = c.nation[f]!;
    const cell = Math.floor(c.y[f]!) * W + ((Math.floor(c.x[f]!) % W) + W) % W;
    const holder = w.cells.controller[cell]!;
    // Held off where it stands (`holdsAt` of its own cell): a stage's days lift the hold in the stage's area alone.
    if (holder === 0 || holder === nation || !w.wars.atWar(nation, holder) || !w.holdsAt(nation, holder, cell, cell)) return;
    if (c.moving[f] === 1 && !waitsForFront(w, f)) return;
    if (w.playerOrders.get(f)?.kind === PlayerOrderKind.kept) return;
    now.set(f, holder);
    if (seen.get(f) === holder) out.push(`left: a formation of ${tag(nation)} is found a second day on the ground of ${tag(holder)}, whose front the timeline holds`);
  });
  seen.clear();
  for (const [f, holder] of now) seen.set(f, holder);
  return out;
}

/**
 * The land formations that are not held as the nation they stand for (`guest`, R243), at this day's first hour: each
 * that stands for another nation than its own against a foe's formation in its contact (`World.standsFor`), and is
 * out of the fight though one such pair is not held off as the two stand (`World.holdsHere`), or in a fight though
 * every one is. Asked once a day, those found kept in `seen` (by formation: which of the two). One read may find a
 * formation so (the hour's ground was taken, or its foe fell, after the hour's fight); two running may not.
 */
function guests(w: World, seen: Map<number, string>): string[] {
  const c = w.formations.cols;
  const W = w.cells.w;
  const idx = elementIndex(w);
  const contact = w.atSize(CONTACT_CELLS);
  const side = Math.max(1, Math.ceil(contact));
  const bw = Math.ceil(W / side);
  const fighting = w.wars.nations();
  const cellOf = (f: number): number => Math.floor(c.y[f]!) * W + ((Math.floor(c.x[f]!) % W) + W) % W;
  // As `findBattles` takes them: land formations with men, of nations at war, not on the retreat.
  const fighters: number[] = [];
  const buckets = new Map<number, number[]>();
  const away = new Set<number>();
  w.formations.forEach((f) => {
    if (w.rules?.templates[c.template[f]!]?.domain !== Domain.land || w.offLand(f) || c.retreat[f]! > 0 || !idx.has(f) || !fighting.has(c.nation[f]!)) return;
    fighters.push(f);
    const k = Math.floor(c.y[f]! / side) * bw + Math.floor(cellOf(f) % W / side);
    let b = buckets.get(k);
    if (!b) buckets.set(k, (b = []));
    b.push(f);
    if (w.cells.controller[cellOf(f)] !== c.nation[f]) away.add(f);
  });
  // By formation off its own land: whether it stands for another nation against a foe in contact, and whether a pair
  // of its contact is not held off as the two stand.
  const guest = new Map<number, number>();
  const open = new Set<number>();
  for (const a of fighters) {
    const ma = c.nation[a]!;
    const bx = Math.floor(cellOf(a) % W / side);
    const by = Math.floor(c.y[a]! / side);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (const b of buckets.get((by + dy) * bw + ((bx + dx + bw) % bw)) ?? []) {
          if (b <= a || (!away.has(a) && !away.has(b))) continue;
          const mb = c.nation[b]!;
          if (!w.wars.atWar(ma, mb) || cellDist(w, c.x[a]!, c.y[a]!, c.x[b]!, c.y[b]!) > contact) continue;
          const [ca, cb] = [cellOf(a), cellOf(b)];
          if (!w.holdsHere(ma, mb, ca, cb)) {
            open.add(a);
            open.add(b);
          }
          const sa = w.standsFor(ma, ca, mb);
          const sb = w.standsFor(mb, cb, ma);
          if (sa !== ma && !guest.has(a)) guest.set(a, sa * 65536 + mb);
          if (sb !== mb && !guest.has(b)) guest.set(b, sb * 65536 + ma);
        }
      }
    }
  }
  const out: string[] = [];
  const now = new Map<number, string>();
  for (const [f, key] of guest) {
    const fights = c.engaged[f] === 1;
    const kind = open.has(f) && !fights ? 'idle' : !open.has(f) && fights ? 'fights' : '';
    if (kind === '') continue;
    now.set(f, kind);
    if (seen.get(f) !== kind) continue;
    const [host, foe] = [Math.floor(key / 65536), key % 65536];
    out.push(
      kind === 'idle'
        ? `guest: a formation of ${tag(c.nation[f]!)} of the front of ${tag(host)} stands a second day in contact with ${tag(foe)}'s, out of the fight, the two not held off there`
        : `guest: a formation of ${tag(c.nation[f]!)} of the front of ${tag(host)} is a second day in a fight, every foe in its contact held off from it there (${tag(foe)}'s)`,
    );
  }
  seen.clear();
  for (const [f, kind] of now) seen.set(f, kind);
  return out;
}

/**
 * Runs 1938h on `seed` to the track's end (or `hours`), checked hour by hour; held and realm each day. `meddle` acts on
 * the world before each hour, not by a command (a test of the checker itself: a command would end the track).
 */
/** The nations holding warheads (R69f, ADR-989), by tag, sorted. */
export function arsenals(w: World): string[] {
  return [...w.warheads.entries()].filter(([, s]) => s.stock > 0).map(([n]) => TAGS_1938H[n - 1]!).sort();
}

export function historyTrack(seed: number = SEED_1938H, hours = Infinity, meddle?: (w: World) => void): TrackRun {
  useTags(tag);
  const assets = assets1938(SIZE_1938.w);
  const sim = new Sim({ scenario: '1938h', seed, assets });
  const t = sim.world.track!;
  const own = seed === SEED_1938H;
  // The strays (ADR-968): each map with `occupied`, at noon of its date.
  const meta = JSON.parse(new TextDecoder().decode(assets.admin1Meta)) as Admin1Meta[];
  const maps = TIMELINE_1938H.maps ?? [];
  const mapAt = new Map(maps.flatMap((m, k) => (m.occupied && !own ? [[(dayOfIso(m.date) - dayOfIso('1938-01-01')) * 24 + 12, k] as const] : [])));
  const startOwner = sim.world.cells.owner.slice();
  const startHeld = sim.world.cells.controller.slice();
  const due = new Set(t.ticks);
  const breaks = new Breaks();
  const skipped: [number, number][] = [];
  let before = membersOf(sim.world);
  let bonds = bondsOf(sim.world);
  const label = `seed ${seed}`;
  breaks.add(`${label} day 0`, worldBreaks(sim.world).filter((l) => !l.startsWith('held')));
  let handover = new Map<string, string[]>();
  const waited = new Map<number, { target: number; n: number }>();
  const behind = new Map<number, number>();
  const hosted = new Map<number, string>();
  const heldAt = new Map(own ? HELD_BY.map((h) => [(dayOfIso(h[0]) - dayOfIso('1938-01-01')) * 24 + 12, h] as const) : []);
  while (!t.ended && sim.tick < hours) {
    meddle?.(sim.world);
    if (sim.tick >= t.endTick) handover = new Map(sim.world.alliances.list.map((a) => [tag(a.leader), a.members.map(tag).sort()]));
    sim.step(1, (w: World) => {
      const ev = w.out.events;
      const where = `${label} day ${Math.floor((w.tick - 1) / 24)}`;
      const dead = new Set<number>();
      for (let i = 0; i < ev.length; i += 6) if (DEATH_KINDS.has(ev[i + 1]!)) dead.add(ev[i + 2]!);
      for (let i = 0; i < ev.length; i += 6) {
        const [tick, kind, a, b] = [ev[i]!, ev[i + 1]!, ev[i + 2]!, ev[i + 3]!];
        if (kind === EventKind.TrackSkipped) {
          const why = ev[i + 5]!;
          skipped.push([b, why]);
          const e = t.events[b - 1]!;
          if (own || !BY_RULE.has(why)) breaks.add(where, [`skip: event ${b} (${e.date} ${e.kind}${e.note ? `, ${e.note}` : ''}) passed over, why ${why}`]);
        }
        if (COURSE_KINDS.has(kind) && !t.ended && !due.has(tick) && !dead.has(a) && !dead.has(b))
          breaks.add(where, [`course: ${kind === EventKind.WarDeclared ? 'war' : 'peace'} ${tag(a)} and ${tag(b)} (kind ${kind}) in an hour of no timeline event`]);
      }
      breaks.add(where, silentExits(w, before, bonds.overlord, ev));
      if (w.tick % 24 === 0) breaks.add(where, worldBreaks(w).filter((l) => !l.startsWith('held') || !heldByTimeline(w, l)));
      if (w.tick % 24 === 0) breaks.add(where, [...standing(w, waited), ...leftBehind(w, behind), ...guests(w, hosted)]);
      const hb = heldAt.get(w.tick);
      if (hb) {
        const [date, by, lon, lat] = hb;
        const [u, v] = project(lon, lat);
        const c = Math.floor(v * w.cells.h) * w.cells.w + Math.floor(u * w.cells.w);
        const [o, h] = [w.cells.owner[c]!, w.cells.controller[c]!];
        if (h !== TAGS_1938H.indexOf(by) + 1) breaks.add(`${label} ${date}`, [`held by: ${lon}° ${lat}° is ${tag(o)}'s, held by ${tag(h)}, not ${by}`]);
      }
      const k = mapAt.get(w.tick);
      if (k !== undefined) {
        const { province, terrain, w: cw, h: ch } = w.cells;
        const ref = referenceOwners(startOwner, province, terrain, meta, maps, k, TAGS_1938H, cw, ch);
        const held = referenceHolders(ref, province, terrain, meta, maps[k]!, TAGS_1938H, cw, ch);
        const c = matchColumns(w.cells.controller, held, startHeld, terrain);
        if (c.strayShare >= STRAY_BAR) breaks.add(`${label} ${maps[k]!.date}`, [`strays: ${(100 * c.strayShare).toFixed(2)} % of land held astray (bar ${100 * STRAY_BAR} %)`]);
      }
      ev.length = 0;
      w.out.fires.length = 0;
      before = membersOf(w);
      bonds = bondsOf(w);
    });
  }
  if (own && t.ended && sim.tick >= t.endTick) {
    const nc = sim.world.nations.cols;
    const { owner, w: cw, h: ch } = sim.world.cells;
    for (const [a, b] of neighbourPairs(owner, cw, ch)) {
      const d = deltaE(nc.color[a]!, nc.color[b]!);
      if (d < END_COLOUR_DE) breaks.add(`${label} end`, [`colours: ${tag(a)} and ${tag(b)} share a border, ΔE ${d.toFixed(1)}`]);
    }
  }
  return { lines: breaks.lines, skipped, end: sim.tick, sim, handover };
}

/**
 * Whether a `held` line ("held: K on O, n cells at peace") is of land the timeline occupies: an `occupy` of O's by K,
 * or by a nation K fights beside (R82b, ADR-1040: a stage's land taken in its window goes to its taker's side, so the
 * Americans hold Normandy's Vichy cells for the British stage; ADR-1049).
 */
function heldByTimeline(w: World, line: string): boolean {
  const m = /^held: (\S+) on (\S+),/.exec(line);
  if (!m) return false;
  const k = TAGS_1938H.indexOf(m[1]!) + 1;
  return w.track!.events.some((e) => e.kind === 'occupy' && e.of.includes(m[2]!) && (e.by === m[1] || w.wars.sameSide(k, TAGS_1938H.indexOf(e.by) + 1)));
}
