/**
 * Strategic AI v1 (SPEC §7, PLAN 1.24). Daily at 00:00; each nation acts every STAGGER days
 * (day + id ≡ 0 mod STAGGER). Draws are hash32(seed, day, nation, salt), so runs are replayable.
 *
 * Neighbours: owners of adjacent provinces (province graph, centre cells).
 * Strength(n): men in the formations of n and its puppets. Both sides of a prospective war add
 * ALLY_WEIGHT of their partners: the attacker its alliance, the target its alliance and
 * guarantors (they join, PLAN 1.17). Partners count for less than their numbers because they
 * fight on their own fronts. (Critic B1, 2026-10-03: the target used to count its partners in
 * full and the attacker none, so after a few years of alliance-building nobody could attack.)
 *
 * Declare war (aggression ≥ PACIFIST_BELOW, not a puppet, not broke, in < MAX_WARS wars):
 *   utility(t) = aggression/100 × (min(RATIO_CAP, attack(n)/defence(t)) − 1) + OPPORTUNITY (t already at war)
 *              + CLAIM (n has a core on land t holds) − exhaustion/100 − WARS_PENALTY × wars
 *              + PARIAH_WAR × relationHit(n, t)  (the world's outrage at t's nuclear strikes, PLAN 6.5b)
 *              + RESTLESS × min(1, years n has been at peace / RESTLESS_YEARS)  (in no war; PLAN 7.14)
 * over neighbours t that are valid targets; the best t with utility > DECLARE_AT is attacked
 * with probability DECLARE_P × aggression/100. With no neighbour over the bar, the same over the
 * nations it could land on across the sea (`seaTargets`, PLAN 7.82d).
 * Stalemate peace: a war older than STALEMATE_DAYS with |score| < STALEMATE_SCORE and both
 * sides' exhaustion > STALEMATE_EXHAUSTION ends in peace on its score.
 * Alliances: an unaligned nation bordering an aggressive (≥ THREAT_AGGRESSION) neighbour more
 * than THREAT_RATIO × stronger joins the strongest alliance among its other neighbours, or
 * forms one with an unaligned neighbour of that threat (probability ALLY_P).
 * Coalition (monthly): against a nation earning > HEGEMON_SHARE of world gross income, its
 * unaligned neighbours (not its puppets) form or join a coalition alliance; and those of the nation
 * the world is most outraged at for its nuclear strikes (`worstPariah`, PLAN 6.5b) a league of
 * their own, 'alliance.pariah', that does not have it.
 * Rivals apart (monthly, PLAN 7.53b): the great powers of an alliance but its first lose loyalty while
 * they fight no great power together with it, and leave (`allianceSystem`); and a great power joins no
 * alliance that holds another (against a threat, or a coalition).
 * God Mode can switch the AI off globally (setting `aiEnabled`) or per nation (`setAi`).
 */
import { isDayStart, isMonthStart } from '../../shared/calendar';
import { Refusal } from '../../shared/commands';
import { EventKind } from '../../shared/events';
import { hash32, hashToUnit } from '../core/hash';
import { makePeace, declareWar, whyNotWar } from '../systems/war';
import { levyFormation } from '../systems/production';
import { canJoin, LEAVE_LOYALTY, leaveAlliance, noWarAmong } from '../systems/alliances';
import { blocLeader, relationHit, worstPariah } from '../systems/nuclear';
import { transportGroupsAtPort } from '../systems/amphibious';
import { keyAt, waterKeys } from '../systems/navalCombat';
import { forceMen, seaHolder } from '../systems/seaControl';
import { navOf, portSeaOf, seaOf, type World } from '../world';
import { ATTACKERS } from '../wars';
import { AiLayer, aiRuns } from './layers';

