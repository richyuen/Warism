/**
 * The historical track's runner (ROADMAP R62b, ADR-919, SPEC §7.7): the timeline's events, each applied on its hour
 * right after the hour's commands, directly and not through the command log (the log stays the player's input; a
 * replay of it would apply them twice). An event that no longer applies is passed over with a History row. What the
 * track has done (its next event, whether it has ended, the seed for after it) is state, a section of its own; the
 * timeline is not: it is the scenario's data, and its hash in the save tells a save of another timeline.
 *
 * The kinds that a command stands for go through `applyCommand` (annex, puppet, release, alliances); a war of given
 * sides, a nation joining one, a white peace and a guarantee have no command that does just that (the commands call
 * in allies, settle on the score), so the runner does them with the war's and the alliances' own parts.
 */
import { staticCe } from './systems/efficiency';
import { incomeRankOf } from './systems/research';
import { grantTechs, knowsTechs, techMask } from './tech';
import { dayOfIso } from '../shared/calendar';
import { Refusal } from '../shared/commands';
import { EventKind, JoinedBy, TrackEnd } from '../shared/events';
import type { Section } from './core/sections';
import { hashString } from './core/hash';
import type { TimelineEvent, TimelineFile } from './data/schemas';
import { Terrain } from '../shared/terrain';
import { RngStreams } from './core/rng';
import { forEachCellInRing } from './data/ownership';
import { neighbours4 } from './nav/grid';
import { kmPerCell, project } from './data/projection';
import { nuclearMask, START_GOLD } from './systems/revolts';
import { relocateCapital } from './systems/capitals';
import { spawnCity } from './scenarioEdit';
import { applyTraits } from './traits';
import { traitMask } from '../shared/traits';
import { detonate } from './systems/nuclear';
import { leaveWarsAgainst, makePeace, withPuppets } from './systems/war';
import { applyCommand } from './tick';
import { ATTACKERS, DEFENDERS } from './wars';
import { Domain, FlipCause, navOf, PlayerOrderKind, type World } from './world';

/**
 * How many times a front sector, or a city to land by, within a war objective weighs (R62e). Its sectors take this many
 * times their share of the formations the threat leaves; a landing city this many times its worth.
 */
export const OBJECTIVE_WEIGHT = 6;
/** How long before an `occupy` stage its area's hold is lifted for its taker's side and their foes (R66d, ADR-974). */
export const FIGHT_DAYS = 7;
/** How far around a stage's ring its area reaches (R66d). */
export const FIGHT_BAND_KM = 120;
/** A `capital` event's `city` is founded when the nation has no city of its own this near its seat (R74c). */
export const CAPITAL_CITY_KM = 15;

/** A hold's event (R62f2): its index, the tick it ends, its two sides' nations, whether it freezes a war (R66b). */
interface Hold {
  i: number;
  until: number;
  a: ReadonlySet<number>;
  b: ReadonlySet<number>;
  frozen: boolean;
}

/** An `occupy` stage open to fighting (R66d). */
interface OpenStage {
  by: number;
  of: ReadonlySet<number>;
  inArea: (c: number) => boolean;
  inRing: (c: number) => boolean;
}

/** A window stays shut while its taker's side has under this share of its foes' men in the area (ADR-977). */
export const FIGHT_OUTNUMBERED = 1 / 3;

/** Whether a stage's taker's side has under FIGHT_OUTNUMBERED of its foes' men on land in its area, this hour. */
function outnumbered(world: World, s: OpenStage): boolean {
  const f = world.formations.cols;
  const { w } = world.cells;
  let mine = 0;
  let theirs = 0;
  world.formations.forEach((i) => {
    if (world.offLand(i) || world.rules?.templates[f.template[i]!]?.domain !== Domain.land) return;
    const n = f.nation[i]!;
    const side = takerSide(world, n, s.by);
    if (!side && !world.wars.atWar(n, s.by)) return;
    if (!s.inArea(Math.floor(f.y[i]!) * w + ((Math.floor(f.x[i]!) % w) + w) % w)) return;
    if (side) mine += f.strength[i]!;
    else theirs += f.strength[i]!;
  });
  return mine < theirs * FIGHT_OUTNUMBERED;
}

/** Whether `n` is of `by`'s side: `by`, or an ally in its war. */
function takerSide(world: World, n: number, by: number): boolean {
  return n === by || world.wars.sameSide(n, by);
}

/** Tests' switches (an A/B from one save): objectives weigh nothing; no front holds. */
export const TRACK_PROBE: { objectivesOff?: boolean; holdsOff?: boolean; fightOff?: boolean } = {};

/** The section of the track's state. */
export const TRACK_SECTION = 'world.track';

/** A key-sorted copy of a JSON value: the hash of a timeline does not hang on its file's key order or line ends. */
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v !== null && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) out[k] = canonical((v as Record<string, unknown>)[k]);
    return out;
  }
  return v;
}

/** The hash of a timeline's events (u32). */
export function timelineHash(file: TimelineFile): number {
  return hashString(JSON.stringify(canonical(file.events))) >>> 0;
}

export class Track {
  /** The events, in their order (the schema checks it is the dates'). */
  readonly events: readonly TimelineEvent[];
  /** The tick each is due. */
  readonly ticks: readonly number[];
  readonly hash: number;
  /** Nation id by tag. */
  private readonly ids: ReadonlyMap<string, number>;
  /** The next event to apply. */
  next = 0;
  /** Over for good: no event is applied again (ROADMAP R62j adds its ends at 1953 and at an intervention). */
  ended = false;
  /**
   * The tick it ended at (R74e-f, R75a: the historical focus after it, `focusAfterTrack`); -Infinity while it runs, or
   * for a save from before R75a that ended it with no tick (the focus then over). Saved in `ended`'s slot.
   */
  endedAt = -Infinity;
  /** The seed every stream is derived from again when the track ends (R62d; 0: none rolled). */
  afterSeed = 0;
  /** Nations of the scenario not yet born (R62d): no dead nation, offered nowhere. */
  unborn = new Set<number>();
  /** A save of another timeline was loaded: the runner ends the track at the next hour, with its row. */
  changed = false;
  /** The tick it ends at, after that hour's events (R62d; Infinity: none). */
  readonly endTick: number;
  /** Each nation's capital in its table, lon/lat, by id − 1 (a born nation's seat, R62d). */
  capitals: readonly (readonly [number, number])[] = [];
  /** The nations a `bomb` event has named by `next` (R69f; derived from the events applied, not state). */
  private bombs: { next: number; set: Set<number> } | null = null;

  /** Whether nation `n` may go for the bomb while the track steers: a `bomb` event applied names it (R69f, ADR-989). */
  bombCleared(n: number): boolean {
    if (this.bombs?.next !== this.next) {
      const set = new Set<number>();
      for (let i = 0; i < this.next; i++) {
        const e = this.events[i]!;
        if (e.kind === 'bomb') set.add(this.id(e.nation));
      }
      this.bombs = { next: this.next, set };
    }
    return this.bombs.set.has(n);
  }

