import { isMonthStart } from '../../src/shared/calendar';
import { Refusal } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { blocsOf, homeByLand, neighbourMap, PILE_REALMS, strengths } from '../../src/sim/ai/strategic';
import { armyLands, borderOnLands } from '../../src/sim/ai/massing';
import { Sim } from '../../src/sim/sim';
import { FREE_ABOVE, PROTEST_FROM, puppetSystem, REVOLT_LOYALTY } from '../../src/sim/systems/puppets';
import { declareWar, forceWar, whyNotWar } from '../../src/sim/systems/war';
import { seaLift, sidesTouch } from '../../src/sim/ai/seaLift';
import { transportGroupsAtPort } from '../../src/sim/systems/amphibious';
import type { World } from '../../src/sim/world';
import { assets1938 } from './earth';
import { realmWars } from './realmWars';

// ADR-803: the rules of war and peace that critic runs 24–26 each found broken by the fix before,
// checked together on every day of a run and on the wars a player or God could declare on it.
//   held    no land held by a nation at peace with its owner (R24-B1);
//   exit    no nation out of a war, and no war over, without a row that says so: a peace, `WarEnded`,
//           `WarLeft`, or the nation's death (R25-B1);
//   realm   no war inside one realm or alliance, and no nation at war with one it fights beside
//           (PLAN 3.8, 7.188);
//   bond    a puppet's or ally's Force war on its partner, and a puppet's revolt, never refused
//           because the two fight beside each other (ADR-780, R26-B1);
//   rise    a puppet rises (`PuppetRevolt`) only at a month's start, with a voice (autonomy ≥
//           PROTEST_FROM) and loyalty under REVOLT_LOYALTY the hour before, and is then at war with
//           its old overlord; and every puppet so placed at a month's start rises, is freed or
//           ends in that hour (ROADMAP R2, ADR-807).
//   pile    no war the sim declares in its own hours (the AI's; God's and a player's are acts) sets over PILE_REALMS
//           realms (nations that are no puppet) against each of the declarer's (ROADMAP R82f, ADR-1042).
//   lift    no war the sim declares in its own hours on a nation that is no land neighbour of the declarer's home (by the
//           provinces and its men, `neighbourMap`, `homeByLand`), between sides that touch nowhere by land where a man of
//           the declaring side stands (`armyLands`, ROADMAP R217), unless the declarer had,
//           at the end of the hour before, as many free men that may march to its transports as its largest group at a
//           port holds (`seaLift`; ROADMAP R139). Not a revolt's war (a `PuppetRevolt` of the two in the hour, or the
//           holder's on a nation a revolt made or revived, `RevoltSpawned`, `NationRevived`): no choice of target
//           (ROADMAP R145, ADR-1125).
//   mass    no massing begins with no man of its nation on its border's lands (`armyLands`, `massPoints`; ROADMAP R217:
//           89404's nation 2 began nine in ten years on a land none of its men stood on, none ever ready).
//   bloc    where the blocs are (`blocsOf`), at most two; once an `allianceEnd` has been applied, at most one, and none
//           led by a leader whose bloc ended; no `BlocAid` in an hour with fewer than two blocs (ROADMAP R80b, ADR-1045).

const tag1938 = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
/** The names in the lines: the 1938 tags, or the ids of a random world's nations (set per case). */
let tag: (n: number) => string = tag1938;
/** The names in the lines of a world of other tags (the historical track's, ROADMAP R62k). */
export function useTags(f: (n: number) => string): void {
  tag = f;
}
const assets = assets1938(SIZE_1938.w);

/** Whether a and b fight on one side in a war (as `beside` in the war system, kept here so the checker runs on builds before it). */
const beside = (w: World, a: number, b: number): boolean => w.wars.list.some((war) => war.sides.some((side) => side.includes(a) && side.includes(b)));

/** The members of each war, by its id. */
export function membersOf(w: World): Map<number, number[]> {
  return new Map(w.wars.list.map((war) => [war.id, [...war.sides[0], ...war.sides[1]]]));
}