export const STAGGER = 7;
/** Nations below this aggression never start wars (they still defend, ally and make peace). */
export const PACIFIST_BELOW = 15;
/** Cap on the strength ratio term (a target without an army is not infinitely attractive). */
export const RATIO_CAP = 3;
/** Weight of alliance partners and guarantors in the strength comparison. */
export const ALLY_WEIGHT = 0.4;
export const MAX_WARS = 2;
export const OPPORTUNITY = 0.3;
export const CLAIM = 0.3;
export const WARS_PENALTY = 0.4;
export const DECLARE_AT = 0.5;
export const DECLARE_P = 0.25;
export const STALEMATE_DAYS = 720;
export const STALEMATE_SCORE = 15;
export const STALEMATE_EXHAUSTION = 40;
export const THREAT_AGGRESSION = 50;
export const THREAT_RATIO = 1.5;
export const ALLY_P = 0.3;
export const HEGEMON_SHARE = 0.25;
/** The war utility's weight of a neighbour's nuclear outrage (PLAN 6.5b). */
export const PARIAH_WAR = 0.5;
/**
 * Restlessness (PLAN 7.14, ADR-481): a nation at peace grows readier for war, RESTLESS at most,
 * reached after RESTLESS_YEARS without a war of its own (`Wars.lastFought`). Measured before
 * (`tools/diag/warGates.ts`, seeds 1, 3, 5): the best war's utility of a turn stopped below
 * DECLARE_AT averaged 0.01 to 0.10 in every decade, most of it OPPORTUNITY (a target at war
 * already): wars came of wars, and a world at peace stayed so (declarations in years 41–50 about
 * half of years 1–10's, `tools/diag/warFronts.ts`).
 */
export const RESTLESS = 0.3;
export const RESTLESS_YEARS = 10;
/**
 * The great powers (PLAN 7.53, ADR-585, the user's decision): the GREAT_POWERS strongest living
 * nations that are no puppet (`strengths`, lowest id on ties).
 */
export const GREAT_POWERS = 6;
/**
 * Rivals apart (PLAN 7.53b): monthly, in an alliance that holds two or more great powers, each of
 * them but its first (the leader if it is one, else the strongest of them) loses this much loyalty
 * while it fights no great power together with the first (the two on one side of a war whose other
 * side has a great power: a war of theirs on a small nation does not keep them, as their alliance
 * draws them into one most months), and leaves once under LEAVE_LOYALTY (`allianceSystem`'s pull to
 * the unity lifts a loyalty of 0 to 25 at a unity of 100, so there it would never go). From 100 it
 * goes in the third month, from 60 (a new member's) in the second. Measured before (PLAN 7.53a): Germany's alliance of 1938
 * held 3 to 5 of the 6 great powers from year 2, and they never fought one another.
 */
export const RIVAL_LOYALTY = 30;
/**
 * The years from the scenario's start before rivals part (PLAN 7.53b): the alliances a scenario
 * sets (1938's Anti-Comintern pact of Germany, Italy and Japan, three of its six great powers) have
 * their war first; without it they parted in the second month, before any war of theirs.
 */
export const RIVAL_GRACE_YEARS = 3;

/** Whether rivals part yet (PLAN 7.53b): RIVAL_GRACE_YEARS after the scenario's start. */
export function rivalsPart(world: World): boolean {
  return world.tick >= 24 * 365 * RIVAL_GRACE_YEARS;
}
const SALT_WAR = 0xa101;
const SALT_ALLY = 0xa102;

/** Neighbour sets of living nations (owners of adjacent provinces). */
export function neighbourMap(world: World): Map<number, Set<number>> {
  const g = navOf(world).graph;
  const owner = world.cells.owner;
  const out = new Map<number, Set<number>>();
  const ownerOf = (node: number): number => {
    const c = g.centre[node] ?? -1;
    return c >= 0 ? owner[c]! : 0;
  };
  for (let a = 1; a < g.nodeCount; a++) {
    const oa = ownerOf(a);
    if (oa === 0) continue;
    for (const b of g.adj[a] ?? []) {
      const ob = ownerOf(b);
      if (ob === 0 || ob === oa) continue;
      if (!out.has(oa)) out.set(oa, new Set());
      out.get(oa)!.add(ob);
    }
  }
  return out;
}