  /** Each province's admin codes (index: province id − 1), for land named by them (R69b; derived, not state). */
  codes: readonly { adm0: string; adm1: string }[] = [];
  /** The scenario's templates, index by id (forces arriving, R62f). */
  templates: ReadonlyMap<string, number> = new Map();
  /** The scenario's first day (`dayOfIso`). */
  private readonly start: number;
  /** The revivals a born nation has, as its scenario's nations do (R62d). */
  revivals = 0;
  /** The holds' events, by index: the tick each ends and its two sides' nations (R62f2). */
  private readonly holdAt: readonly Hold[];
  /** The holds standing at a tick with `next` events applied, in `holdAt`'s order (R72b; derived, not state). */
  private live: { tick: number; next: number; list: readonly Hold[] } | null = null;
  /** The objectives' events, by index, with the tick each ends (R62e). */
  private readonly objectiveAt: readonly { i: number; until: number }[];
  /** The stages open to fighting at a tick (R66d; derived, not state). */
  private open: { tick: number; w: number; list: OpenStage[] } | null = null;
  /** The `occupy` stages' areas at a map's width, by event index (geometry; derived, not state). */
  private readonly areas = new Map<number, { w: number; x0: number; x1: number; y0: number; y1: number; ring: ReadonlySet<number> }>();
  /** Their places in cells and radii² at a map's width (derived, not state). */
  private placed: { w: number; at: { nation: number; x: number; y: number; r2: number }[] } | null = null;

  constructor(file: TimelineFile, tags: readonly string[], startDate: string) {
    this.events = file.events;
    const start = dayOfIso(startDate);
    this.start = start;
    this.ticks = file.events.map((e) => (dayOfIso(e.date) - start) * 24 + (e.hour ?? 0));
    this.hash = timelineHash(file);
    this.endTick = file.end === undefined ? Infinity : (dayOfIso(file.end) - start) * 24;
    this.objectiveAt = file.events.flatMap((e, i) => (e.kind === 'objective' ? [{ i, until: (dayOfIso(e.until) - start) * 24 }] : []));
    const ids = new Map(tags.map((t, k) => [t, k + 1]));
    // A hold whose war the timeline begins on its date (a `war` or `join` that day naming both its sides: the Phoney War,
    // Germany and the United States, the wars of 1945-50) freezes no war in progress (`frozen`, R66b).
    const warsOn = (date: string): string[][] =>
      file.events.flatMap((w) => (w.date !== date ? [] : w.kind === 'war' ? [[...w.attackers, ...w.defenders]] : w.kind === 'join' ? [[w.nation, w.beside, w.against]] : []));
    this.holdAt = file.events.flatMap((e, i) =>
      e.kind === 'hold'
        ? [
            {
              i,
              until: (dayOfIso(e.until) - start) * 24,
              a: new Set(e.sides[0].map((x) => ids.get(x) ?? 0)),
              b: new Set(e.sides[1].map((x) => ids.get(x) ?? 0)),
              frozen: !warsOn(e.date).some((named) => e.sides[0].some((x) => named.includes(x)) && e.sides[1].some((x) => named.includes(x))),
            },
          ]
        : [],
    );
    this.ids = new Map(tags.map((t, i) => [t, i + 1]));
  }

  /**
   * The weight of a place (x, y in cells) to nation `n`'s plans: OBJECTIVE_WEIGHT within one of its objectives that
   * has begun (its event applied) and not ended, 1 elsewhere.
   */
  objectiveWeight(n: number, x: number, y: number, tick: number, w: number, h: number): number {
    if (this.ended || this.objectiveAt.length === 0 || TRACK_PROBE.objectivesOff) return 1;
    if (this.placed?.w !== w) {
      const km = kmPerCell(w);
      this.placed = {
        w,
        at: this.objectiveAt.map(({ i }) => {
          const e = this.events[i] as Extract<TimelineEvent, { kind: 'objective' }>;
          const [u, v] = project(e.at[0], e.at[1]);
          const r = e.km / km;
          return { nation: this.id(e.nation), x: u * w, y: v * h, r2: r * r };
        }),
      };
    }
    for (let k = 0; k < this.objectiveAt.length; k++) {
      const o = this.objectiveAt[k]!;
      if (o.i >= this.next || tick >= o.until) continue;
      const p = this.placed.at[k]!;
      if (p.nation !== n) continue;
      let dx = Math.abs(x - p.x);
      dx = Math.min(dx, w - dx);
      const dy = y - p.y;
      if (dx * dx + dy * dy <= p.r2) return OBJECTIVE_WEIGHT;
    }
    return 1;
  }

  /** The tick of a date's first hour. */
  tickOf(date: string): number {
    return (dayOfIso(date) - this.start) * 24;
  }

  /**
   * Whether nations `a` and `b` stand on the two sides of a held front (R62f2): a hold that has begun (its event
   * applied) and not ended. A side holds its nations' puppets too (`overlord`, R62g0). False at once in a timeline
   * without holds.
   */
  /**
   * Whether a hold between `a` (its formation in cell `ca`) and `b` (in `cb`) is lifted (R66d, ADR-974): within
   * FIGHT_DAYS before an `occupy` stage not yet applied, both cells inside its area (its ring's box grown by
   * FIGHT_BAND_KM), one of them of its taker's side (the taker or an ally in its war) and the other at war with it.
   */
  fightOpen(world: World, a: number, b: number, ca: number, cb: number): boolean {
    for (const s of this.openStages(world)) {
      if (!s.inArea(ca) || !s.inArea(cb)) continue;
      if ((takerSide(world, a, s.by) && world.wars.atWar(b, s.by)) || (takerSide(world, b, s.by) && world.wars.atWar(a, s.by))) return true;
    }
    return false;
  }

  /**
   * Whether a stage's window is open between `a` and `b` anywhere (R66d): one of its taker's side, the other at war
   * with its taker. The planners plan attacks on such a foe; the fighting is still only in the area (`fightOpen`).
   */
  pairOpen(world: World, a: number, b: number): boolean {
    for (const s of this.openStages(world)) if ((takerSide(world, a, s.by) && world.wars.atWar(b, s.by)) || (takerSide(world, b, s.by) && world.wars.atWar(a, s.by))) return true;
    return false;
  }

  /**
   * Whether `an` may take cell `c` from `d` across their hold (R66d): within FIGHT_DAYS before an `occupy` stage not
   * yet applied, `an` of its taker's side, `d` at war with it, and `c` of the land the stage gives (in its ring, owned
   * by one of its `of`).
   */
  takeOpen(world: World, an: number, d: number, c: number): boolean {
    for (const s of this.openStages(world)) {
      if (!takerSide(world, an, s.by) || !world.wars.atWar(d, s.by) || !s.of.has(world.cells.owner[c]!)) continue;
      if (s.inRing(c)) return true;
    }
    return false;
  }