/** What a day's rows and the world may show of the wars before: the lines of each `exit` broken. */
export function silentExits(w: World, before: Map<number, number[]>, overlordBefore: Int32Array | number[], events: number[]): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  const dead = (n: number): boolean => !w.nations.has(n) || nc.living[n] !== 1;
  const named = new Set<string>();
  for (let i = 0; i < events.length; i += 6) named.add(`${events[i + 1]}:${events[i + 2]}`).add(`${events[i + 1]}:b${events[i + 3]}`);
  const has = (kind: number, n: number, asB = false): boolean => named.has(`${kind}:${asB ? 'b' : ''}${n}`);
  const now = membersOf(w);
  for (const [id, was] of before) {
    const is = now.get(id);
    if (is === undefined) {
      const told = was.some((m) => dead(m) || has(EventKind.PeaceSigned, m) || has(EventKind.PeaceSigned, m, true) || has(EventKind.WarEnded, m) || has(EventKind.WarEnded, m, true));
      if (!told) out.push(`exit: war ${id} (${was.map(tag).join(' ')}) over with no row`);
      continue;
    }
    for (const m of was) {
      if (is.includes(m) || dead(m)) continue;
      const heads = [m, overlordBefore[m] ?? 0, nc.overlord[m] ?? 0].filter((n) => n !== 0);
      if (!heads.some((h) => has(EventKind.WarLeft, h) || has(EventKind.WarEnded, h, true))) out.push(`exit: ${tag(m)} out of war ${id} with no row`);
    }
  }
  return out;
}

/** A puppet's bond, voice and loyalty, as they were the hour before. */
export interface Bonds {
  overlord: number[];
  autonomy: number[];
  loyalty: number[];
}
export const bondsOf = (w: World): Bonds => ({ overlord: Array.from(w.nations.cols.overlord), autonomy: Array.from(w.nations.cols.autonomy), loyalty: Array.from(w.nations.cols.loyalty) });

/** The lines of `rise` an hour broke: `was` the bonds before it, `events` its rows (the tick has moved on). */
export function riseBreaks(w: World, was: Bonds, events: number[]): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  const alive = (n: number): boolean => w.nations.has(n) && nc.living[n] === 1;
  const monthStart = isMonthStart(w.startDay, w.tick - 1);
  const rose = new Set<number>();
  for (let i = 0; i < events.length; i += 6) {
    if (events[i + 1] !== EventKind.PuppetRevolt) continue;
    const p = events[i + 2]!;
    const o = events[i + 3]!;
    rose.add(p);
    if (!monthStart) out.push(`rise: ${tag(p)} rose on ${tag(o)} outside a month's start`);
    if (was.overlord[p] !== o) out.push(`rise: ${tag(p)} rose on ${tag(o)}, not its overlord`);
    if ((was.autonomy[p] ?? 0) < PROTEST_FROM) out.push(`rise: ${tag(p)} rose on ${tag(o)} with no voice (autonomy ${was.autonomy[p]})`);
    if ((was.loyalty[p] ?? 100) >= REVOLT_LOYALTY) out.push(`rise: ${tag(p)} rose on ${tag(o)} at loyalty ${was.loyalty[p]?.toFixed(1)}`);
    if (alive(p) && alive(o) && !w.wars.atWar(p, o)) out.push(`rise: ${tag(p)} rose on ${tag(o)} and is not at war with it`);
  }
  if (!monthStart) return out;
  for (let p = 1; p < was.overlord.length; p++) {
    const o = was.overlord[p]!;
    if (o === 0 || rose.has(p) || (was.autonomy[p] ?? 0) < PROTEST_FROM || (was.loyalty[p] ?? 100) >= REVOLT_LOYALTY) continue;
    // Freed (above autonomy 90, its overlord gone), integrated, or dead in the hour: no rising owed.
    if (!alive(p) || !alive(o) || nc.overlord[p] !== o) continue;
    out.push(`rise: ${tag(p)} under ${tag(o)} at loyalty ${was.loyalty[p]!.toFixed(1)} with a voice and did not rise`);
  }
  return out;
}