/** Per nation (an overlord with its puppets): its army's men and its navy's weight in men (PLAN 4.6e2). */
export function strengths(world: World): Float64Array {
  const s = new Float64Array(world.nations.highWater + 1);
  const f = world.formations.cols;
  const nc = world.nations.cols;
  world.formations.forEach((id) => {
    // The army's men (an embarked one counts, PLAN 4.5a) and the navy's weight in men (PLAN 4.6e2: it lands armies and wins the sea).
    const n = f.nation[id]!;
    const o = nc.overlord[n]!;
    s[o !== 0 ? o : n]! += forceMen(world, id);
  });
  return s;
}

export function warsOf(world: World, n: number): number {
  return world.wars.list.filter((w) => w.sides[0].includes(n) || w.sides[1].includes(n)).length;
}

function exhaustionOf(world: World, n: number): number {
  let e = 0;
  for (const w of world.wars.list) {
    if (w.sides[0].includes(n)) e = Math.max(e, w.exhaustion[0]);
    if (w.sides[1].includes(n)) e = Math.max(e, w.exhaustion[1]);
  }
  return e;
}

/** How restless nation n is (PLAN 7.14): RESTLESS × its years since its last war ÷ RESTLESS_YEARS, at most RESTLESS. */
export function restlessOf(world: World, n: number): number {
  return RESTLESS * Math.min(1, (world.tick - (world.wars.lastFought.get(n) ?? 0)) / (24 * 365 * RESTLESS_YEARS));
}

/** Whether n holds a core (or claim) on a province whose centre t owns. */
function claimsOn(world: World, n: number, t: number): boolean {
  const g = navOf(world).graph;
  for (const p of world.provinces.provincesOf(n)) {
    const c = g.centre[p] ?? -1;
    if (c >= 0 && world.cells.owner[c] === t) return true;
  }
  return false;
}

/**
 * The strength of `n` with its allies, and the defence of a target `t` (PLAN 3.8e: a puppet is
 * defended by its overlord, whose strength holds the puppet's own, `strengths`): its realm, with the
 * allies and guarantors of both. `str` is `strengths(world)`.
 */
export function sides(world: World, str: Float64Array): { withAllies: (n: number) => number; defence: (t: number) => number } {
  const nc = world.nations.cols;
  const al = world.alliances;
  const withAllies = (n: number): number => {
    let s = str[n]!;
    for (const m of al.allianceOf(n)?.members ?? []) if (m !== n) s += ALLY_WEIGHT * str[m]!;
    return s;
  };
  const defence = (t: number): number => {
    const o = nc.overlord[t]!;
    let s = 0;
    for (const x of o !== 0 ? [o, t] : [t]) {
      s += withAllies(x);
      for (const g of al.guarantorsOf(x)) s += ALLY_WEIGHT * str[g]!;
    }
    return Math.max(1, s);
  };
  return { withAllies, defence };
}

/** A declaration's utility by its terms (the module's formula), and their sum `u`. */
export interface WarUtility {
  strength: number;
  opportunity: number;
  claim: number;
  exhaustion: number;
  wars: number;
  pariah: number;
  restless: number;
  u: number;
}

/**
 * The utility of `n`'s war on `t` (the module's formula): `attack` is `n`'s strength with its allies,
 * `defence` the target's (`sides`), `wars` how many wars `n` is in, `restless` its restlessness
 * (0 while at war). Summed in the formula's order.
 */
export function warUtility(world: World, n: number, t: number, attack: number, defence: number, wars: number, restless: number): WarUtility {
  const nc = world.nations.cols;
  const strength = (nc.aggression[n]! / 100) * (Math.min(RATIO_CAP, attack / defence) - 1);
  const opportunity = warsOf(world, t) > 0 ? OPPORTUNITY : 0;
  const claim = claimsOn(world, n, t) ? CLAIM : 0;
  const exhaustion = exhaustionOf(world, n) / 100;
  const warsTerm = WARS_PENALTY * wars;
  const pariah = PARIAH_WAR * relationHit(world, n, t);
  const u = strength + opportunity + claim - exhaustion - warsTerm + pariah + restless;
  return { strength, opportunity, claim, exhaustion, wars: warsTerm, pariah, restless, u };
}