  /** The `occupy` stages within FIGHT_DAYS of `world.tick` not yet applied, with their areas (derived, not state). */
  private openStages(world: World): readonly OpenStage[] {
    if (this.ended || TRACK_PROBE.fightOff) return [];
    const tick = world.tick;
    if (this.open?.tick === tick && this.open.w === world.cells.w) return this.open.list;
    const list: OpenStage[] = [];
    for (let i = this.next; i < this.events.length; i++) {
      const due = this.ticks[i]!;
      if (due - tick > FIGHT_DAYS * 24) break;
      const e = this.events[i]!;
      // An `occupy`, or a `transfer` (R66e, ADR-978: the civil war in China): its `to` the taker of its `from`'s land.
      if (e.kind !== 'occupy' && e.kind !== 'transfer') continue;
      // A transfer of land named by its codes (R69b): a handover, no fighting.
      if (!e.ring) continue;
      const s = e.kind === 'occupy' ? this.area(world, i, e.by, e.of, e.ring) : this.area(world, i, e.to, e.from, e.ring);
      // Not while its taker's side is far outnumbered in its area (ADR-977): the Soviets before Moscow, a fifth of
      // the Germans there, were destroyed in the window, every man of 305k, before their own stage.
      if (outnumbered(world, s)) continue;
      list.push(s);
    }
    this.open = { tick, w: world.cells.w, list };
    return list;
  }

  /** A stage's area at a map's size (geometry only: cached). */
  private area(world: World, i: number, by: string, of: readonly string[], ring: readonly (readonly [number, number])[]): OpenStage {
    const { w, h } = world.cells;
    let a = this.areas.get(i);
    if (a?.w !== w) {
      const band = FIGHT_BAND_KM / kmPerCell(w);
      let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
      for (const [lo, la] of ring) {
        const [u, v] = project(lo, la);
        [x0, x1, y0, y1] = [Math.min(x0, u * w), Math.max(x1, u * w), Math.min(y0, v * h), Math.max(y1, v * h)];
      }
      a = { w, x0: x0 - band, x1: x1 + band, y0: y0 - band, y1: y1 + band, ring: new Set(ringCells(world, ring)) };
      this.areas.set(i, a);
    }
    const box = a;
    return {
      by: this.id(by),
      of: new Set(of.map((g) => this.id(g))),
      inArea: (c: number) => {
        const x = (c % w) + 0.5;
        const y = Math.floor(c / w) + 0.5;
        return x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
      },
      inRing: (c: number) => box.ring.has(c),
    };
  }

  held(a: number, b: number, tick: number, overlord: ArrayLike<number>): boolean {
    return this.holdOf(a, b, tick, overlord) !== null;
  }

  /**
   * The first hold standing at `tick` between `a` and `b` (`held`'s, `frozen`'s), or null. R72b: the holds standing
   * found once a tick (`standing`), and no closure made a call; asked for each pair of formations each hour.
   */
  private holdOf(a: number, b: number, tick: number, overlord: ArrayLike<number>): Hold | null {
    if (this.holdAt.length === 0 || this.ended || TRACK_PROBE.holdsOff) return null;
    const list = this.standing(tick);
    if (list.length === 0) return null;
    const oa = overlord[a] ?? 0;
    const ob = overlord[b] ?? 0;
    for (const h of list) {
      const aInA = h.a.has(a) || (oa !== 0 && h.a.has(oa));
      const bInB = h.b.has(b) || (ob !== 0 && h.b.has(ob));
      if (aInA && bInB) return h;
      const bInA = h.a.has(b) || (ob !== 0 && h.a.has(ob));
      const aInB = h.b.has(a) || (oa !== 0 && h.b.has(oa));
      if (bInA && aInB) return h;
    }
    return null;
  }

  /** The holds begun (their events applied) and not ended at `tick`, in their order (R72b). */
  private standing(tick: number): readonly Hold[] {
    const live = this.live;
    if (live !== null && live.tick === tick && live.next === this.next) return live.list;
    const list = this.holdAt.filter((h) => h.i < this.next && tick < h.until);
    this.live = { tick, next: this.next, list };
    return list;
  }

  /**
   * Whether the hold between `a` and `b` that stands at `tick` (`held`'s) freezes a war in progress (R66b, ADR-971): one
   * whose war the timeline does not begin on its date (the Eastern Front, China, the Pacific; not the Phoney War).
   */
  frozen(a: number, b: number, tick: number, overlord: ArrayLike<number>): boolean {
    return this.holdOf(a, b, tick, overlord)?.frozen ?? false;
  }

  /** The nation of a tag (0: none such). */
  id(tag: string): number {
    return this.ids.get(tag) ?? 0;
  }

  serialize(): Section[] {
    const unborn = [...this.unborn].sort((a, b) => a - b);
    return [{ name: TRACK_SECTION, dtype: 'f64', data: Float64Array.from([this.hash, this.next, !this.ended ? 0 : Number.isFinite(this.endedAt) ? 2 + this.endedAt : 1, this.afterSeed, ...unborn]) }];
  }

  /**
   * From a save's section; absent (a save from before R62b), the track goes on from the world's hour, the events before
   * it taken as done. A save of another timeline (its hash) ends the track at the next hour (`changed`).
   */
  deserialize(sections: readonly Section[], tick: number): void {
    const s = sections.find((x) => x.name === TRACK_SECTION)?.data as Float64Array | undefined;
    this.changed = false;
    if (!s) {
      this.next = this.ticks.filter((t) => t < tick).length;
      this.ended = false;
      this.endedAt = -Infinity;
      return;
    }
    this.next = s[1]!;
    // 0 running; 1 ended, with no tick (a save from before R75a); 2 + the tick it ended at.
    this.ended = s[2]! >= 1;
    this.endedAt = s[2]! >= 2 ? s[2]! - 2 : -Infinity;
    this.afterSeed = s[3]!;
    this.unborn = new Set(Array.from(s.subarray(4)));
    if (s[0] !== this.hash && !this.ended) this.changed = true;
  }
}

/** Why `n` may not take part: no such nation, or a dead one. */
function whyNot(world: World, n: number): Refusal {
  if (n === 0 || !world.nations.has(n)) return Refusal.NoNation;
  return world.nations.cols.living[n] === 1 ? Refusal.None : Refusal.DeadNation;
}

