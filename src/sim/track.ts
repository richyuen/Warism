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
import { dayOfIso } from '../shared/calendar';
import { Refusal } from '../shared/commands';
import { EventKind, JoinedBy, TrackEnd } from '../shared/events';
import type { Section } from './core/sections';
import { hashString } from './core/hash';
import type { TimelineEvent, TimelineFile } from './data/schemas';
import { Terrain } from '../shared/terrain';
import { RngStreams } from './core/rng';
import { forEachCellInRing } from './data/ownership';
import { kmPerCell, project } from './data/projection';
import { nuclearMask, START_GOLD } from './systems/revolts';
import { relocateCapital } from './systems/capitals';
import { makePeace, withPuppets } from './systems/war';
import { applyCommand } from './tick';
import { ATTACKERS, DEFENDERS } from './wars';
import { FlipCause, navOf, type World } from './world';

/**
 * How many times a front sector, or a city to land by, within a war objective weighs (R62e). Its sectors take this many
 * times their share of the formations the threat leaves; a landing city this many times its worth.
 */
export const OBJECTIVE_WEIGHT = 6;

/** Tests' switch (an A/B from one save): objectives weigh nothing. */
export const TRACK_PROBE: { objectivesOff?: boolean } = {};

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
  /** The scenario's templates, index by id (forces arriving, R62f). */
  templates: ReadonlyMap<string, number> = new Map();
  /** The scenario's first day (`dayOfIso`). */
  private readonly start: number;
  /** The revivals a born nation has, as its scenario's nations do (R62d). */
  revivals = 0;
  /** The objectives' events, by index, with the tick each ends (R62e). */
  private readonly objectiveAt: readonly { i: number; until: number }[];
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

  /** The nation of a tag (0: none such). */
  id(tag: string): number {
    return this.ids.get(tag) ?? 0;
  }

  serialize(): Section[] {
    const unborn = [...this.unborn].sort((a, b) => a - b);
    return [{ name: TRACK_SECTION, dtype: 'f64', data: Float64Array.from([this.hash, this.next, this.ended ? 1 : 0, this.afterSeed, ...unborn]) }];
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
      return;
    }
    this.next = s[1]!;
    this.ended = s[2] === 1;
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

/** A guarantee of `target` by `guarantor`, as one of the scenario's. */
function guarantee(world: World, guarantor: number, target: number): Refusal {
  const why = whyNot(world, guarantor) || whyNot(world, target);
  if (why) return why;
  if (guarantor === target) return Refusal.SameNation;
  const al = world.alliances;
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

/**
 * A cession (R62c): the land in the ring owned by one of `from` becomes `to`'s, owned and held, as land handed over is
 * (`defect`): a `LandCeded` row for each nation that gave some, a capital in it moved.
 */
function transfer(world: World, to: number, from: readonly number[], ring: readonly (readonly [number, number])[]): Refusal {
  const why = whyNot(world, to);
  if (why) return why;
  const { owner, w } = world.cells;
  const of = new Set(from.filter((n) => n !== 0 && n !== to));
  const gave = new Map<number, { cells: number; sx: number; sy: number }>();
  for (const c of ringCells(world, ring)) {
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
  const { owner, controller } = world.cells;
  const owners = new Set(of.filter((n) => n !== 0 && n !== by));
  let held = 0;
  for (const c of ringCells(world, ring)) {
    if (!owners.has(owner[c]!) || controller[c] === by) continue;
    world.setController(c, by, false, FlipCause.other);
    held++;
  }
  return held > 0 ? Refusal.None : Refusal.NoEffect;
}

/**
 * A nation of the scenario born (R62d): unborn until now, it takes the land in the ring of `from` as a transfer does,
 * with cores on the provinces whose centre it holds, its capital the city of its own nearest its table's (else
 * `relocateCapital`), the techs of the nation that gave most (the nuclear aside), START_GOLD and the scenario's
 * revivals. `NationBorn` after its land's `LandCeded` rows.
 */
function born(world: World, t: Track, n: number, from: readonly number[], ring: readonly (readonly [number, number])[]): Refusal {
  if (n === 0 || !world.nations.has(n)) return Refusal.NoNation;
  if (!t.unborn.has(n)) return Refusal.Alive;
  const { owner } = world.cells;
  const before = new Map<number, number>();
  const cells = ringCells(world, ring).filter((c) => from.includes(owner[c]!) && owner[c] !== n);
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
  transfer(world, n, from, ring);
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
  t.changed = false;
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
      return guarantee(world, id(e.guarantor), id(e.target));
    case 'transfer':
      return transfer(world, id(e.to), e.from.map(id), e.ring);
    case 'occupy':
      return occupy(world, id(e.by), e.of.map(id), e.ring);
    case 'born':
      return born(world, t, id(e.nation), e.from.map(id), e.ring);
    case 'objective':
      // It weighs from now on (`objectiveWeight`); a nation not living has none.
      return whyNot(world, id(e.nation));
    case 'forces': {
      const template = t.templates.get(e.template);
      if (template === undefined) return Refusal.NoSuch;
      const [u, v] = project(e.at[0], e.at[1]);
      let why: Refusal = Refusal.None;
      for (let k = 0; k < e.count && why === Refusal.None; k++) why = applyCommand(world, { kind: 'spawnFormation', nation: id(e.nation), x: u * world.cells.w, y: v * world.cells.h, strength: 1, template });
      return why;
    }
    case 'buff': {
      const hours = t.tickOf(e.until) - world.tick;
      return whyNot(world, id(e.nation)) || applyCommand(world, { kind: 'grantBuff', targetKind: 'nation', target: id(e.nation), buff: e.buff, magnitude: e.magnitude, hours, nameKey: 'buff.history' });
    }
  }
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
      return t.id(e.nation);
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
  }
}