/** The great powers: the GREAT_POWERS strongest living nations that are no puppet, by `str` (`strengths`), lowest id on ties. */
export function greatPowers(world: World, str: Float64Array): Set<number> {
  const nc = world.nations.cols;
  const living: number[] = [];
  world.nations.forEach((n) => {
    if (nc.living[n] === 1 && nc.overlord[n] === 0) living.push(n);
  });
  return new Set(living.sort((a, b) => str[b]! - str[a]! || a - b).slice(0, GREAT_POWERS));
}

/** Whether a and b fight on one side of a war against a great power (`greats`). */
function peerWarInCommon(world: World, a: number, b: number, greats: Set<number>): boolean {
  return world.wars.list.some((w) => w.sides.some((side, i) => side.includes(a) && side.includes(b) && w.sides[1 - i]!.some((m) => greats.has(m))));
}

/** Monthly (PLAN 7.53b): the great powers of an alliance but its first lose RIVAL_LOYALTY while they fight no great power together with it. */
export function rivalsApart(world: World, str: Float64Array, greats: Set<number>, blocs: ReadonlySet<number> = new Set()): void {
  if (!rivalsPart(world)) return;
  for (const a of [...world.alliances.list]) {
    const mine = a.members.filter((m) => greats.has(m));
    if (mine.length < 2) continue;
    // One of the two blocs (R67c, ADR-981) keeps its great powers.
    if (!BLOC_PROBE.lastingOff && blocs.has(a.id)) continue;
    const first = greats.has(a.leader) ? a.leader : mine.sort((x, y) => str[y]! - str[x]! || x - y)[0]!;
    const leaving: number[] = [];
    for (let i = 0; i < a.members.length; i++) {
      const m = a.members[i]!;
      if (m === first || !greats.has(m) || !aiRuns(world, m, AiLayer.diplomacy) || peerWarInCommon(world, m, first, greats)) continue;
      a.loyalty[i] = Math.max(0, a.loyalty[i]! - RIVAL_LOYALTY);
      if (a.loyalty[i]! < LEAVE_LOYALTY) leaving.push(m);
    }
    for (const m of leaving) leaveAlliance(world, m);
  }
}

/**
 * The nations `n` could land on (PLAN 7.82d, ADR-670): those holding a port on a water where a
 * transport group of `n`'s stands at a port of its own (`transportGroupsAtPort`), as `planLanding`
 * reaches them: the same water (`waterKeys`), not a sea ice closes, not one an enemy of `n` holds.
 * Ascending, `n` left out; none without such a group.
 */
export function seaTargets(world: World, n: number): number[] {
  const groups = transportGroupsAtPort(world, n);
  if (groups.length === 0) return [];
  const c = world.formations.cols;
  const keys = waterKeys(world, n);
  const lift = new Set(groups.map((g) => keyAt(world, keys, c.x[g.fleet]!, c.y[g.fleet]!)));
  const z = seaOf(world);
  const water = portSeaOf(world);
  const ctl = world.cells.controller;
  const out = new Set<number>();
  world.ports.forEach((p, i) => {
    const holder = ctl[p.cell]!;
    const at = water[i]!;
    if (holder === 0 || holder === n || out.has(holder) || at < 0) return;
    const zone = z.zoneOf[at]!;
    if (zone === 0 || z.closed[zone] === 1 || !lift.has(keys[zone]!)) return;
    const sea = seaHolder(world, zone);
    if (sea !== 0 && world.wars.atWar(sea, n)) return;
    out.add(holder);
  });
  return [...out].sort((a, b) => a - b);
}