/** A war of these sides alone, each leader first with its puppets (the sim's calls of allies do not apply). */
function war(world: World, attackers: readonly number[], defenders: readonly number[], without: readonly number[] = []): Refusal {
  for (const n of [...attackers, ...defenders]) {
    const why = whyNot(world, n);
    if (why) return why;
  }
  const side = (ns: readonly number[]): number[] => [...new Set(ns.flatMap((n) => withPuppets(world, n)))].filter((x) => ns.includes(x) || !without.includes(x));
  const a = side(attackers);
  const d = side(defenders);
  if (a.some((x) => d.includes(x))) return Refusal.SameNation;
  if (a.some((x) => d.some((y) => world.wars.atWar(x, y)))) return Refusal.AtWar;
  const nc = world.nations.cols;
  world.wars.start(a, d, world.tick, [nc.fightToDeath[a[0]!] === 1, nc.fightToDeath[d[0]!] === 1]);
  // A pledge between the two sides lapses, as at any declaration.
  const al = world.alliances;
  const lapsed = al.guarantees.filter((g) => (a.includes(g.guarantor) && d.includes(g.target)) || (d.includes(g.guarantor) && a.includes(g.target)));
  if (lapsed.length > 0) {
    al.guarantees = al.guarantees.filter((g) => !lapsed.includes(g));
    al.changed();
  }
  world.out.emit(world.tick, EventKind.WarDeclared, a[0]!, d[0]!, NaN, NaN);
  for (const [s, ns] of [[a, attackers] as const, [d, defenders] as const]) {
    for (const n of ns.slice(1)) world.out.emit(world.tick, EventKind.WarJoined, n, s[0]!, NaN, JoinedBy.track);
  }
  for (const g of lapsed) world.out.emit(world.tick, EventKind.GuaranteeLapsed, g.guarantor, g.target, NaN, NaN);
  return Refusal.None;
}

/** `n` with its puppets joins the war between `beside` and `against`, on `beside`'s side. */
function join(world: World, n: number, beside: number, against: number, without: readonly number[] = []): Refusal {
  const why = whyNot(world, n) || whyNot(world, beside) || whyNot(world, against);
  if (why) return why;
  const at = world.wars.between(beside, against);
  if (!at) return Refusal.NoSuch;
  const { war: w, side } = at;
  const joining = withPuppets(world, n).filter((x) => (x === n || !without.includes(x)) && !w.sides[ATTACKERS].includes(x) && !w.sides[DEFENDERS].includes(x));
  if (!joining.includes(n)) return Refusal.NoEffect;
  const own = w.sides[side]!;
  const foes = w.sides[side === ATTACKERS ? DEFENDERS : ATTACKERS]!;
  if (joining.some((x) => own.some((y) => world.wars.atWar(x, y)))) return Refusal.AtWar;
  if (joining.some((x) => foes.some((y) => world.wars.atWar(x, y)))) return Refusal.AtWar;
  own.push(...joining);
  world.wars.changed();
  world.out.emit(world.tick, EventKind.WarJoined, n, own[0]!, NaN, JoinedBy.track);
  return Refusal.None;
}

/** The war between `a` and `b` ends: white (each keeps its own, the occupation undone), or on its score. */
function peace(world: World, a: number, b: number, terms: 'white' | 'score'): Refusal {
  const at = world.wars.between(a, b);
  if (!at) return Refusal.NoSuch;
  if (terms === 'white') at.war.score = 0;
  makePeace(world, at.war);
  return Refusal.None;
}

/** The nation's own city nearest `at` its capital (R62i2); passed over when it is already, or it holds no city. */
function moveCapital(world: World, n: number, at: readonly [number, number], city?: string): Refusal {
  const why = whyNot(world, n);
  if (why) return why;
  const { owner, w, h } = world.cells;
  const [u, v] = project(at[0], at[1]);
  let cc = world.cities.cols;
  let best = 0;
  let bestD = Infinity;
  world.cities.forEach((ci) => {
    if (owner[cc.cell[ci]!] !== n || (cc.capitalOf[ci] !== 0 && cc.capitalOf[ci] !== n)) return;
    let dx = Math.abs(cc.x[ci]! - u * w);
    dx = Math.min(dx, w - dx);
    const dy = cc.y[ci]! - v * h;
    const d = dx * dx + dy * dy;
    if (d < bestD) [best, bestD] = [ci, d];
  });
  // A seat the map has no city for (R74c: Bonn, West Germany's, was labelled Gießen): founded, on its own land.
  const reach = CAPITAL_CITY_KM / kmPerCell(w);
  const near = reach * reach;
  if (city !== undefined && (best === 0 || bestD > near) && owner[Math.floor(v * h) * w + Math.floor(u * w)] === n) {
    const made = spawnCity(world, u * w, v * h, city, 2);
    if (made !== 0) {
      best = made;
      cc = world.cities.cols; // a create may move the table to new arrays
    }
  }
  if (best === 0 || cc.capitalOf[best] === n) return best === 0 ? Refusal.NoSuch : Refusal.NoEffect;
  world.cities.forEach((ci) => {
    if (cc.capitalOf[ci] === n) cc.capitalOf[ci] = 0;
  });
  cc.capitalOf[best] = n;
  const nc = world.nations.cols;
  nc.capitalX[n] = cc.x[best]!;
  nc.capitalY[n] = cc.y[best]!;
  world.out.emit(world.tick, EventKind.CapitalMoved, n, best, cc.x[best]!, cc.y[best]!);
  return Refusal.None;
}

/** A guarantee of `target` by `guarantor`, as one of the scenario's; with `end` (R62i2), withdrawn. */
function guarantee(world: World, guarantor: number, target: number, end = false): Refusal {
  const why = whyNot(world, guarantor) || whyNot(world, target);
  if (why) return why;
  if (guarantor === target) return Refusal.SameNation;
  const al = world.alliances;
  if (end) {
    const kept = al.guarantees.filter((g) => g.guarantor !== guarantor || g.target !== target);
    if (kept.length === al.guarantees.length) return Refusal.NoEffect;
    al.guarantees = kept;
    al.changed();
    return Refusal.None;
  }
  if (al.guarantees.some((g) => g.guarantor === guarantor && g.target === target)) return Refusal.NoEffect;
  al.guarantees.push({ guarantor, target });
  al.changed();
  return Refusal.None;
}

/** The land cells inside a lon/lat ring (centre inside, as `ownership.json`'s regions), in index order. */
function ringCells(world: World, ring: readonly (readonly [number, number])[]): number[] {
  const { w, h, terrain } = world.cells;
  const out: number[] = [];
  forEachCellInRing(ring, w, h, (c) => {
    if (terrain[c]! >= Terrain.Plains) out.push(c);
  });
  return out.sort((a, b) => a - b);
}

/** Land named by a ring, by countries and by provinces (R69b, ADR-985): the land cells of any, in order. */
export interface Land {
  ring?: readonly (readonly [number, number])[] | undefined;
  countries?: readonly string[] | undefined;
  provinces?: readonly string[] | undefined;
}

function landCells(world: World, t: Track, land: Land): number[] {
  const cells = new Set(land.ring ? ringCells(world, land.ring) : []);
  if (land.countries || land.provinces) {
    const countries = new Set(land.countries ?? []);
    const provinces = new Set(land.provinces ?? []);
    const named = new Uint8Array(t.codes.length + 1);
    t.codes.forEach((c, i) => {
      if (countries.has(c.adm0) || provinces.has(c.adm1)) named[i + 1] = 1;
    });
    const { province, terrain } = world.cells;
    for (let c = 0; c < province.length; c++) if (named[province[c]!] === 1 && terrain[c]! >= Terrain.Plains) cells.add(c);
  }
  return [...cells].sort((a, b) => a - b);
}