/** The lines of `held` and `realm` the world breaks now. */
export function worldBreaks(w: World): string[] {
  const out: string[] = [];
  const { owner, controller } = w.cells;
  const pairs = new Map<string, number>();
  for (let c = 0; c < owner.length; c++) {
    const o = owner[c]!;
    const k = controller[c]!;
    if (o === 0 || k === 0 || k === o || w.wars.atWar(o, k)) continue;
    const key = `${tag(k)} on ${tag(o)}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  for (const [k, v] of pairs) out.push(`held: ${k}, ${v} cells at peace`);
  for (const l of realmWars(w, tag)) out.push(`realm: ${l}`);
  for (const war of w.wars.list)
    for (const side of war.sides)
      for (const a of side) for (const b of side) if (a < b && w.wars.atWar(a, b)) out.push(`realm: ${tag(a)} and ${tag(b)} beside each other in war ${war.id} and at war`);
  return out;
}

/** The blocs the last `blocBreaks` saw: of its world, as its hour ended (R85a). */
let lastBlocs: { w: World; tick: number; size: number } | null = null;

/**
 * The lines of `bloc` the world and the hour's `events` break (R80b): the blocs as `blocsOf` gives them now. Aid is paid
 * at the month's start, before the hour's alliance pass (R85a; critic run 70, R70-B2: 1991 free, 51507, Russia's
 * alliance dissolved in the hour it paid): judged by the blocs at the hour's start, those the call of the hour before
 * saw; with no such call, by the blocs now.
 */
export function blocBreaks(w: World, events: number[]): string[] {
  const out: string[] = [];
  const blocs = blocsOf(w, strengths(w));
  const atStart = lastBlocs && lastBlocs.w === w && lastBlocs.tick === w.tick - 1 ? lastBlocs.size : blocs.size;
  lastBlocs = { w, tick: w.tick, size: blocs.size };
  const ended = w.track?.blocsEnded() ?? new Set<number>();
  if (blocs.size > (ended.size > 0 ? 1 : 2)) out.push(`bloc: ${blocs.size} blocs${ended.size > 0 ? ' after a bloc ended' : ''}`);
  for (const id of blocs) {
    const a = w.alliances.list.find((x) => x.id === id);
    if (a && ended.has(a.leader)) out.push(`bloc: alliance ${id} led by ${tag(a.leader)}, whose bloc ended, is a bloc`);
  }
  if (atStart < 2) for (let i = 0; i < events.length; i += 6) if (events[i + 1] === EventKind.BlocAid) out.push(`bloc: aid by ${tag(events[i + 2]!)} with ${atStart} bloc(s)`);
  return out;
}

/** At most this many broken lines are kept; the rest are counted. */
const MAX_LINES = 20;

/** Collects broken lines, each line once per case (the first day it breaks). */
export class Breaks {
  private readonly kept: string[] = [];
  private more = 0;
  private readonly seen = new Set<string>();
  add(where: string, found: readonly string[]): void {
    for (const l of found) {
      const kind = l.replace(/\d+/g, '#');
      if (this.seen.has(kind)) continue;
      this.seen.add(kind);
      if (this.kept.length < MAX_LINES) this.kept.push(`${where}: ${l}`);
      else this.more++;
    }
  }
  get lines(): string[] {
    return this.more > 0 ? [...this.kept, `… and ${this.more} more`] : [...this.kept];
  }
}

/** The wars declared in the hour's `events` (`WarDeclared`, attacker and defender) that set over PILE_REALMS realms against the declarer's (R82f). */
export function pileBreaks(w: World, events: number[]): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  const realms = (side: readonly number[]): number => side.filter((x) => nc.overlord[x] === 0).length;
  for (let i = 0; i < events.length; i += 6) {
    if (events[i + 1] !== EventKind.WarDeclared) continue;
    const [a, d] = [events[i + 2]!, events[i + 3]!];
    const war = w.wars.list.find((x) => x.sides[0][0] === a && x.sides[1][0] === d);
    if (!war) continue;
    const [ra, rd] = [realms(war.sides[0]), realms(war.sides[1])];
    if (rd > PILE_REALMS * Math.max(1, ra)) out.push(`pile: ${tag(a)} declared on ${tag(d)}, ${ra} realms against ${rd}`);
  }
  return out;
}

/**
 * The wars declared in the hour's `events` (`WarDeclared`) on a nation that is no land neighbour of the declarer's home
 * (the strategic AI's test: `neighbourMap`, `homeByLand`), between sides that touch nowhere by land where a man of the
 * declaring side stands (`armyLands`, R217), whose declarer had,
 * by `before` (its `seaLift` at the end of the hour before), fewer free men that may march to its transports than its
 * largest group at a port holds (R139). A declarer not in `before` had no transport group at a port then.
 */
export function liftBreaks(w: World, events: number[], before: ReadonlyMap<number, { men: number; room: number }>): string[] {
  const out: string[] = [];
  const revolts = new Set<number>();
  for (let i = 0; i < events.length; i += 6) {
    const k = events[i + 1];
    if (k === EventKind.PuppetRevolt) revolts.add(events[i + 2]! * 65536 + events[i + 3]!);
    // The revolt's nation, then its holder: the holder's war of independence on it.
    else if (k === EventKind.RevoltSpawned || k === EventKind.NationRevived) revolts.add(events[i + 3]! * 65536 + events[i + 2]!);
  }
  for (let i = 0; i < events.length; i += 6) {
    if (events[i + 1] !== EventKind.WarDeclared) continue;
    const [a, d] = [events[i + 2]!, events[i + 3]!];
    if (revolts.has(a * 65536 + d)) continue;
    const war = w.wars.list.find((x) => x.sides[0][0] === a && x.sides[1][0] === d);
    if (!war || sidesTouch(w, war.sides[0], war.sides[1], armyLands(w, war.sides[0]))) continue;
    const home = homeByLand(w, a);
    if (neighbourMap(w).get(a)?.has(d) && (home === null || home.has(d))) continue;
    const l = before.get(a) ?? { men: 0, room: 0 };
    if (l.room === 0 || l.men < l.room) out.push(`lift: ${tag(a)} declared on ${tag(d)} over the sea, ${l.men} men to lift for a room of ${l.room}`);
  }
  return out;
}

/** The `seaLift` of each living nation with a transport group at a port. */
function liftsOf(w: World): Map<number, { men: number; room: number }> {
  const out = new Map<number, { men: number; room: number }>();
  w.nations.forEach((n) => {
    if (w.nations.cols.living[n] === 1 && transportGroupsAtPort(w, n).length > 0) out.set(n, seaLift(w, n));
  });
  return out;
}

/**
 * A massing called off (`MassingCalledOff`, ROADMAP R129) in the hour's `events` whose nation is at war with its target
 * at the hour's end, or one of the two dead (R134; critic run 75, R75-N3: France's call-off on Germany and its war with
 * Germany by an alliance's call under one date; France's on Switzerland a row above Switzerland's annexation).
 */
export function massOffBreaks(w: World, events: number[]): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  for (let i = 0; i < events.length; i += 6) {
    if (events[i + 1] !== EventKind.MassingCalledOff) continue;
    const [n, t] = [events[i + 2]!, events[i + 3]!];
    if (w.wars.atWar(n, t)) out.push(`massing: ${tag(n)}'s on ${tag(t)} called off, and at war with it at the hour's end`);
    if (nc.living[n] !== 1 || nc.living[t] !== 1) out.push(`massing: ${tag(n)}'s on ${tag(t)} called off, one of the two dead`);
  }
  return out;
}