/**
 * Whom `n` declares on this turn, or 0 (the module's formula): the land neighbour (`neighbours`,
 * ascending) of the highest utility over DECLARE_AT that it may declare on (`whyNotWar`; PLAN 3.8:
 * not a puppet of its ally either); with none, the nation across the sea it could land on
 * (`seaTargets`) of the highest utility over DECLARE_AT (PLAN 7.82d, ADR-670). Read before (seed 845,
 * years 8–26, `tools/diag/warChoice.ts`): the United States, its puppet Canada and Denmark's Greenland
 * had no land neighbour over the bar for 19 years, and held their cells to 2 % at peace; the Soviet
 * Union, its transports at its ports on their water, scored 1.0–1.7 on them and had no land target
 * over the bar on 77–84 of its turns. Land wars come first: the sea's targets only on a turn none is.
 * `attack` is `n`'s strength with its allies, `defence` a target's (`sides`).
 */
export function warTarget(world: World, n: number, neighbours: readonly number[], attack: number, defence: (t: number) => number, wars: number, restless: number, blocs: ReadonlySet<number> = new Set()): number {
  const pick = (among: readonly number[], skip?: ReadonlySet<number>): number => {
    let best = 0;
    let bestU = DECLARE_AT;
    for (const t of among) {
      if (skip?.has(t) || whyNotWar(world, n, t) !== Refusal.None) continue;
      // Deterrence (R67d, ADR-981): no war between the two blocs.
      if (!BLOC_PROBE.deterrenceOff && deterred(world, n, t, blocs)) continue;
      const u = warUtility(world, n, t, attack, defence(t), wars, restless).u;
      if (u > bestU) [bestU, best] = [u, t];
    }
    return best;
  };
  return pick(neighbours) || pick(seaTargets(world, n), new Set(neighbours));
}

/**
 * The blocs (R67c-d, ADR-981; the user's choices of 2026-11-12: two only, in the historical track's games only): of
 * the alliances led by a nation with an
 * assured second strike (`blocLeader`), the two strongest (their members' men, `strengths`; the lower id on ties).
 * Their ids; one or none while fewer are so led.
 */
export function blocsOf(world: World, str: Float64Array): Set<number> {
  const led = world.alliances.list.filter((a) => blocLeader(world, a.leader));
  const men = (a: (typeof led)[number]): number => a.members.reduce((t, m) => t + (str[m] ?? 0), 0);
  return new Set(led.sort((a, b) => men(b) - men(a) || a.id - b.id).slice(0, 2).map((a) => a.id));
}

/**
 * Whether a war of `n` on `t` would set the two blocs against each other (R67d, ADR-981): `n` of one, and of `t`'s
 * side (`t`, the overlord that would lead its defence, their alliances and guarantors: `declareWar`'s callers) one of
 * the other.
 */
export function deterred(world: World, n: number, t: number, blocs: ReadonlySet<number>): boolean {
  if (blocs.size < 2) return false;
  const al = world.alliances;
  const mine = al.allianceOf(n);
  if (!mine || !blocs.has(mine.id)) return false;
  const d = world.nations.cols.overlord[t] || t;
  const other = (x: number): boolean => {
    const a = al.allianceOf(x);
    return a !== undefined && a.id !== mine.id && blocs.has(a.id);
  };
  for (const x of [t, d]) if (other(x) || al.guarantorsOf(x).some(other)) return true;
  return false;
}

/** The years of the historical focus after the track (R74e-f, R75a; `focusAfterTrack`). */
export const FOCUS_YEARS = 3;
/** The share of its declarations a nation makes on the focus's second day, rising from it to all at its end. */
export const FOCUS_FLOOR = 0.4;

/**
 * The historical focus after the track (ROADMAP R75a, as Hearts of Iron IV's; critic run 65, R65-N2 and N3): the
 * share of its usual declarations the AI makes, 1 in a game that has no track or has not ended it. None on the day the
 * track ends (R65-N2: NATO's war on Yugoslavia in the end hour), then FOCUS_FLOOR, rising to 1 over FOCUS_YEARS: the
 * wars 38 years of the track held back come by degrees, not at once (R65-N3). While it is under 1 the blocs are closed
 * (`strategicAi`): no nation joins or founds an alliance a bloc's leader leads, so the world keeps the alignment the
 * track gave it (R65-N2: India and Austria in the blocs within the hour).
 */