/**
 * A cession (R62c): the land in the ring owned by one of `from` becomes `to`'s, owned and held, as land handed over is
 * (`defect`): a `LandCeded` row for each nation that gave some, a capital in it moved.
 */
function transfer(world: World, t: Track, to: number, from: readonly number[], land: Land): Refusal {
  const why = whyNot(world, to);
  if (why) return why;
  const { owner, w } = world.cells;
  const of = new Set(from.filter((n) => n !== 0 && n !== to));
  const gave = new Map<number, { cells: number; sx: number; sy: number }>();
  for (const c of landCells(world, t, land)) {
    const o = owner[c]!;
    if (!of.has(o)) continue;
    world.setOwner(c, to);
    world.setController(c, to, false, FlipCause.peace);
    const g = gave.get(o) ?? { cells: 0, sx: 0, sy: 0 };
    g.cells++;
    g.sx += (c % w) + 0.5;
    g.sy += Math.floor(c / w) + 0.5;
    gave.set(o, g);
  }
  if (gave.size === 0) return Refusal.NoEffect;
  const cc = world.cities.cols;
  for (const n of [...gave.keys()].sort((a, b) => a - b)) {
    let lost = false;
    world.cities.forEach((ci) => {
      if (cc.capitalOf[ci] === n && owner[cc.cell[ci]!] === to) {
        cc.capitalOf[ci] = 0;
        lost = true;
      }
    });
    if (lost && world.nations.cols.living[n] === 1) relocateCapital(world, n);
    const g = gave.get(n)!;
    world.out.emit(world.tick, EventKind.LandCeded, to, n, g.sx / g.cells, g.sy / g.cells);
  }
  return Refusal.None;
}

/** An occupation (R62c): the land in the ring owned by one of `of` is held by `by`, its owner unchanged. */
function occupy(world: World, by: number, of: readonly number[], ring: readonly (readonly [number, number])[]): Refusal {
  const why = whyNot(world, by);
  if (why) return why;
  const { owner, controller, w } = world.cells;
  // `by` among `of`: its own land taken back (R62g2).
  const owners = new Set(of.filter((n) => n !== 0));
  const taken = new Set<number>();
  // Its land held already by its taker's side: fulfilled (R66d: taken by the fighting of its window), not passed over;
  // with what it takes, the land its taker's foes are set down from (`lost`).
  const lost = new Set<number>();
  for (const c of ringCells(world, ring)) {
    if (!owners.has(owner[c]!)) continue;
    if (takerSide(world, controller[c]!, by)) lost.add(c);
    if (controller[c] === by) continue;
    world.setController(c, by, false, FlipCause.other);
    taken.add(c);
    lost.add(c);
  }
  // The land formations left on the stage's land (taken now, or by its window's fighting) of a nation held off from `by` (a hold: they cannot fight their way out;
  // a holder of it or an ally of one: the Italians on Germany's line, ADR-973) are set down behind the new line (R66c,
  // ADR-968), as a withdraw's are; history's pockets were taken by the stage's `withdraw` an hour before. Before, they
  // were left behind it, out of supply, and starved. Where the two fight (1941), the fighting decides, as before: set
  // down on the line, they were beaten there and the line overrun.
  const f = world.formations.cols;
  const left: number[] = [];
  world.formations.forEach((i) => {
    const n = f.nation[i]!;
    if (n === by || !world.wars.atWar(n, by) || !world.holds(n, by) || world.rules?.templates[f.template[i]!]?.domain !== Domain.land || world.embarked.has(i)) return;
    if (lost.has(Math.floor(f.y[i]!) * w + ((Math.floor(f.x[i]!) % w) + w) % w)) left.push(i);
  });
  const placed = new Map<number, number>();
  for (const i of left.sort((a, b) => a - b)) setDownBehind(world, i, lost, placed);
  return lost.size > 0 ? Refusal.None : Refusal.NoEffect;
}

/**
 * Sets land formation `i` down on the nearest land of its nation's outside `lost` (`fallBackCell`), off any march, as a
 * landing sets one down (R66c, ADR-968); false where there is none within FALL_BACK_CELLS.
 */
function setDownBehind(world: World, i: number, lost: ReadonlySet<number>, placed: Map<number, number>): boolean {
  const f = world.formations.cols;
  const { w } = world.cells;
  if (world.embarked.has(i)) return false;
  const to = fallBackCell(world, Math.floor(f.y[i]!) * w + ((Math.floor(f.x[i]!) % w) + w) % w, f.nation[i]!, lost, placed);
  if (to < 0) return false;
  placed.set(to, (placed.get(to) ?? 0) + 1);
  f.home[i] = 0;
  f.moving[i] = 0;
  f.retreat[i] = 0;
  f.engaged[i] = 0;
  world.paths.delete(i);
  world.playerOrders.delete(i);
  f.x[i] = (to % w) + 0.5;
  f.y[i] = Math.floor(to / w) + 0.5;
  return true;
}

/**
 * A nation of the scenario born (R62d): unborn until now (or dead, brought back: R62g2), it takes the land in the ring of `from` as a transfer does,
 * with cores on the provinces whose centre it holds, its capital the city of its own nearest its table's (else
 * `relocateCapital`), the techs of the nation that gave most (the nuclear aside), START_GOLD and the scenario's
 * revivals. `NationBorn` after its land's `LandCeded` rows.
 */