/**
 * The massings begun since `was` (each nation's `since` the hour before) whose nation has no man on its border's lands
 * (ROADMAP R217). Updates `was` to the world's.
 */
export function massBreaks(w: World, was: Map<number, number>): string[] {
  const out: string[] = [];
  for (const [n, m] of w.massing) {
    if (was.get(n) === m.since) continue;
    if (!borderOnLands(w, n, m.target, armyLands(w, [n]))) out.push(`mass: ${tag(n)} began a massing on ${tag(m.target)} with no man on its border's lands`);
  }
  was.clear();
  for (const [n, m] of w.massing) was.set(n, m.since);
  return out;
}

/** Steps `s` by `ticks` hours, checking `exit`, `rise`, `pile`, `lift` and `mass` every hour and `held` and `realm` each day. */
function stepChecked(s: Sim, ticks: number, breaks: Breaks, label: string): void {
  let before = membersOf(s.world);
  let bonds = bondsOf(s.world);
  // The lifts before a day's first hour, when the strategic AI declares; none known before the run's first hour.
  let lifts = new Map<number, { men: number; room: number }>();
  if (s.world.tick % 24 === 0) lifts = liftsOf(s.world);
  const massings = new Map<number, number>([...s.world.massing].map(([n, m]) => [n, m.since]));
  s.step(ticks, (w) => {
    const where = `${label} day ${Math.floor(w.tick / 24)}`;
    breaks.add(where, silentExits(w, before, bonds.overlord, w.out.events));
    breaks.add(where, riseBreaks(w, bonds, w.out.events));
    breaks.add(where, pileBreaks(w, w.out.events));
    breaks.add(where, massOffBreaks(w, w.out.events));
    if (w.massing.size > 0 || massings.size > 0) breaks.add(where, massBreaks(w, massings));
    if (w.tick % 24 === 1) breaks.add(where, liftBreaks(w, w.out.events, lifts));
    if (w.tick % 24 === 0) {
      breaks.add(where, worldBreaks(w));
      lifts = liftsOf(w);
    }
    w.out.events.length = 0;
    w.out.fires.length = 0;
    before = membersOf(w);
    bonds = bondsOf(w);
  });
}