export function focusAfterTrack(world: World): number {
  const t = world.track;
  if (!t?.ended || !Number.isFinite(t.endedAt)) return 1;
  const since = world.tick - t.endedAt;
  if (since < 24) return 0;
  return Math.min(1, FOCUS_FLOOR + ((1 - FOCUS_FLOOR) * since) / (FOCUS_YEARS * 8760));
}

/** Switches for measurement (R67c-d): the blocs' rules off. Never set in the game. */
export const BLOC_PROBE: { lastingOff?: boolean; deterrenceOff?: boolean } = {};

export function strategicAi(world: World): void {
  // The historical track's wars, peaces and pacts are its timeline's (ROADMAP R62e).
  if (!world.settings.aiEnabled || !isDayStart(world.tick) || world.steered) return;
  const day = world.tick / 24;
  const nc = world.nations.cols;
  // Stalemates end (all wars, daily).
  for (const w of [...world.wars.list]) {
    if (w.fightToDeath[0] || w.fightToDeath[1]) continue;
    if ((world.tick - w.startTick) / 24 < STALEMATE_DAYS || Math.abs(w.score) >= STALEMATE_SCORE) continue;
    if (w.exhaustion[0] > STALEMATE_EXHAUSTION && w.exhaustion[1] > STALEMATE_EXHAUSTION) makePeace(world, w);
  }
  const actors: number[] = [];
  world.nations.forEach((n) => {
    // The diplomacy's layer of the AI (ADR-759).
    if (nc.living[n] === 1 && aiRuns(world, n, AiLayer.diplomacy) && nc.overlord[n] === 0 && (day + n) % STAGGER === 0) actors.push(n);
  });
  if (actors.length === 0 && !isMonthStart(world.startDay, world.tick)) return;
  const nb = neighbourMap(world);
  const str = strengths(world);
  const al = world.alliances;
  const { withAllies, defence } = sides(world, str);
  // The two blocs (R67c-d): in a game of the historical track only (the user's decision of 2026-11-12, ADR-981: in
  // every game the two blocs, never at war with each other, took the rest of the world: one nation over 40 % of the
  // world's income on 5 of the sweep's 10 seeds), once it has ended or been left; none before any nation holds an arsenal.
  const blocs = world.track?.ended && world.warheads.size > 0 ? blocsOf(world, str) : new Set<number>();
  // The great powers, once rivals part (PLAN 7.53b; none before: no join is refused for them).
  const greats = rivalsPart(world) ? greatPowers(world, str) : new Set<number>();
  // The historical focus (R75a): declarations eased in, the blocs closed while it lasts.
  const focus = focusAfterTrack(world);
  const open = (a: { leader: number }): boolean => focus >= 1 || !blocLeader(world, a.leader);
  for (const n of actors) {
    const neighbours = [...(nb.get(n) ?? [])].sort((a, b) => a - b);
    // War.
    const wars = warsOf(world, n);
    if (wars < MAX_WARS && nc.aggression[n]! >= PACIFIST_BELOW && nc.gold[n]! >= 0 && nc.bankrupt[n] !== 1) {
      const best = warTarget(world, n, neighbours, withAllies(n), defence, wars, wars === 0 ? restlessOf(world, n) : 0, blocs);
      if (best !== 0 && hashToUnit(hash32(world.seed, day, n, SALT_WAR)) < (focus * DECLARE_P * nc.aggression[n]!) / 100) declareWar(world, n, best);
    }
    // Alliances against a threat.
    if (!al.allianceOf(n)) {
      const threat = neighbours.find((t) => nc.aggression[t]! >= THREAT_AGGRESSION && str[t]! > THREAT_RATIO * Math.max(1, str[n]!) && !world.wars.atWar(n, t));
      if (threat !== undefined && hashToUnit(hash32(world.seed, day, n, SALT_ALLY)) < ALLY_P) {
        // A great power does not join one that holds another (PLAN 7.53b: rivals apart).
        const options = neighbours.map((m) => al.allianceOf(m)).filter((a) => a && open(a) && !a.members.includes(threat) && canJoin(world, n, a) && !(greats.has(n) && a.members.some((m) => greats.has(m))));
        const join = options.sort((a, b) => b!.members.reduce((s, m) => s + str[m]!, 0) - a!.members.reduce((s, m) => s + str[m]!, 0) || a!.id - b!.id)[0];
        if (join && al.join(n, join)) world.out.emit(world.tick, EventKind.AllianceJoined, n, join.id, NaN, NaN);
        else {
          const partner = [...(nb.get(threat) ?? [])].sort((a, b) => a - b).find((m) => m !== n && nc.living[m] === 1 && !al.allianceOf(m) && nc.overlord[m] === 0 && !(greats.has(n) && greats.has(m)) && noWarAmong(world, [n, m]) && open({ leader: n }));
          const a = partner !== undefined ? al.create(n, [partner], 'alliance.defensive', 40) : null;
          if (a) for (const m of a.members) world.out.emit(world.tick, EventKind.AllianceJoined, m, a.id, NaN, NaN);
        }
      }
    }
  }
  if (isMonthStart(world.startDay, world.tick)) {
    coalition(world, nb, str, greats, open);
    rivalsApart(world, str, greats, blocs);
    if (blocs.size === 2) blocAid(world, blocs);
  }
}