function born(world: World, t: Track, n: number, from: readonly number[], land: Land): Refusal {
  if (n === 0 || !world.nations.has(n)) return Refusal.NoNation;
  // Unborn, or dead and brought back (R62g2: Ethiopia restored).
  if (world.nations.cols.living[n] === 1) return Refusal.Alive;
  const { owner } = world.cells;
  const before = new Map<number, number>();
  const cells = landCells(world, t, land).filter((c) => from.includes(owner[c]!) && owner[c] !== n);
  if (cells.length === 0) return Refusal.NoCoreLand;
  for (const c of cells) before.set(owner[c]!, (before.get(owner[c]!) ?? 0) + 1);
  let giver = 0;
  for (const [g, k] of [...before].sort((a, b) => a[0] - b[0])) if (giver === 0 || k > before.get(giver)!) giver = g;
  const nc = world.nations.cols;
  nc.living[n] = 1;
  nc.bankrupt[n] = 0;
  nc.gold[n] = START_GOLD;
  nc.people[n] = n;
  nc.revivalsLeft[n] = t.revivals;
  const [n0, n1] = nuclearMask(world);
  nc.tech0[n] = (nc.tech0[giver]! & ~n0) >>> 0;
  nc.tech1[n] = (nc.tech1[giver]! & ~n1) >>> 0;
  t.unborn.delete(n);
  transfer(world, t, n, from, land);
  // Its cores: the provinces whose centre it now holds.
  const { province, w, h } = world.cells;
  const mine = new Set<number>();
  for (const c of cells) if (owner[c] === n) mine.add(province[c]!);
  const g = navOf(world).graph;
  const centre = (p: number): number => g.centre[p] ?? -1;
  for (const p of [...mine].sort((a, b) => a - b)) {
    if (p === 0) continue;
    const c = centre(p);
    if (c < 0 || owner[c] === n) world.provinces.core[p] = n;
  }
  // Its seat: its own city nearest its table's capital.
  const [lon, lat] = t.capitals[n - 1] ?? [0, 0];
  const [u, v] = project(lon, lat);
  const cc = world.cities.cols;
  let best = 0;
  let bestD = Infinity;
  world.cities.forEach((ci) => {
    if (owner[cc.cell[ci]!] !== n || cc.capitalOf[ci] !== 0) return;
    let dx = Math.abs(cc.x[ci]! - u * w);
    dx = Math.min(dx, w - dx);
    const dy = cc.y[ci]! - v * h;
    const d = dx * dx + dy * dy;
    if (d < bestD) [best, bestD] = [ci, d];
  });
  if (best !== 0) {
    cc.capitalOf[best] = n;
    nc.capitalX[n] = cc.x[best]!;
    nc.capitalY[n] = cc.y[best]!;
  } else relocateCapital(world, n);
  world.out.emit(world.tick, EventKind.NationBorn, n, giver, nc.capitalX[n]!, nc.capitalY[n]!);
  return Refusal.None;
}

/**
 * The track ends for good (R62d; the intervention's end is R62j): a `TrackEnded` row, and every stream of chance is
 * derived again from the second seed, so what follows differs from game to game (none rolled: the seed stays).
 */
export function endTrack(world: World, why: number): void {
  const t = world.track;
  if (!t || t.ended) return;
  t.ended = true;
  t.endedAt = world.tick;
  t.changed = false;
  // A nation history ended for good comes back no more (R74c, critic run 65: Manchukuo revived in 1979): dead at the
  // end, and no event of the rest of the timeline brings it back.
  const nc = world.nations.cols;
  const later = new Set(t.events.slice(t.next).flatMap((e) => (e.kind === 'born' ? [t.id(e.nation)] : [])));
  world.nations.forEach((n) => {
    if (nc.living[n] === 0 && !t.unborn.has(n) && !later.has(n)) nc.revivalsLeft[n] = 0;
  });
  world.out.emit(world.tick, EventKind.TrackEnded, 0, why, NaN, NaN);
  if (t.afterSeed !== 0) {
    world.seed = t.afterSeed >>> 0;
    world.rng = new RngStreams(world.seed);
  }
}