/** Runs `act` on `s`'s world and checks `exit` and `realm` on what it did. */
function actChecked(s: Sim, act: (w: World) => void, breaks: Breaks, where: string): void {
  const w = s.world;
  w.out.events.length = 0;
  const before = membersOf(w);
  const overlords = Array.from(w.nations.cols.overlord);
  act(w);
  breaks.add(where, silentExits(w, before, overlords, w.out.events));
  breaks.add(where, worldBreaks(w).filter((l) => l.startsWith('realm')));
  w.out.events.length = 0;
}

/** A small seeded generator (mulberry32). */
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

/** Runs the puppet pass as at the first hour of the month (it acts only then). */
function puppetPassNow(w: World): void {
  const tick = w.tick;
  const day = Math.floor(tick / 24);
  let back = 0;
  while (back <= 31 && !isMonthStart(w.startDay, (day - back) * 24)) back++;
  (w as { tick: number }).tick = (day - back) * 24;
  puppetSystem(w);
  (w as { tick: number }).tick = tick;
}

export interface DiploCase {
  seed: number;
  diplomacy: 'scenario' | 'random';
  /** The 1938 world (the default) or the random world of `nations` nations (ADR-108). */
  world?: '1938' | 'random';
  nations?: number;
  /** The heroes new-game option (PLAN 7.184). */
  heroes?: boolean;
  days: number;
  /** The days on which the wars a player or God could declare are tried, each on a copy. */
  probeDays: number[];
  /** At most this many pairs of each kind are tried on a probe day. */
  perKind: number;
}

/**
 * The broken lines of one run: the world stepped `days` days, checked as it goes; on each probe
 * day, on copies of that day's world, pairs who fight beside each other, bonded pairs and random
 * pairs go to war by `declareWar` and by `forceWar`, each copy then stepped a day, checked; and
 * puppets beside their overlords revolt.
 */