/** The share of its income a bloc's leader gives a month to each war it aids (R67e, ADR-990). */
export const AID_SHARE = 0.05;
/** The most wars a bloc's leader aids in a month. */
export const AID_WARS = 3;
/** The template of the volunteers, raised from the giver's men and gold for the aided. */
const VOLUNTEERS = 'infantry_div';

/**
 * Rivalry by proxies (R67e, ADR-990; the user's choice of 2026-11-12): monthly, in a war where a side of nations of
 * neither bloc faces a member of one, the other bloc's leader aids that side's first nation (its leader, else the
 * first free one): AID_SHARE of its income in gold, and while the side is losing (its score) a division of
 * volunteers, its men and price the giver's, queued for the aided. At most AID_WARS wars a giver a month, by war id; a
 * giver at war with the aided, or not living, gives nothing. A `BlocAid` row each month it gives.
 */
export function blocAid(world: World, blocs: ReadonlySet<number>): void {
  const nc = world.nations.cols;
  const al = world.alliances;
  const blocOf = (n: number): number => {
    const a = al.allianceOf(n);
    return a && blocs.has(a.id) ? a.id : 0;
  };
  const leader = new Map([...blocs].map((id) => [id, al.list.find((a) => a.id === id)!.leader]));
  const given = new Map<number, number>();
  for (const war of [...world.wars.list].sort((a, b) => a.id - b.id)) {
    for (const s of [0, 1] as const) {
      const [mine, theirs] = [war.sides[s], war.sides[1 - s]!];
      const foe = theirs.map(blocOf).find((b) => b !== 0) ?? 0;
      if (foe === 0 || mine.some((n) => blocOf(n) !== 0)) continue;
      const aided = mine.find((n) => nc.living[n] === 1 && nc.overlord[n] === 0);
      const giver = leader.get([...blocs].find((b) => b !== foe)!)!;
      if (aided === undefined || nc.living[giver] !== 1 || world.wars.atWar(giver, aided) || (given.get(giver) ?? 0) >= AID_WARS) continue;
      const gold = Math.min(AID_SHARE * Math.max(0, nc.income[giver]!), Math.max(0, nc.gold[giver]!));
      if (gold <= 0) continue;
      given.set(giver, (given.get(giver) ?? 0) + 1);
      nc.gold[giver] = nc.gold[giver]! - gold;
      nc.gold[aided] = nc.gold[aided]! + gold;
      const losing = (s === ATTACKERS ? war.score : -war.score) < 0;
      if (losing) volunteers(world, giver, aided);
      world.out.emit(world.tick, EventKind.BlocAid, giver, aided, nc.capitalX[aided]!, nc.capitalY[aided]!);
    }
  }
}