/** Applies one event; why not when it no longer applies (the state then as it was). */
function apply(world: World, t: Track, e: TimelineEvent): Refusal {
  const id = (tag: string): number => t.id(tag);
  switch (e.kind) {
    case 'war':
      return war(world, e.attackers.map(id), e.defenders.map(id), (e.without ?? []).map(id));
    case 'join':
      return join(world, id(e.nation), id(e.beside), id(e.against), (e.without ?? []).map(id));
    case 'peace':
      return peace(world, id(e.a), id(e.b), e.terms);
    case 'annex':
      return applyCommand(world, { kind: 'annexNation', annexer: id(e.annexer), target: id(e.target) });
    case 'puppet':
      return applyCommand(world, { kind: 'createPuppet', overlord: id(e.overlord), subject: id(e.subject), autonomy: e.autonomy });
    case 'release':
      return applyCommand(world, { kind: 'releasePuppet', subject: id(e.subject) });
    case 'allianceJoin': {
      const a = world.alliances.allianceOf(id(e.leader));
      return a
        ? applyCommand(world, { kind: 'joinAlliance', nation: id(e.nation), alliance: a.id })
        : applyCommand(world, { kind: 'createAlliance', leader: id(e.leader), members: [id(e.nation)], nameKey: e.nameKey });
    }
    case 'allianceLeave':
      return applyCommand(world, { kind: 'leaveAlliance', nation: id(e.nation) });
    case 'guarantee':
      return guarantee(world, id(e.guarantor), id(e.target), e.end === true);
    case 'transfer':
      return transfer(world, t, id(e.to), e.from.map(id), e);
    case 'occupy':
      return occupy(world, id(e.by), e.of.map(id), e.ring);
    case 'born':
      return born(world, t, id(e.nation), e.from.map(id), e);
    case 'objective':
      // It weighs from now on (`objectiveWeight`); a nation not living has none.
      return whyNot(world, id(e.nation));
    case 'hold':
      // It holds from now on (`held`) while its nations live.
      return whyNot(world, id(e.sides[0][0]!)) || whyNot(world, id(e.sides[1][0]!));
    case 'leave': {
      const foe = id(e.against);
      const left = e.nations.map(id).filter((n) => world.nations.cols.living[n] === 1 && world.wars.atWar(n, foe));
      for (const n of left) leaveWarsAgainst(world, n, foe);
      return left.length > 0 ? Refusal.None : Refusal.NoEffect;
    }
    case 'forces': {
      const template = t.templates.get(e.template);
      if (template === undefined) return Refusal.NoSuch;
      const [u, v] = project(e.at[0], e.at[1]);
      const before = new Set<number>();
      world.formations.forEach((i) => before.add(i));
      let why: Refusal = Refusal.None;
      for (let k = 0; k < e.count && why === Refusal.None; k++) why = applyCommand(world, { kind: 'spawnFormation', nation: id(e.nation), x: u * world.cells.w, y: v * world.cells.h, strength: 1, template });
      // On an enemy's land, its cell theirs: a beachhead for the front to spread from, as a landing's (PLAN 4.5b; R66d,
      // ADR-976). Before, arrivals inside an enemy's land took none of it: land is taken from a neighbouring cell held.
      const [sx, sy] = world.standPoint(u * world.cells.w, v * world.cells.h);
      const cell = Math.floor(sy) * world.cells.w + Math.floor(sx);
      const holder = world.cells.controller[cell]!;
      // Not of an owner it is at peace with (R74g: the Americans landing in Normandy on 5 June 1944, the land Vichy's,
      // held by the Germans): they stand on it, and the stage gives it.
      const owner = world.cells.owner[cell]!;
      const ownerFoe = owner === holder || owner === 0 || world.wars.atWar(owner, id(e.nation));
      if (why === Refusal.None && holder !== 0 && ownerFoe && world.wars.atWar(holder, id(e.nation))) world.setController(cell, id(e.nation), false, FlipCause.landing);
      // Kept where they arrive for the stage they came for (`kept`, R66d, ADR-976): the AI leaves them be until its
      // window of fighting opens (FIGHT_DAYS before its date, `playerHeld`), then has them for the attack; nobody
      // disbands them before the stage (R66e, ADR-978). Before, the AI shipped two of the Japanese 25th Army's three
      // divisions to the objectives of Manila and Borneo before Malaya's stage.
      if (e.kept !== undefined) {
        const until = t.tickOf(e.kept);
        world.formations.forEach((i) => {
          if (!before.has(i)) world.playerOrders.set(i, { kind: PlayerOrderKind.kept, until, through: false });
        });
      }
      return why;
    }
    case 'capital':
      return moveCapital(world, id(e.nation), e.at, e.city);
    case 'rename': {
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      if (world.identities.get(n) === e.as) return Refusal.NoEffect;
      world.identities.set(n, e.as);
      world.namesVersion++;
      world.flagsVersion++;
      return Refusal.None;
    }
    case 'regime': {
      // A coup or a revolution (R71a, ADR-992): its aggression, and the command efficiency it sets at the start.
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      const nc = world.nations.cols;
      nc.aggression[n] = e.aggression;
      nc.ceStatic[n] = staticCe(e.aggression);
      // And its traits, where it names them (R74d, critic run 65 R65-N1: Japan and Italy militarist to 1975).
      if (e.traits) applyTraits(world, n, traitMask(e.traits));
      return Refusal.None;
    }
    case 'bomb': {
      // The test (R69f, ADR-989): the nation knows the bomb from now (a `NuclearPower` row, as research's), and
      // `bombCleared` lets it build while the track steers.
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      const bomb = world.rules?.techs.findIndex((x) => x.id === 'atomic_bomb') ?? -1;
      if (bomb < 0 || knowsTechs(world, n, techMask([bomb]))) return Refusal.None;
      grantTechs(world, n, techMask([bomb]));
      const nc = world.nations.cols;
      world.out.emit(world.tick, EventKind.NuclearPower, n, incomeRankOf(world, n), nc.capitalX[n]!, nc.capitalY[n]!);
      return Refusal.None;
    }
    case 'nuke': {
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      const [u, v] = project(e.at[0], e.at[1]);
      const [x, y] = landNear(world, u * world.cells.w, v * world.cells.h);
      detonate(world, n, 1, x, y);
      return Refusal.None;
    }
    case 'withdraw': {
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      const inRing = new Set(ringCells(world, e.ring));
      // Set down behind the line only where a hold keeps `n` from fighting (R66c): else an evacuation, as before.
      // Held off from a foe that holds land next to the ring: the one taking it (not any foe of n's anywhere).
      const { w: cw, h: ch, controller: ctl } = world.cells;
      const nb: number[] = [];
      let held = false;
      for (const c of inRing) {
        for (const k of neighbours4(c, cw, ch, world.settings.loopingMap, nb)) {
          const m = ctl[k]!;
          if (m !== 0 && m !== n && !inRing.has(k) && world.wars.atWar(n, m) && world.holds(n, m)) held = true;
        }
        if (held) break;
      }
      const placed = new Map<number, number>();
      const f = world.formations.cols;
      const { w } = world.cells;
      const gone: number[] = [];
      world.formations.forEach((i) => {
        if (f.nation[i] !== n) return;
        const land = world.rules?.templates[f.template[i]!]?.domain === Domain.land;
        if (!land) {
          if (e.fleets === true) gone.push(i);
          return;
        }
        if (inRing.has(Math.floor(f.y[i]!) * w + ((Math.floor(f.x[i]!) % w) + w) % w)) gone.push(i);
      });
      for (const i of gone.sort((a, b) => a - b)) {
        const land = world.rules?.templates[f.template[i]!]?.domain === Domain.land;
        // A fall-back (R66c, ADR-968): set down on the nearest land of its own behind the line, and not lost to the
        // front; only one with none within FALL_BACK_CELLS (an evacuation over the sea: Dunkirk) leaves the theatre,
        // its men back to the pool.
        if (e.captured !== true && land) {
          if (held && setDownBehind(world, i, inRing, placed)) continue;
          world.nations.cols.manpower[n] = world.nations.cols.manpower[n]! + f.strength[i]!;
        }
        applyCommand(world, { kind: 'removeFormation', id: i });
      }
      // Applied however many it found: a ring cleared (an empty pocket is no event passed over).
      return Refusal.None;
    }
    case 'redeploy': {
      const n = id(e.nation);
      const why = whyNot(world, n);
      if (why) return why;
      const inRing = new Set(ringCells(world, e.from));
      const f = world.formations.cols;
      const { w, h } = world.cells;
      const ids: number[] = [];
      world.formations.forEach((i) => {
        if (f.nation[i] !== n || world.rules?.templates[f.template[i]!]?.domain !== Domain.land) return;
        const c = Math.floor(f.y[i]!) * w + ((Math.floor(f.x[i]!) % w) + w) % w;
        if (inRing.has(c)) ids.push(i);
      });
      ids.sort((a, b) => a - b);
      let sent = 0;
      ids.slice(0, Math.round(ids.length * e.share)).forEach((i, k) => {
        const [u, v] = project(...e.to[k % e.to.length]!);
        if (applyCommand(world, { kind: 'moveFormation', id: i, x: u * w, y: v * h, nation: n }) === Refusal.None) sent++;
      });
      return sent > 0 ? Refusal.None : Refusal.NoEffect;
    }
    case 'buff': {
      const hours = t.tickOf(e.until) - world.tick;
      return whyNot(world, id(e.nation)) || applyCommand(world, { kind: 'grantBuff', targetKind: 'nation', target: id(e.nation), buff: e.buff, magnitude: e.magnitude, hours, nameKey: 'buff.history' });
    }
  }
}

/** How many formations a stage sets down on one cell (R66c): a stage's along its line, not all on its nearest cell. */
export const SET_DOWN_PER_CELL = 2;

/** How far over land (cells at the 1938 map's size, `World.atSize`) a formation looks for its own land behind a stage's line (R66c). */
export const FALL_BACK_CELLS = 40;

/**
 * The nearest land cell (4-neighbour steps over land, within FALL_BACK_CELLS; the lowest index of equals) that `n`
 * or an ally of its in a war holds, that is not in the ring and that has fewer than SET_DOWN_PER_CELL of this stage's set down on it (`placed`),
 * from `start`; -1 for none.
 */
function fallBackCell(world: World, start: number, n: number, inRing: ReadonlySet<number>, placed: ReadonlyMap<number, number>): number {
  const { w, h, terrain, controller } = world.cells;
  const wrap = world.settings.loopingMap;
  const seen = new Set<number>([start]);
  let ring = [start];
  const far = world.atSize(FALL_BACK_CELLS);
  // Its own land, or an ally's in its war (ADR-973: the Italians in Russia have none of their own within reach).
  const ours = (m: number): boolean => m === n || (m !== 0 && world.wars.sameSide(m, n));
  for (let step = 0; step <= far && ring.length > 0; step++) {
    let best = -1;
    for (const c of ring) if (ours(controller[c]!) && !inRing.has(c) && (placed.get(c) ?? 0) < SET_DOWN_PER_CELL && (best < 0 || c < best)) best = c;
    if (best >= 0) return best;
    const next: number[] = [];
    for (const c of ring) {
      const x = c % w;
      const y = Math.floor(c / w);
      const nbs = [y > 0 ? c - w : -1, y < h - 1 ? c + w : -1, x > 0 ? c - 1 : wrap ? c + w - 1 : -1, x < w - 1 ? c + 1 : wrap ? c - w + 1 : -1];
      for (const k of nbs) {
        if (k < 0 || seen.has(k) || terrain[k]! < Terrain.Plains) continue;
        seen.add(k);
        next.push(k);
      }
    }
    ring = next;
  }
  return -1;
}