export function diploBreaks(c: DiploCase): string[] {
  const breaks = new Breaks();
  const scenario = c.world ?? '1938';
  tag = scenario === '1938' ? tag1938 : (n) => `#${n}`;
  const label = `${c.seed} ${scenario === '1938' ? '' : `random world ${c.nations ?? 60}, `}${c.diplomacy}${c.heroes ? ', heroes' : ''}`;
  const init = { scenario, seed: c.seed, assets, options: { diplomacy: c.diplomacy, ...(scenario === 'random' ? { nations: c.nations ?? 60 } : {}), ...(c.heroes ? { heroes: 'on' as const } : {}) } };
  const s = new Sim(init);
  breaks.add(`${label} day 0`, worldBreaks(s.world));
  // The copies are loaded from the run's saves: built as the run was, for the same tables.
  const copy = new Sim(init);
  let day = 0;
  for (const probe of [...c.probeDays, c.days]) {
    stepChecked(s, 24 * (probe - day), breaks, label);
    day = probe;
    if (probe === c.days && !c.probeDays.includes(probe)) break;
    const bytes = s.save();
    const w = s.world;
    const nc = w.nations.cols;
    const living: number[] = [];
    w.nations.forEach((n) => {
      if (nc.living[n] === 1) living.push(n);
    });
    const next = rng(c.seed * 1000 + probe);
    const pick = <T>(xs: T[]): T[] => {
      const a = [...xs];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
      }
      return a.slice(0, c.perKind);
    };
    const besidePairs: [number, number][] = [];
    for (const war of w.wars.list) for (const side of war.sides) for (const a of side) for (const b of side) if (a !== b && nc.living[a] === 1 && nc.living[b] === 1) besidePairs.push([a, b]);
    const bonded: [number, number][] = [];
    for (const [a, b] of besidePairs) if (nc.overlord[a] === b || (nc.overlord[a] === 0 && nc.overlord[b] === 0 && w.alliances.allied(a, b))) bonded.push([a, b]);
    const random: [number, number][] = [];
    for (let i = 0; i < c.perKind; i++) random.push([living[Math.floor(next() * living.length)]!, living[Math.floor(next() * living.length)]!]);
    const tries: [string, number, number][] = [
      ...pick(besidePairs).map(([a, b]): [string, number, number] => ['beside', a, b]),
      ...pick(bonded).map(([a, b]): [string, number, number] => ['bonded', a, b]),
      ...random.map(([a, b]): [string, number, number] => ['random', a, b]),
    ];
    for (const [kind, a, b] of tries) {
      for (const how of ['declareWar', 'forceWar'] as const) {
        const where = `${label} day ${probe}, ${kind} ${tag(a)} ${how} on ${tag(b)}`;
        copy.load(bytes);
        let why = Refusal.None as Refusal;
        actChecked(
          copy,
          (cw) => {
            if (how === 'declareWar') declareWar(cw, a, b);
            else why = forceWar(cw, a, b);
          },
          breaks,
          where,
        );
        if (how === 'forceWar' && kind === 'bonded' && why === Refusal.Beside) breaks.add(where, ['bond: refused for Beside']);
        if (how === 'forceWar' && kind === 'bonded' && why === Refusal.None && !copy.world.wars.atWar(a, b)) breaks.add(where, ['bond: declared but not at war']);
        stepChecked(copy, 24, breaks, where);
      }
    }
    // A puppet above FREE_ABOVE is released in peace, not risen (puppetSystem's first branch): no rebel to judge.
    for (const [p, o] of pick(bonded.filter(([a, b]) => nc.overlord[a] === b && nc.autonomy[a]! >= PROTEST_FROM && nc.autonomy[a]! <= FREE_ABOVE))) {
      const where = `${label} day ${probe}, ${tag(p)} revolts on ${tag(o)}`;
      copy.load(bytes);
      const cc = copy.world.nations.cols;
      for (let n = 1; n < cc.loyalty.length; n++) if (n !== p && cc.overlord[n] !== 0) cc.loyalty[n] = 100;
      cc.loyalty[p] = REVOLT_LOYALTY - 20;
      actChecked(copy, puppetPassNow, breaks, where);
      if (cc.overlord[p] === 0 && !copy.world.wars.atWar(p, o) && beside(copy.world, p, o) && whyNotWar(copy.world, p, o) === Refusal.Beside) breaks.add(where, ['bond: the rebel freed and refused for Beside']);
      stepChecked(copy, 24, breaks, where);
    }
  }
  return breaks.lines;
}