/** A division of VOLUNTEERS for `aided`, its men and gold `giver`'s, queued as a levy is; false when it cannot pay. */
function volunteers(world: World, giver: number, aided: number): boolean {
  const rules = world.rules;
  // By the track's ids (aid comes only in its games).
  const t = world.track?.templates.get(VOLUNTEERS) ?? -1;
  const rule = t >= 0 ? rules!.templates[t]! : undefined;
  const nc = world.nations.cols;
  if (!rule || nc.manpower[giver]! < rule.manpower || nc.gold[giver]! < rule.gold) return false;
  nc.manpower[giver] = nc.manpower[giver]! - rule.manpower;
  nc.gold[giver] = nc.gold[giver]! - rule.gold;
  // Queued for the aided with its own men put back: the giver's men stand in for them.
  nc.manpower[aided] = nc.manpower[aided]! + rule.manpower;
  return levyFormation(world, aided, t) !== 0;
}

/** Monthly: unaligned neighbours of a hegemon (> HEGEMON_SHARE of world income) ally; and of the worst nuclear pariah (PLAN 6.5b). */
function coalition(world: World, nb: Map<number, Set<number>>, str: Float64Array, greats: Set<number>, open: (a: { leader: number }) => boolean): void {
  const nc = world.nations.cols;
  let total = 0;
  let top = 0;
  world.nations.forEach((n) => {
    if (nc.living[n] !== 1) return;
    total += Math.max(0, nc.income[n]!);
    if (top === 0 || nc.income[n]! > nc.income[top]!) top = n;
  });
  const hegemon = top !== 0 && total > 0 && nc.income[top]! / total > HEGEMON_SHARE ? top : 0;
  if (hegemon !== 0) coalitionAbout(world, nb, str, greats, open, hegemon);
  const pariah = worstPariah(world);
  if (pariah !== 0 && pariah !== hegemon) coalitionAbout(world, nb, str, greats, open, pariah, 'alliance.pariah');
}

/**
 * The unaligned neighbours of `top` form or join an alliance named `nameKey`: a coalition about a
 * hegemon, the first of its name; a league about a pariah (PLAN 6.5b), one that does not have it.
 */
function coalitionAbout(world: World, nb: Map<number, Set<number>>, str: Float64Array, greats: Set<number>, open: (a: { leader: number }) => boolean, top: number, nameKey = 'alliance.coalition'): void {
  const nc = world.nations.cols;
  const al = world.alliances;
  const members = [...(nb.get(top) ?? [])]
    .filter((m) => nc.living[m] === 1 && nc.overlord[m] !== top && nc.overlord[m] === 0 && !al.allied(m, top))
    .sort((a, b) => str[b]! - str[a]! || a - b);
  const existing = al.list.find((a) => a.nameKey === nameKey && (nameKey === 'alliance.coalition' || !a.members.includes(top)));
  for (const m of members) {
    if (al.allianceOf(m)) continue;
    if (existing) {
      // A great power does not join one that holds another (PLAN 7.53b).
      if (greats.has(m) && existing.members.some((x) => greats.has(x))) continue;
      if (open(existing) && canJoin(world, m, existing) && al.join(m, existing)) world.out.emit(world.tick, EventKind.AllianceJoined, m, existing.id, NaN, NaN);
    }
  }
  if (!existing) {
    // One great power at most among its founders (PLAN 7.53b), the strongest.
    let great = false;
    const free = members.filter((m) => {
      if (al.allianceOf(m)) return false;
      if (!greats.has(m)) return true;
      if (great) return false;
      return (great = true);
    });
    if (free.length >= 2 && noWarAmong(world, free) && open({ leader: free[0]! })) {
      const a = al.create(free[0]!, free.slice(1), nameKey, 50);
      if (a) for (const m of a.members) world.out.emit(world.tick, EventKind.AllianceJoined, m, a.id, NaN, NaN);
    }
  }
}