/** The first nation an event names. */
function firstNation(t: Track, e: TimelineEvent): number {
  switch (e.kind) {
    case 'war':
      return t.id(e.attackers[0]!);
    case 'join':
    case 'allianceJoin':
    case 'allianceLeave':
      return t.id(e.nation);
    case 'peace':
      return t.id(e.a);
    case 'annex':
      return t.id(e.annexer);
    case 'puppet':
      return t.id(e.overlord);
    case 'release':
      return t.id(e.subject);
    case 'guarantee':
      return t.id(e.guarantor);
    case 'transfer':
      return t.id(e.to);
    case 'occupy':
      return t.id(e.by);
    case 'born':
    case 'objective':
    case 'buff':
    case 'forces':
    case 'redeploy':
    case 'withdraw':
    case 'nuke':
    case 'bomb':
    case 'regime':
    case 'capital':
    case 'rename':
      return t.id(e.nation);
    case 'hold':
      return t.id(e.sides[0][0]!);
    case 'leave':
      return t.id(e.nations[0]!);
  }
}

/**
 * Step 1b of §2.5 in a world with a track: each event due by this hour, in the timeline's order. Run by `step` after
 * the hour's commands, not when commands are applied while paused.
 */
export function runTrack(world: World): void {
  const t = world.track;
  if (!t || t.ended) return;
  if (t.changed) {
    endTrack(world, TrackEnd.timelineChanged);
    return;
  }
  if (t.next < t.events.length && t.ticks[t.next]! <= world.tick) applyDue(world, t);
  // Its last day (R62d): after that hour's events.
  if (world.tick >= t.endTick) endTrack(world, TrackEnd.date);
}

/** The events due by this hour, in the timeline's order. */
function applyDue(world: World, t: Track): void {
  // An event may make, end or move what stands in contact: worked out again from the state, as after commands.
  world.contacts = null;
  world.deployed = null;
  world.deployedBefore = null;
  while (t.next < t.events.length && t.ticks[t.next]! <= world.tick) {
    const i = t.next++;
    const e = t.events[i]!;
    const why = apply(world, t, e);
    if (why !== Refusal.None) world.out.emit(world.tick, EventKind.TrackSkipped, firstNation(t, e), i + 1, NaN, why);
    else if (toldByNote(t, i)) {
      const [x, y] = placeOf(world, t, e);
      world.out.emit(world.tick, EventKind.TrackEvent, i + 1, firstNation(t, e), x, y);
    }
  }
}

/**
 * The kinds of event told by their note (ROADMAP R64b; critic run 62, R62-N2): those the game tells no other way.
 * Not a war, peace, annexation, birth, release, join, leave, pact or strike: their own rows tell them ("Soviet Union
 * declared war on Japan" beside "The Soviet Union declares war on Japan" was told twice). Not the steering (`hold`,
 * `objective`, `buff`, `redeploy`): its notes are the builder's ("the timeline's stages").
 */
export const TOLD_KINDS: ReadonlySet<TimelineEvent['kind']> = new Set(['transfer', 'occupy', 'withdraw', 'forces', 'capital', 'rename', 'regime']);
/** The steering's kinds: never the "Next" line's (R64b). */
export const STEERING_KINDS: ReadonlySet<TimelineEvent['kind']> = new Set(['hold', 'objective', 'buff', 'redeploy']);

/**
 * Whether event i is told by its note: of a told kind, and not one of its day's told before it whose note begins as
 * its or as which it begins (a pocket's `withdraw` and its stage's `occupy`: "The Vistula-Oder; Budapest besieged"
 * and "…: the Germans fall back").
 */
export function toldByNote(t: Track, i: number): boolean {
  const e = t.events[i]!;
  if (e.note === undefined || !TOLD_KINDS.has(e.kind)) return false;
  for (let j = i - 1; j >= 0 && t.events[j]!.date === e.date; j--) {
    const o = t.events[j]!;
    if (o.note !== undefined && TOLD_KINDS.has(o.kind) && (o.note.startsWith(e.note) || e.note.startsWith(o.note))) return false;
  }
  return true;
}

/** Burst on the land a strike was aimed at (R64e; critic run 62, R62-N5: Nagasaki's point fell on a sea cell). */
const LAND_SNAP_CELLS = 4;

/**
 * (x, y), or the middle of the nearest land cell within LAND_SNAP_CELLS when its own is water (the lower row, then
 * the lower column, on a tie): a city on a coast whose point the grid puts in the sea.
 */
function landNear(world: World, x: number, y: number): [number, number] {
  const { w, h, terrain } = world.cells;
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  const land = (c: number): boolean => terrain[c]! >= Terrain.Plains;
  if (cx >= 0 && cx < w && cy >= 0 && cy < h && land(cy * w + cx)) return [x, y];
  let best = -1;
  let d2 = Infinity;
  for (let dy = -LAND_SNAP_CELLS; dy <= LAND_SNAP_CELLS; dy++) {
    for (let dx = -LAND_SNAP_CELLS; dx <= LAND_SNAP_CELLS; dx++) {
      const qx = cx + dx;
      const qy = cy + dy;
      if (qx < 0 || qx >= w || qy < 0 || qy >= h || dx * dx + dy * dy >= d2 || !land(qy * w + qx)) continue;
      [best, d2] = [qy * w + qx, dx * dx + dy * dy];
    }
  }
  return best < 0 ? [x, y] : [(best % w) + 0.5, Math.floor(best / w) + 0.5];
}

/** Where an event is told (R62j1): its ring's middle, its point, else the capital of the nation it names first. */
function placeOf(world: World, t: Track, e: TimelineEvent): [number, number] {
  const { w, h } = world.cells;
  const ring = 'ring' in e ? e.ring : 'from' in e && e.kind === 'redeploy' ? e.from : null;
  if (ring) {
    let [su, sv] = [0, 0];
    for (const [lon, lat] of ring) {
      const [u, v] = project(lon, lat);
      su += u;
      sv += v;
    }
    return [(su / ring.length) * w, (sv / ring.length) * h];
  }
  if ('at' in e && Array.isArray(e.at)) {
    const [u, v] = project(e.at[0], e.at[1]);
    return [u * w, v * h];
  }
  const n = firstNation(t, e);
  return [world.nations.cols.capitalX[n] ?? 0, world.nations.cols.capitalY[n] ?? 0];
}
