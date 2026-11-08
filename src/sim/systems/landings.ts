/**
 * The player's landings (ROADMAP R33, ADR-829, ADR-830): a landing over the sea is one object, its target
 * (the cell ordered, the water and land `landingOf` finds for it), the port of its nation where it gathers,
 * its transport groups, its divisions (each with the hour it joined), one state and its escort. It is the
 * player's alone: the AI's landings (`invasion.ts`, `tryLanding` with `via`) do not use it.
 *
 * - A player's order over the sea (`seaConvoy` in movement.ts, `chooseTransports` here) joins a landing
 *   gathering for the same landing (`sameLandingAs`) at a port of the division's land, or makes one: at the
 *   port of its land nearest it where a free transport group stands, else with a group called to its
 *   land's nearest port (`callTransports`), else, as a later voyage, a landing for the same place that has
 *   sailed. The division marches to the port and waits there, ashore.
 * - Hourly (`landingSystem`): a gathering landing whose transports all stand at its port, whose divisions
 *   at the port are in no fight, and which waits for none still marching (those that joined within
 *   SAME_CLICK_HOURS of its first, however far; a later one only within LATE_WAIT_HOURS of its march) and
 *   for no escort, boards those at the port and sails, in the one hour: "loading" is that hour, not a
 *   state. It sails with room for all at the port: short, it takes a group free at its port or calls one
 *   and waits. Those that do not fit (none to be had anywhere, or still marching) go on the next voyage:
 *   the transports come back for them. A landing
 *   is over when none of its divisions is left; it is told why when it cannot go on (its port shut or lost,
 *   its target a neutral's, no transports, no way over the sea).
 * - An hour's orders edit it as a batch (`landingOrders`, before they are applied): all of a landing's
 *   divisions aboard at sea ordered by one click redirect it (to another landing gathering for that place:
 *   its transports sail to that one's port and join it, R43-B1's recall; else to the new water), or, to a
 *   place not over the sea, send it back to its own port, where they go ashore and march there (a cancel);
 *   to the sea, each is refused (`OpenSea`) and it keeps its course. Some of those aboard at sea: refused,
 *   `AtSea`. A division ashore (gathering, or bound for the next
 *   voyage) ordered elsewhere leaves the landing, told `LeftLanding` where others stay (`tellLandingsLeft`);
 *   refused, it is back in it as it was. An order for the landing it has changes nothing.
 */
import { EventKind, RejectReason } from '../../shared/events';
import type { LandingMark, SeaHint } from '../../shared/protocol';
import { isLand } from '../../shared/terrain';
import { octileKm } from '../nav/grid';
import { navOf, PlayerOrderKind, portSeaOf, type World } from '../world';
import { callCandidates, callTransports, carrying, landingOf, near, neutralLanding, SAME_LANDING_CELLS, TRANSPORT_MEN, transportRoom, transportsPort, tryLanding } from './amphibious';
import { portShut } from './bombing';
import { marchHoursLeft, marchKmPerHour, orderMove, overSeaFrom, snapTarget } from './movement';
import { AT_PORT_CELLS, sailHome } from './navalCombat';
import { orderSail, sailHours, sailHoursFrom, sailHoursLeft } from './sail';

/** A landing's state: gathering at its port, sailing for its water, or sailing back to its port (a cancel). */
export const LandingState = { gathering: 0, sailing: 1, returning: 2 } as const;
export type LandingStateKind = (typeof LandingState)[keyof typeof LandingState];

export interface Landing {
  id: number;
  nation: number;
  /** The cell the order was for, and the landing's water and land (`landingOf`). */
  target: number;
  water: number;
  land: number;
  /** Its port, index in `world.ports`. */
  port: number;
  state: LandingStateKind;
  /** Its transport groups, ascending. */
  fleets: number[];
  /** Its divisions, by id: the tick each joined. */
  divisions: Map<number, number>;
  /** Returning: the cell its divisions march to once ashore at its port. */
  then: number;
  /** The tick of its last order (a division joined, or it was redirected): it sails no sooner than an hour on. */
  ordered: number;
  /**
   * The tick it was first ready (gathering, its groups at its port, a division there): the wait for those still
   * marching counts from it (`waited`, ROADMAP R44a); -1 until then.
   */
  ready: number;
}

/** Hours within which a division joined with a landing's first (its click, `waited`): a day. */
export const SAME_CLICK_HOURS = 24;
/** The longest march, in hours, a landing waits for one that joined later (`waited`): a week. */
export const LATE_WAIT_HOURS = 24 * 7;
/**
 * The longest a landing ready to sail waits for those still marching (`waited`, ROADMAP R44a, ADR-846): six days,
 * a day inside `slowClick`'s week over a click's best way for the estimates' error.
 */
export const READY_WAIT_HOURS = 24 * 6;
/**
 * The longest a landing waits for a sibling of its click to be ready (`siblingWait`): a month (ROADMAP R41, ADR-836:
 * with R38d's gate gone a division from a nearer port is ready weeks before its mate walking to the far one;
 * critic run 47's `fresh2`: a mate two months off is not waited for).
 */
export const SIBLING_WAIT_HOURS = 24 * 30;
/**
 * How much later than a landing a sibling may land and not be waited for (`siblingWait`): half a day, so that with the
 * estimates' error of an hour or two they land within a day (ROADMAP R43a: 40 of run 47's grid 25 hours apart at a
 * day's slack).
 */
const SIBLING_SLACK_HOURS = 12;

const cellOfPlace = (world: World, id: number): number => Math.floor(world.formations.cols.y[id]!) * world.cells.w + Math.floor(world.formations.cols.x[id]!);
const cellAt = (world: World, x: number, y: number): number => Math.floor(y) * world.cells.w + Math.floor(x);
const pointOf = (world: World, k: number): [number, number] => [(k % world.cells.w) + 0.5, Math.floor(k / world.cells.w) + 0.5];

/** The landing division `id` is in, if any. */
export function landingOfDivision(world: World, id: number): Landing | undefined {
  for (const l of world.landings.values()) if (l.divisions.has(id)) return l;
  return undefined;
}

/** The landing transport group `fleet` is one of, if any. */
export function landingOfFleet(world: World, fleet: number): Landing | undefined {
  for (const l of world.landings.values()) if (l.fleets.includes(fleet)) return l;
  return undefined;
}

/** Whether transport group `fleet` is a landing's. */
export const inLanding = (world: World, fleet: number): boolean => landingOfFleet(world, fleet) !== undefined;

/** Whether group `fleet` is a landing's that is not sailing for its water: those aboard do not land from it (`amphibiousSystem`). */
export function heldByLanding(world: World, fleet: number): boolean {
  const l = landingOfFleet(world, fleet);
  return l !== undefined && l.state !== LandingState.sailing;
}

/** Whether division `id` of landing `l` is aboard one of its transports. */
const isAboard = (world: World, l: Landing, id: number): boolean => {
  const e = world.embarked.get(id);
  return e !== undefined && l.fleets.includes(e.fleet);
};

/** The divisions of landing `l` aboard its transports, ascending. */
const aboardOf = (world: World, l: Landing): number[] => [...l.divisions.keys()].filter((id) => isAboard(world, l, id)).sort((a, b) => a - b);

/** Whether group `fleet` stands at landing `l`'s port: not under way, in no battle, its port's water within AT_PORT_CELLS. */
function atPort(world: World, l: Landing, fleet: number): boolean {
  const c = world.formations.cols;
  if (!world.formations.has(fleet) || c.moving[fleet] === 1 || c.engaged[fleet] === 1) return false;
  return near(world, cellOfPlace(world, fleet), portSeaOf(world)[l.port]!, world.atSize(AT_PORT_CELLS));
}

/** Whether division `id` stands at landing `l`'s port (its cell or its water within AT_PORT_CELLS). */
function divisionAtPort(world: World, l: Landing, id: number): boolean {
  const r = world.atSize(AT_PORT_CELLS);
  const here = cellOfPlace(world, id);
  return near(world, here, world.ports[l.port]!.cell, r) || near(world, here, portSeaOf(world)[l.port]!, r);
}

/**
 * Whether an order to (`x`, `y`) is for landing `l` (ROADMAP R23b, R24b, R25a): the click within
 * SAME_LANDING_CELLS of the cell it was ordered for, of the same holder; or the click's landing within
 * SAME_LANDING_CELLS of its water and land, the land of the same holder.
 */
export function sameLandingAs(world: World, l: Landing, x: number, y: number): boolean {
  const { w, h } = world.cells;
  const [tx, ty] = [Math.floor(x), Math.floor(y)];
  if (tx < 0 || ty < 0 || tx >= w || ty >= h) return false;
  const ctl = world.cells.controller;
  const click = ty * w + tx;
  const r = world.atSize(SAME_LANDING_CELLS);
  if (near(world, click, l.target, r) && ctl[click] === ctl[l.target]) return true;
  const o = landingOf(world, click);
  return o !== null && near(world, o.water, l.water, r) && near(world, o.land, l.land, r) && ctl[o.land] === ctl[l.land];
}

/** Whether port `i` serves a division of `nation` standing on `here`: its nation's, on its land, with water, not shut. */
function ownPort(world: World, nation: number, here: number, i: number): boolean {
  const comp = navOf(world).grid.component;
  const p = world.ports[i]!;
  return portSeaOf(world)[i]! >= 0 && world.cells.controller[p.cell] === nation && comp[p.cell] === comp[here] && !portShut(world, i);
}

/** Men of landing `l`'s divisions, all of them, and of its transports' room. */
const menOf = (world: World, l: Landing): number => [...l.divisions.keys()].reduce((s, id) => s + (world.formations.has(id) ? world.formations.cols.strength[id]! : 0), 0);
const roomOf = (world: World, l: Landing): number => l.fleets.reduce((s, o) => s + transportRoom(world, o), 0);

/** Whether group `o` of `nation` is free for a landing: standing, in no battle, no landing's, carrying no one, with room for `men`. */
function freeGroup(world: World, o: number, nation: number, men: number): boolean {
  const c = world.formations.cols;
  return world.isFleet(o) && c.nation[o] === nation && c.moving[o] !== 1 && c.engaged[o] !== 1 && !inLanding(world, o) && !carrying(world, o) && transportRoom(world, o) >= men;
}

/** Of `nation`'s groups free for `men`, the first standing at port `i`'s water, lowest id; 0 for none. */
function freeAtPort(world: World, nation: number, men: number, i: number): number {
  const water = portSeaOf(world)[i]!;
  let best = 0;
  world.formations.forEach((o) => {
    if (best === 0 && freeGroup(world, o, nation, men) && near(world, cellOfPlace(world, o), water, world.atSize(AT_PORT_CELLS))) best = o;
  });
  return best;
}

/**
 * Of the groups this hour's orders freed (`World.freed`), the first by id of `nation`'s with room for `men`,
 * in no landing and carrying no one, whose port is one of the land at cell `here`: it and its port; null for none.
 */
function freedGroup(world: World, nation: number, men: number, here: number): { port: number; fleet: number } | null {
  const c = world.formations.cols;
  for (const [o, port] of [...world.freed].sort((a, b) => a[0] - b[0])) {
    if (!world.formations.has(o) || c.nation[o] !== nation || c.engaged[o] === 1 || inLanding(world, o) || carrying(world, o) || transportRoom(world, o) < men) continue;
    if (ownPort(world, nation, here, port)) return { port, fleet: o };
  }
  return null;
}

/** What a player's order over the sea of division `id` to cell `target` takes (`chooseTransports`). */
export interface LandingChoice {
  /** The landing it joins; absent: a new one at `port` with `fleet`. */
  join?: Landing;
  port: number;
  /** A group to add (new landing: its group), 0 for none. */
  fleet: number;
}

/**
 * The transports for a player's division `id` ordered over the sea to cell `target` (see the head of the
 * file), or null for none. Read-only but for a group called (`callTransports`), which sails at once.
 */
export function chooseTransports(world: World, id: number, target: number): LandingChoice | null {
  const f = world.formations;
  const c = f.cols;
  const nation = c.nation[id]!;
  const men = c.strength[id]!;
  const here = cellOfPlace(world, id);
  const [tx, ty] = pointOf(world, target);
  const mine = [...world.landings.values()].filter((l) => l.nation === nation && ownPort(world, nation, here, l.port) && sameLandingAs(world, l, tx, ty)).sort((a, b) => a.id - b.id);
  const w = world.cells.w;
  const dist = (k: number): number => {
    let dx = Math.abs((k % w) - (here % w));
    if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
    const dy = Math.floor(k / w) - Math.floor(here / w);
    return dx * dx + dy * dy;
  };
  // Its land's nearest port, and whether port `i` is another: a call there is judged by hours (`callSooner`; R41).
  const port = transportsPort(world, id, false);
  const far = (i: number): boolean => port >= 0 && i !== port;
  // A landing gathering for that place: it joins (one click lands together, R37c), the one at its land's nearest port
  // first; with no room left, a group at its port or called there. Where its land's nearest port lands it
  // SPLIT_SOONER_HOURS sooner by hours (`callSooner`) and none gathers there, it makes a landing of its own there, a
  // sibling of the click's, which the two wait for (`siblingWait`, within a month) to land together (ROADMAP R43a;
  // critic run 50, R50-N1: three to Shanghai waited 35 days at Tokyo for one walking from western Honshu; the user's
  // choice of 2026-11-06, of a bound or its own port).
  const gathering = mine.filter((l) => l.state === LandingState.gathering);
  const atOwn = gathering.some((l) => l.port === port);
  for (const l of [...gathering.filter((g) => g.port === port), ...gathering.filter((g) => g.port !== port)]) {
    if (!atOwn && far(l.port) && l.fleets.length > 0 && callSooner(world, id, target, port, { port: l.port, fleet: l.fleets[0]! }, SPLIT_SOONER_HOURS)) {
      const o = freeAtPort(world, nation, men, port) || callTransports(world, id, port);
      if (o !== 0) return { port, fleet: o };
    }
    if (roomOf(world, l) - menOf(world, l) >= men) return { join: l, port: l.port, fleet: 0 };
    const o = freedGroup(world, nation, men, here)?.fleet || freeAtPort(world, nation, men, l.port) || callTransports(world, id, l.port);
    if (o !== 0) return { join: l, port: l.port, fleet: o };
    if (l.fleets.some((g) => transportRoom(world, g) >= men)) return { join: l, port: l.port, fleet: 0 };
  }
  // A group this hour's orders freed from its landing (R37a): the landing it makes takes it, at that port; at a port
  // far beyond its land's nearest, as a free group there (R38d, R39d): a group called to the nearer where sooner
  // (ADR-835; the checker's `farPort`, 19207: 366 re-sent from Hiroshima walked 24 days to the group it freed at Tokyo).
  const fr = freedGroup(world, nation, men, here);
  if (fr) {
    if (far(fr.port) && callSooner(world, id, target, port, fr)) {
      const o = callTransports(world, id, port);
      if (o !== 0) return { port, fleet: o };
    }
    return fr;
  }
  // A free group at a port of its land, the port nearest it.
  let best: { port: number; fleet: number } | null = null;
  let bd = Infinity;
  world.ports.forEach((p, i) => {
    if (!ownPort(world, nation, here, i)) return;
    const d = dist(p.cell);
    if (d >= bd) return;
    const o = freeAtPort(world, nation, men, i);
    if (o !== 0) [bd, best] = [d, { port: i, fleet: o }];
  });
  // A group called to its land's nearest port: also where the free one stands far beyond it (ROADMAP R38d; critic
  // run 46, R46-N3: a 40-day walk within Honshu to Sasebo's group, not a call to Tokyo): a ship sails it sooner.
  const found = best as { port: number; fleet: number } | null;
  if (found && far(found.port) && callSooner(world, id, target, port, found)) {
    const o = callTransports(world, id, port);
    if (o !== 0) return { port, fleet: o };
  }
  if (found) return found;
  if (port >= 0) {
    const o = callTransports(world, id, port);
    if (o !== 0) return { port, fleet: o };
  }
  // A landing for that place that has sailed: its next voyage.
  for (const l of mine) if (l.fleets.some((g) => transportRoom(world, g) >= men)) return { join: l, port: l.port, fleet: 0 };
  return null;
}

/** How many hours sooner a call must land than the free group far off, to be taken (`callSooner`): a day. */
const CALL_SOONER_HOURS = 24;
/**
 * How many hours sooner its land's nearest port must land a division than the click's gathering landing at another
 * port, for it to make a landing of its own there (ROADMAP R43a): a week. A landing more spends a group, so a day is
 * not worth one.
 */
export const SPLIT_SOONER_HOURS = 24 * 7;

/**
 * Whether a group called to port `near` lands division `id` at `target` over CALL_SOONER_HOURS sooner than the
 * free group `far.fleet` at port `far.port` (ROADMAP R39d; critic run 47, R47-N3: R38d judged by straight cells,
 * and a group called from Sevastopol to Leningrad for Cyprus shuttled at the Straits for nine days). By the near
 * way: the march to `near` or the called group's sail there, the later, and the voyage from `near`; by the far way:
 * the march to `far.port` and the voyage from it. Marches by the shortest way over the ground (`octileKm`) at its
 * pace; voyages by `sailHoursFrom`. No group that can reach `near`, or no voyage from it: false.
 */
function callSooner(world: World, id: number, target: number, near: number, far: { port: number; fleet: number }, sooner = CALL_SOONER_HOURS): boolean {
  const c = world.formations.cols;
  const rule = world.rules?.templates[c.template[id]!];
  const l = landingOf(world, target);
  if (!rule || !l) return false;
  const kmh = marchKmPerHour(world, id, rule);
  if (!(kmh > 0)) return false;
  const grid = navOf(world).grid;
  const here = cellOfPlace(world, id);
  const water = portSeaOf(world);
  const w = world.cells.w;
  const [x, y] = [(l.water % w) + 0.5, Math.floor(l.water / w) + 0.5];
  const nearWater = water[near]!;
  const [nx, ny] = [(nearWater % w) + 0.5, Math.floor(nearWater / w) + 0.5];
  // The group the call sends: the first of its tries with a way there (`callTransports`).
  const ship = callCandidates(world, id, near).find((o) => Number.isFinite(sailHours(world, o, nx, ny)));
  if (ship === undefined) return false;
  const byNear = Math.max(octileKm(grid, here, world.ports[near]!.cell) / kmh, sailHours(world, ship, nx, ny)) + sailHoursFrom(world, ship, nearWater, x, y);
  const byFar = octileKm(grid, here, world.ports[far.port]!.cell) / kmh + sailHoursFrom(world, far.fleet, water[far.port]!, x, y);
  return byNear + sooner < byFar;
}

/** Division `id` joins landing `choice.join`, or a new one for cell `target` (ROADMAP R33b); its landing. */
export function bindDivision(world: World, id: number, target: number, choice: LandingChoice): Landing {
  const c = world.formations.cols;
  let l = choice.join;
  if (!l) {
    const o = landingOf(world, target)!;
    l = { id: world.nextLanding++, nation: c.nation[id]!, target, water: o.water, land: o.land, port: choice.port, state: LandingState.gathering, fleets: [], divisions: new Map(), then: -1, ordered: world.tick, ready: -1 };
    world.landings.set(l.id, l);
  }
  if (choice.fleet !== 0 && !l.fleets.includes(choice.fleet)) {
    l.fleets.push(choice.fleet);
    l.fleets.sort((a, b) => a - b);
  }
  for (const o of l.fleets) {
    world.playerOrders.set(o, { kind: PlayerOrderKind.called, until: 0, through: false });
    world.station.delete(o);
  }
  // Moved whole from another gathering landing: the hour it joined that one (R33d), so it is waited for as then.
  const was = choice.join ? world.rejoined.get(id) : undefined;
  l.divisions.set(id, was !== undefined ? Math.min(was, world.tick) : world.tick);
  l.ordered = world.tick;
  return l;
}

/**
 * Ends landing `l`: its transports carrying no one are the AI's again; those still in it are told `why` (none: not
 * told). Those marching to its port stop where they stand (ROADMAP R43e; critic run 50, R50-N5: 20845's two, told
 * their transports were sunk and the landing over, walked on to Hamburg for six days), as at a peace (R21a): their
 * order is over, and the AI has them from the next hour (ADR-759).
 */
function endLanding(world: World, l: Landing, why = 0): void {
  const c = world.formations.cols;
  for (const id of [...l.divisions.keys()].sort((a, b) => a - b)) {
    if (!world.formations.has(id)) continue;
    if (c.moving[id] === 1 && !world.embarked.has(id)) {
      c.moving[id] = 0;
      c.home[id] = 0;
      world.paths.delete(id);
    }
    // Aboard at its port, or standing off it: ashore there (it never left; its organisation as it was).
    const e = world.embarked.get(id);
    if (e !== undefined && l.fleets.includes(e.fleet) && l.state !== LandingState.sailing) {
      world.embarked.delete(id);
      [c.x[id], c.y[id]] = world.cellPoint(world.ports[l.port]!.cell);
    }
    if (why !== 0) world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, why, NaN);
  }
  for (const o of l.fleets) if (world.formations.has(o) && !carrying(world, o)) world.playerOrders.delete(o);
  world.landings.delete(l.id);
}

/**
 * Division `id` leaves its landing, if any (it landed, or went ashore elsewhere); the landing ends with its last.
 * A group `id` (destroyed) leaves its landing at once (ROADMAP R33d: listed till the next hour, its id could be
 * another's); a landing left with none is told at its hour (`gather`, `landingSystem`).
 */
export function leaveLanding(world: World, id: number): void {
  const g = landingOfFleet(world, id);
  if (g) {
    g.fleets = g.fleets.filter((o) => o !== id);
    world.sunk.add(g.id);
  }
  const l = landingOfDivision(world, id);
  if (!l) return;
  l.divisions.delete(id);
  if (l.divisions.size === 0) endLanding(world, l);
}

/**
 * Division `id`, ashore, leaves its landing for a new order (ROADMAP R33b); the way back into it as it was,
 * for an order then refused (R24a). A landing left by its last is over, its transports free for the order.
 */
export function detachDivision(world: World, id: number): () => void {
  const l = landingOfDivision(world, id)!;
  const joined = l.divisions.get(id)!;
  const orders = l.fleets.map((o) => [o, world.playerOrders.get(o)] as const);
  const fleets = [...l.fleets];
  l.divisions.delete(id);
  const gone = l.divisions.size === 0;
  if (gone) {
    world.landings.delete(l.id);
    for (const o of l.fleets) {
      if (carrying(world, o)) continue;
      world.playerOrders.delete(o);
      world.freed.set(o, l.port);
    }
  } else if (l.state === LandingState.gathering) {
    // Its transports beyond what those left need are free (critic run 40, R40-B1: the one leaving walked to
    // another port's while its landing's spare group stood at its own): those at the port it stands at first.
    const here = divisionAtPort(world, l, id);
    const order = [...l.fleets].sort((a, b) => Number(here && atPort(world, l, b)) - Number(here && atPort(world, l, a)) || a - b);
    for (const o of order) {
      if (l.fleets.length <= 1 || carrying(world, o) || roomOf(world, l) - transportRoom(world, o) < menOf(world, l)) continue;
      l.fleets.splice(l.fleets.indexOf(o), 1);
      world.playerOrders.delete(o);
      world.freed.set(o, l.port);
    }
  }
  return () => {
    l.divisions.set(id, joined);
    l.fleets = fleets;
    for (const o of fleets) world.freed.delete(o);
    if (gone) world.landings.set(l.id, l);
    for (const [o, p] of orders) if (p !== undefined && world.formations.has(o)) world.playerOrders.set(o, p);
  };
}

/** Puts landing `l`'s target at cell `target` (a redirect): its water and land, and those aboard. False where it has no landing. */
function retarget(world: World, l: Landing, target: number): boolean {
  const o = landingOf(world, target);
  if (!o) return false;
  l.target = target;
  l.water = o.water;
  l.land = o.land;
  for (const id of l.divisions.keys()) {
    const e = world.embarked.get(id);
    if (e !== undefined && l.fleets.includes(e.fleet)) Object.assign(e, { target, water: o.water, land: o.land });
  }
  return true;
}

/** Sails landing `l`'s groups with someone aboard to cell `to`'s water; false (nothing changed) where one has no way. */
function sailAll(world: World, l: Landing, to: number): boolean {
  const c = world.formations.cols;
  const goals = l.fleets.map((o) => [o, c.moving[o] === 1 ? c.targetCell[o]! : -1] as const);
  const [x, y] = pointOf(world, to);
  for (const o of l.fleets) {
    if (!carrying(world, o) || orderSail(world, o, x, y)) continue;
    for (const [g, k] of goals) {
      if (k >= 0) orderSail(world, g, ...pointOf(world, k));
    }
    return false;
  }
  return true;
}

/**
 * The hour's orders for the player's landings at sea (ROADMAP R33b), before they are applied: where one
 * click (`cmds` with one target) orders all of a sailing or returning landing's divisions, all aboard, the
 * landing is edited as one: to another landing gathering for that place, its transports sail to that one's
 * port and it joins it (R43-B1's recall); to another landing over the sea from its port, it sails there;
 * elsewhere (not over the sea), back to its port, and they march there once ashore (a cancel). Each order
 * then finds its landing is for it, and is taken as it stands (`orderMove`). Divisions ashore are not
 * edited here: their orders take them out of their landing one by one (`detachDivision`).
 */
export function landingOrders(world: World, cmds: readonly { id: number; x: number; y: number; nation?: number }[]): void {
  world.rejoined.clear();
  world.freed.clear();
  if (world.landings.size === 0) return;
  const last = new Map<number, { x: number; y: number }>();
  for (const { id, x, y, nation } of cmds) if (nation !== undefined && world.formations.has(id) && world.formations.cols.nation[id] === nation) last.set(id, { x, y });
  for (const l of [...world.landings.values()].sort((a, b) => a.id - b.id)) {
    if (!world.landings.has(l.id)) continue;
    if (l.state === LandingState.gathering) {
      redirectGathering(world, l, last);
      continue;
    }
    const ids = [...l.divisions.keys()];
    const aboard = aboardOf(world, l);
    if (aboard.length === 0 || !ids.every((id) => last.has(id))) continue;
    // Those aboard are what the click turns (ROADMAP R48a: a cancel stops those ashore where they stand, each by its
    // own order, and turns those aboard back): one ashore, bound for its next voyage, leaves by its order. With one
    // ashore the click is only a cancel; a redirect or a join takes the landing whole.
    const ashore = aboard.length !== ids.length;
    const { x, y } = last.get(aboard[0]!)!;
    if (!(ashore ? aboard : ids).every((id) => last.get(id)!.x === x && last.get(id)!.y === y) || sameLandingAs(world, l, x, y)) continue;
    const target = cellAt(world, x, y);
    // The sea is no cancel (critic run 44, R44-B2: it sailed home and was refused a day later): each order is
    // refused at the click, `OpenSea` (`orderMove`), and the landing keeps its course.
    if (!isLand(world.cells.terrain[target]!)) continue;
    const port = world.ports[l.port]!.cell;
    if (!overSeaFrom(world, port, x, y)) {
      // A cancel: back to its own port, then the march.
      if (world.cells.controller[port] !== l.nation || !sailAll(world, l, portSeaOf(world)[l.port]!)) continue;
      l.state = LandingState.returning;
      l.then = target;
      continue;
    }
    if (ashore) continue;
    if (!landingOf(world, target) || neutralLanding(world, l.nation, target)) continue;
    // Another landing gathering for that place, at a port of its nation: they sail there and join it.
    const join = [...world.landings.values()].sort((a, b) => a.id - b.id).find((o) => o.id !== l.id && o.nation === l.nation && o.state === LandingState.gathering && world.cells.controller[world.ports[o.port]!.cell] === l.nation && !portShut(world, o.port) && sameLandingAs(world, o, x, y));
    if (join) {
      if (!sailAll(world, l, portSeaOf(world)[join.port]!)) continue;
      for (const [id, at] of l.divisions) join.divisions.set(id, at);
      for (const o of l.fleets) if (!join.fleets.includes(o)) join.fleets.push(o);
      join.fleets.sort((a, b) => a - b);
      retarget(world, join, join.target);
      join.ordered = world.tick;
      world.landings.delete(l.id);
      for (const e of world.escorts.values()) if (e.convoy === l.id) e.convoy = join.id;
      continue;
    }
    const was = { target: l.target, water: l.water, land: l.land };
    if (!retarget(world, l, target)) continue;
    if (!sailAll(world, l, l.water)) {
      retarget(world, l, was.target);
      continue;
    }
    l.state = LandingState.sailing;
    l.then = -1;
  }
}

/**
 * A gathering landing `l` all of whose divisions one click (`last`: each ordered division's order) sends to
 * one other place over the sea from its port (ROADMAP R33b; critic runs 39–40, R39-B1, R40-B1: one by one,
 * each found the landing's transports held by the rest, and walked to another port's): the landing goes
 * there, with its port and its transports; where another gathers for that place at the same port, it joins
 * that one; where another gathers for that place at another port of their land, each order joins that one.
 * Anything else is left to each order (`detachDivision`).
 */
function redirectGathering(world: World, l: Landing, last: ReadonlyMap<number, { x: number; y: number }>): void {
  const ids = [...l.divisions.keys()];
  if (!ids.every((id) => last.has(id))) return;
  const { x, y } = last.get(ids[0]!)!;
  if (!ids.every((id) => last.get(id)!.x === x && last.get(id)!.y === y) || sameLandingAs(world, l, x, y)) return;
  const target = cellAt(world, x, y);
  if (!overSeaFrom(world, world.ports[l.port]!.cell, x, y) || !landingOf(world, target) || neutralLanding(world, l.nation, target)) return;
  const join = [...world.landings.values()].sort((a, b) => a.id - b.id).find((o) => o.id !== l.id && o.nation === l.nation && o.state === LandingState.gathering && o.port === l.port && sameLandingAs(world, o, x, y));
  if (join) {
    for (const [id, at] of l.divisions) join.divisions.set(id, at);
    for (const o of l.fleets) if (!join.fleets.includes(o)) join.fleets.push(o);
    join.fleets.sort((a, b) => a - b);
    join.ordered = world.tick;
    world.landings.delete(l.id);
    for (const e of world.escorts.values()) if (e.convoy === l.id) e.convoy = join.id;
    return;
  }
  // Another gathering for that place at a port of their land, none of these yet at its own (R33d; the grid's recall: the one re-sent
  // elsewhere, then back, kept its own landing at another port, and its mate sailed alone): each order
  // joins it (`chooseTransports`), this landing's transports freed for it, each keeping the hour it joined.
  // Not where one already stands at its port: it does not walk to another (R29b).
  const there = ids.every((id) => world.formations.cols.moving[id] === 1) && [...world.landings.values()].some((o) => o.id !== l.id && o.nation === l.nation && o.state === LandingState.gathering && sameLandingAs(world, o, x, y) && ids.every((id) => ownPort(world, l.nation, cellOfPlace(world, id), o.port)));
  if (there) {
    for (const id of ids) world.rejoined.set(id, l.divisions.get(id)!);
    return;
  }
  retarget(world, l, target);
  l.ordered = world.tick;
}

/**
 * Tells the player's divisions the hour's orders took out of their landing that they leave it
 * (`LeftLanding`, ROADMAP R25b, R27c), where it goes on with others. A whole click sent elsewhere is not
 * told: no one is left behind. Run once the hour's orders are in (`applyPendingCommands`).
 */
export function tellLandingsLeft(world: World): void {
  if (world.landingsLeft.length === 0) return;
  const left = world.landingsLeft;
  world.landingsLeft = [];
  const c = world.formations.cols;
  for (const [id, was] of left) {
    if (!world.formations.has(id)) continue;
    const l = world.landings.get(was);
    if (!l || l.divisions.has(id) || l.divisions.size === 0) continue;
    world.out.emit(world.tick, EventKind.LeftLanding, id, c.nation[id]!, c.x[id]!, c.y[id]!);
  }
}

/** The first hour any of landing `l`'s divisions joined. */
const firstJoined = (l: Landing): number => Math.min(...l.divisions.values());

/**
 * Whether landing `l` waits for its division `id` still marching to its port (ROADMAP R31f; critic run 37,
 * R37-N2). Before the landing is ready: one whose march left is LATE_WAIT_HOURS or less; one joined later than
 * SAME_CLICK_HOURS after its first (its click), no longer; one of its click while it is there within
 * READY_WAIT_HOURS of the hour the landing could sail without it (`readyHours`). Once ready (`Landing.ready`), each
 * only if there within READY_WAIT_HOURS of that hour (ROADMAP R44a, ADR-846: 20827's six waited at Newcastle for
 * one walking 12 days from London, 277 there with its group in 4). One not waited for goes on the next voyage.
 */
export function waited(world: World, l: Landing, id: number): boolean {
  if (world.formations.cols.moving[id] !== 1) return true;
  const left = marchHoursLeft(world, id);
  // Ready: there within READY_WAIT_HOURS of the hour it was first ready, or of its own joining if later (a fixed
  // hour: a bound read anew each hour let each come within it in turn, and 20827's landing waited 8 days more).
  if (l.ready >= 0) return world.tick + left <= Math.max(l.ready, l.divisions.get(id)!) + READY_WAIT_HOURS;
  if (left <= LATE_WAIT_HOURS) return true;
  if (l.divisions.get(id)! - firstJoined(l) > SAME_CLICK_HOURS) return false;
  return left <= readyHours(world, l) + READY_WAIT_HOURS;
}

/**
 * The hours before landing `l` could sail with the first of its divisions (ROADMAP R44a): the later of its groups'
 * way to its port (Infinity for one standing away: it is sent there next hour) and the first of its divisions there.
 */
function readyHours(world: World, l: Landing): number {
  const c = world.formations.cols;
  let groups = 0;
  for (const o of l.fleets) if (!atPort(world, l, o)) groups = Math.max(groups, c.moving[o] === 1 ? sailHoursLeft(world, o) : Infinity);
  let first = Infinity;
  for (const id of l.divisions.keys()) {
    if (!world.formations.has(id)) continue;
    first = Math.min(first, world.embarked.has(id) || c.moving[id] !== 1 ? 0 : marchHoursLeft(world, id));
  }
  return Math.max(groups, first);
}

/**
 * The hours landing `l` gathering has left to wait (ROADMAP R22d): the longest of the march of a division it
 * waits for and the voyage of a group still on its way to its port; Infinity while one does not go on.
 */
export function waitLeft(world: World, l: Landing): number {
  const c = world.formations.cols;
  let hours = 0;
  for (const o of l.fleets) if (!atPort(world, l, o)) hours = Math.max(hours, c.moving[o] === 1 ? sailHoursLeft(world, o) : Infinity);
  for (const id of l.divisions.keys()) if (c.moving[id] === 1 && waited(world, l, id)) hours = Math.max(hours, marchHoursLeft(world, id));
  return hours;
}

/**
 * Whether landing `l`, ready to sail, waits for its escort (ROADMAP R22d): one not yet at the landing's water
 * sails there now, and the landing waits while it is in a battle or would be there after the transports. One
 * with no way there is the AI's again, and the landing is told it sails alone (`ConvoyUnescorted`).
 */
function escortAhead(world: World, l: Landing): boolean {
  const f = world.formations;
  const c = f.cols;
  const [x, y] = pointOf(world, l.water);
  const voyage = Math.max(0, ...l.fleets.map((o) => sailHours(world, o, x, y)).filter(Number.isFinite));
  let wait = false;
  for (const [o, e] of [...world.escorts].sort((a, b) => a[0] - b[0])) {
    if (e.convoy !== l.id || !f.has(o)) continue;
    if (near(world, cellOfPlace(world, o), l.water, world.atSize(AT_PORT_CELLS))) continue;
    if (c.engaged[o] === 1 || c.moving[o] === 1 || orderSail(world, o, x, y)) {
      if (c.engaged[o] === 1 || sailHoursLeft(world, o) > voyage) wait = true;
      continue;
    }
    world.escorts.delete(o);
    world.playerOrders.delete(o);
    const first = [...l.divisions.keys()].sort((a, b) => a - b)[0]!;
    world.out.emit(world.tick, EventKind.ConvoyUnescorted, first, c.nation[first]!, c.x[first]!, c.y[first]!);
  }
  return wait;
}

/** Puts division `id`, aboard at landing `l`'s port, ashore there: at the port's cell, its organisation as it was. */
function ashoreAtPort(world: World, l: Landing, id: number): void {
  const c = world.formations.cols;
  world.embarked.delete(id);
  [c.x[id], c.y[id]] = world.cellPoint(world.ports[l.port]!.cell);
  c.moving[id] = 0;
}

/** A gathering landing's hour (`landingSystem`). */
function gather(world: World, l: Landing): void {
  const f = world.formations;
  const c = f.cols;
  const portCell = world.ports[l.port]!.cell;
  // Its target a neutral's after a peace (ROADMAP R21a): over, those marching stopped where they stand (`endLanding`).
  if (neutralLanding(world, l.nation, l.target)) {
    endLanding(world, l, RejectReason.Neutral);
    return;
  }
  // Its port bombed shut (ROADMAP R21b, R31b) or lost: over, all told.
  if (world.cells.controller[portCell] !== l.nation || portShut(world, l.port)) {
    endLanding(world, l, portShut(world, l.port) ? RejectReason.PortShut : RejectReason.NoPort);
    return;
  }
  const w = world.cells.w;
  const water = portSeaOf(world)[l.port]!;
  // Its transports: at the port (those aboard go ashore there: a landing recalled to it), on their way, or
  // standing away (after a voyage, or a battle broken off): sent to the port.
  for (const o of [...l.fleets]) {
    if (atPort(world, l, o)) {
      for (const [id, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) if (e.fleet === o && l.divisions.has(id)) ashoreAtPort(world, l, id);
      continue;
    }
    if (c.moving[o] === 1 || c.engaged[o] === 1) continue;
    if (!orderSail(world, o, (water % w) + 0.5, Math.floor(water / w) + 0.5)) l.fleets.splice(l.fleets.indexOf(o), 1);
  }
  if (l.fleets.length === 0 && !replaceGroups(world, l)) return;
  // First ready: its groups at its port and one of its divisions there (R44a: those marching are waited for from it).
  if (l.ready < 0 && l.fleets.every((o) => atPort(world, l, o)) && [...l.divisions.keys()].some((id) => c.moving[id] !== 1 && !world.embarked.has(id) && divisionAtPort(world, l, id))) l.ready = world.tick;
  // Its divisions: marching to the port, at it, or stalled short of it (told; not waited for).
  const present: number[] = [];
  let waits = false;
  const most = Math.max(...l.fleets.map((o) => transportRoom(world, o)));
  for (const id of [...l.divisions.keys()].sort((a, b) => a - b)) {
    if (world.embarked.has(id)) {
      waits = true;
      continue;
    }
    if (c.moving[id] === 1) {
      if (waited(world, l, id) && c.strength[id]! <= most) waits = true;
      continue;
    }
    if (!divisionAtPort(world, l, id)) {
      l.divisions.delete(id);
      world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.NoTransports, NaN);
      continue;
    }
    // In a fight at the port: it keeps its landing, which waits for it.
    if (c.engaged[id] === 1) waits = true;
    present.push(id);
  }
  if (l.divisions.size === 0) {
    endLanding(world, l);
    return;
  }
  // It sails no sooner than an hour after its last order (ROADMAP R31e; critic run 40, R40-N1: the one re-sent
  // alone sailed at once, before the rest of its click, an hour on, could join it).
  if (present.length === 0 || waits || world.tick - l.ordered < 1 || l.fleets.some((o) => !atPort(world, l, o)) || escortAhead(world, l)) return;
  // Room for all at the port (critic run 44, R44-B1: a part re-sent by one click kept too few groups, sailed
  // with what fit and left the rest at the port, untold, to land alone weeks later): short, a group free at
  // its port or one called joins it (an idle one, else one busy on the AI's errands: R37a, critic run 45,
  // R45-B1), and it waits. None to be had anywhere: those that fit sail, the rest are told, and the groups
  // come back for them (R17b, `landingCall1938`).
  const unfit = noRoom(world, l, present);
  if (unfit.length > 0) {
    const o = freeAtPort(world, l.nation, c.strength[unfit[0]!]!, l.port) || callTransports(world, unfit[0]!, l.port) || callTransports(world, unfit[0]!, l.port, true);
    if (o !== 0) {
      bindGroup(world, l, o);
      return;
    }
  }
  // Another landing of its click for the same place, from another port: they go together (R37c).
  if (waitsForSiblings(world, l)) return;
  // Its click made other landings that still gather (R43a: one a port): a few hours after its last order, so that
  // clicks moments apart for one place go together (landingPartResent: the four re-sent one an hour, Tokyo's sailed
  // before Hiroshima's and Sapporo's were sent and landed six days alone).
  if (world.tick - l.ordered < CLICK_HOLD_HOURS && clickFamily(world, l)) return;
  // The sail hour: those at the port board, first fit, and the groups carrying them sail.
  const [tx, ty] = pointOf(world, l.target);
  for (const id of present) {
    const fleet = l.fleets.find((o) => transportRoom(world, o) - menAboard(world, o) >= c.strength[id]!);
    if (fleet === undefined) continue;
    const why = tryLanding(world, id, tx, ty, fleet, true);
    if (why !== 0) {
      l.divisions.delete(id);
      world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, why, NaN);
    }
  }
  if (l.divisions.size === 0) {
    endLanding(world, l);
    return;
  }
  if (aboardOf(world, l).length === 0) return;
  if (!sailAll(world, l, l.water)) {
    for (const id of aboardOf(world, l)) ashoreAtPort(world, l, id);
    endLanding(world, l, RejectReason.NoSeaWay);
    return;
  }
  // Those at the port with no room: told they go on the next voyage (R37a; critic runs 44–45: untold).
  for (const id of present) if (l.divisions.has(id) && world.formations.has(id) && !isAboard(world, l, id)) world.out.emit(world.tick, EventKind.NextVoyage, id, c.nation[id]!, c.x[id]!, c.y[id]!);
  // Groups carrying no one: kept for those left (the next voyage), else the AI's.
  const left = [...l.divisions.keys()].some((id) => !isAboard(world, l, id));
  if (!left) {
    for (const o of l.fleets.filter((g) => !carrying(world, g))) world.playerOrders.delete(o);
    l.fleets = l.fleets.filter((g) => carrying(world, g));
  }
  l.state = LandingState.sailing;
}

/** Of landing `l`'s divisions `ids` at its port, those its groups have no room for, boarded first fit as at the sail hour. */
function noRoom(world: World, l: Landing, ids: readonly number[]): number[] {
  const c = world.formations.cols;
  const left = new Map(l.fleets.map((o) => [o, transportRoom(world, o) - menAboard(world, o)]));
  const out: number[] = [];
  for (const id of ids) {
    const o = l.fleets.find((g) => left.get(g)! >= c.strength[id]!);
    if (o === undefined) out.push(id);
    else left.set(o, left.get(o)! - c.strength[id]!);
  }
  return out;
}

/** Group `o` joins landing `l`: the player's, sailing to its port (`gather`). */
function bindGroup(world: World, l: Landing, o: number): void {
  l.fleets.push(o);
  l.fleets.sort((a, b) => a - b);
  world.playerOrders.set(o, { kind: PlayerOrderKind.called, until: 0, through: false });
  world.station.delete(o);
}

/**
 * The other landings of `l`'s nation for the same place (`sameLandingAs`) whose first joined, or last order, within
 * SAME_CLICK_HOURS of `l`'s: one click, or two for one place within a day, that went to two ports (ROADMAP
 * R37c; critic run 44, R44-N2: the one from the nearer port sailed first and landed alone, a week early).
 */
function siblings(world: World, l: Landing): Landing[] {
  const [x, y] = pointOf(world, l.target);
  const first = firstJoined(l);
  const near = (o: Landing): boolean => Math.abs(firstJoined(o) - first) <= SAME_CLICK_HOURS || Math.abs(o.ordered - l.ordered) <= SAME_CLICK_HOURS;
  return [...world.landings.values()].filter((o) => o.id !== l.id && o.nation === l.nation && o.state !== LandingState.returning && o.divisions.size > 0 && near(o) && sameLandingAs(world, o, x, y));
}

/**
 * The longest voyage, in hours, of landing `l`'s groups to its water; 0 for none known. Gathering: from its port (a
 * group still on its way there is counted by `waitLeft`; ROADMAP R43a: its hours to the port were read as its
 * voyage, and a sibling from Sapporo was not waited for); else from where they are.
 */
function voyageHours(world: World, l: Landing): number {
  const [x, y] = pointOf(world, l.water);
  const from = portSeaOf(world)[l.port]!;
  const one = (o: number): number => (l.state === LandingState.gathering ? sailHoursFrom(world, o, from, x, y) : world.formations.cols.moving[o] === 1 ? sailHoursLeft(world, o) : sailHours(world, o, x, y));
  return Math.max(0, ...l.fleets.map(one).filter(Number.isFinite));
}

/**
 * Whether landing `l`, ready to sail, waits for its siblings (R37c): while one would land more than
 * SIBLING_SLACK_HOURS after `l` sailing now (a gathering one: its wait left, `waitLeft`, and its voyage; a
 * sailing one: its voyage left). One whose wait has no end known, or is over SIBLING_WAIT_HOURS, is not waited
 * for. So they land within a day, and a landing ready does not stand at its port longer than that needs
 * (R30a: a port bombed shut).
 */
function waitsForSiblings(world: World, l: Landing): boolean {
  return siblingWait(world, l) !== null;
}

/** How many hours after its last order a landing of a click that made several holds (ROADMAP R43a): six. */
const CLICK_HOLD_HOURS = 6;

/** Whether another landing of `l`'s nation first joined within SAME_CLICK_HOURS of `l`'s still gathers: its click made several (R43a). */
function clickFamily(world: World, l: Landing): boolean {
  const first = firstJoined(l);
  for (const o of world.landings.values()) if (o.id !== l.id && o.nation === l.nation && o.state === LandingState.gathering && Math.abs(firstJoined(o) - first) <= SAME_CLICK_HOURS) return true;
  return false;
}

/**
 * The sibling landing `l` waits for (`waitsForSiblings`) and the hours `l` has left to wait for it (till it can
 * sail and land within a day of it), the longest; null for none (R38b: the panel says so).
 */
function siblingWait(world: World, l: Landing): { port: number; hours: number } | null {
  const sib = siblings(world, l);
  if (sib.length === 0) return null;
  const mine = voyageHours(world, l);
  let out: { port: number; hours: number } | null = null;
  for (const o of sib) {
    // A gathering one over a month from sailing (a march from afar, R31f) is not waited for: SIBLING_WAIT_HOURS.
    const left = o.state === LandingState.gathering ? waitLeft(world, o) : 0;
    if (!Number.isFinite(left) || left > SIBLING_WAIT_HOURS) continue;
    const hours = left + voyageHours(world, o) - mine - SIBLING_SLACK_HOURS;
    if (hours > 0 && (!out || hours > out.hours)) out = { port: o.port, hours };
  }
  return out;
}

/**
 * The hours until gathering landing `l` sails, and why (ROADMAP R42a; critic run 49, R49-N5: a 5-day crossing took a
 * month, and the click did not say): its wait for its own (`waitLeft`: the last division's march, its transports'
 * sail to the port), or for a sibling of its click (`siblingWait`), the later; `other` that sibling's port. Null when
 * not gathering, or with no end known (one held up on the way).
 */
export function sailsIn(world: World, l: Landing): { hours: number; other?: number } | null {
  if (l.state !== LandingState.gathering) return null;
  const own = waitLeft(world, l);
  if (!Number.isFinite(own)) return null;
  const sib = siblingWait(world, l);
  return sib && sib.hours > own ? { hours: sib.hours, other: sib.port } : { hours: own };
}

/**
 * The click landing `l` is of (ROADMAP R48f; critic run 51, the ADR-838 objection: one click, three rows, a cancel
 * ending one): the least id of `l` and the landings it is a sibling of, through siblings of siblings.
 */
function clickOf(world: World, l: Landing): number {
  const seen = new Set<number>([l.id]);
  const todo = [l];
  while (todo.length > 0) {
    for (const o of siblings(world, todo.pop()!)) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      todo.push(o);
    }
  }
  return Math.min(...seen);
}

/** A landing of a nation's in a row (ROADMAP R47; `landingRows`): read from `world.landings`, nothing decided here. */
export interface LandingRowData {
  id: number;
  state: LandingStateKind;
  /** Its port, index in `world.ports`; its water and land cells; the cell the order was for. */
  port: number;
  water: number;
  land: number;
  target: number;
  /** Its living divisions, ascending. */
  divisions: number[];
  /** Transport ships: those its divisions need (their men, `TRANSPORT_MEN` a ship) and its groups have. */
  need: number;
  have: number;
  /** Gathering: the hours until it sails and the sibling's port it waits for (`sailsIn`); null otherwise or unknown. */
  sailsIn: { hours: number; other?: number } | null;
  /** At sea: the hours until its groups are at its water (`voyageHours`, the longest); null otherwise or unknown (R48d). */
  landsIn: number | null;
  /** Turning back: the hours until its groups at sea are at its port (R50d), the longest; null when none is under way. */
  backIn: number | null;
  /** At sea with a group of it in a fight (ROADMAP R50c; critic run 52, R52-N3: "lands in about a day" for four days while 21105's were held). */
  held: boolean;
  /** Held: the nation of the nearest foe in a fight to its groups (`heldBy`; R52c), 0 for none found. */
  heldBy: number;
  /** Its click: the least id of it and its siblings (`siblings`, taken through), one key for the landings one click made from several ports (R48f). */
  click: number;
}

/**
 * The hours until returning landing `l`'s groups still sailing are at its port (ROADMAP R50d; critic run 52, R52-N5:
 * "turning back to Tokyo" with no days, where a landing at sea gives them): the longest; null for none under way.
 */
function backHours(world: World, l: Landing): number | null {
  const c = world.formations.cols;
  const left = l.fleets.filter((o) => world.formations.has(o) && c.moving[o] === 1).map((o) => sailHoursLeft(world, o)).filter(Number.isFinite);
  return left.length > 0 ? Math.max(...left) : null;
}

/**
 * Who holds landing `l`'s groups up at sea (ROADMAP R52c; critic run 53, R53-N3: "under attack, held up" for days with
 * no attacker in view, 21105's foe a British fleet 19 cells off, in a fight at its sight's range): the nation of the
 * fleet at war with it in the sea battle of one of its groups in a fight (`world.seaBattles`), the nearest to that
 * group; 0 for none. Not any formation in a fight (R53b; critic run 54, R54-N1: an army fighting ashore near the coast,
 * of a second foe, would be named for the fleet that holds the transports).
 */
export function heldBy(world: World, l: Landing): number {
  const c = world.formations.cols;
  const held = l.fleets.filter((o) => world.formations.has(o) && c.engaged[o] === 1);
  if (held.length === 0) return 0;
  let best = 0;
  let bd = Infinity;
  for (const o of held) {
    const battle = world.seaBattles.find((b) => b.fleets.includes(o));
    if (!battle) continue;
    for (const f of battle.fleets) {
      if (!world.formations.has(f) || !world.wars.atWar(c.nation[f]!, l.nation)) continue;
      const [dx, dy] = [c.x[f]! - c.x[o]!, c.y[f]! - c.y[o]!];
      const d = dx * dx + dy * dy;
      if (d < bd || (d === bd && f < best)) [bd, best] = [d, f];
    }
  }
  return best === 0 ? 0 : c.nation[best]!;
}

/** Nation `nation`'s landings in rows, by id (ROADMAP R47a). */
export function landingRows(world: World, nation: number): LandingRowData[] {
  const c = world.formations.cols;
  return [...world.landings.values()]
    .filter((l) => l.nation === nation)
    .sort((a, b) => a.id - b.id)
    .map((l) => {
      const divisions = [...l.divisions.keys()].filter((d) => world.formations.has(d)).sort((a, b) => a - b);
      const men = divisions.reduce((s, d) => s + c.strength[d]!, 0);
      return {
        id: l.id,
        state: l.state,
        port: l.port,
        water: l.water,
        land: l.land,
        target: l.target,
        divisions,
        need: Math.ceil(men / TRANSPORT_MEN),
        have: Math.floor(roomOf(world, l) / TRANSPORT_MEN),
        sailsIn: sailsIn(world, l),
        landsIn: l.state === LandingState.sailing ? voyageHours(world, l) || null : null,
        held: l.state === LandingState.sailing && l.fleets.some((o) => world.formations.has(o) && c.engaged[o] === 1),
        heldBy: l.state === LandingState.sailing ? heldBy(world, l) : 0,
        backIn: l.state === LandingState.returning ? backHours(world, l) : null,
        click: clickOf(world, l),
      };
    });
}

/** Men aboard group `fleet`. */
function menAboard(world: World, fleet: number): number {
  let men = 0;
  for (const [id, e] of world.embarked) if (e.fleet === fleet && world.formations.has(id)) men += world.formations.cols.strength[id]!;
  return men;
}

/** A returning landing's hour: at its port, those aboard go ashore and march where they were ordered. */
function comeBack(world: World, l: Landing): void {
  const c = world.formations.cols;
  const water = portSeaOf(world)[l.port]!;
  const [x, y] = pointOf(world, l.then);
  for (const o of [...l.fleets]) {
    if (!atPort(world, l, o)) {
      if (c.moving[o] !== 1 && c.engaged[o] !== 1 && !orderSail(world, o, ...pointOf(world, water))) {
        // No way back to its port: home, as the AI's transports.
        sailHome(world, o);
      }
      continue;
    }
    for (const [id, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) {
      if (e.fleet !== o || !l.divisions.has(id)) continue;
      ashoreAtPort(world, l, id);
      l.divisions.delete(id);
      if (orderMove(world, id, x, y, undefined, false, false, true)) world.playerOrders.set(id, { kind: PlayerOrderKind.march, until: 0, through: false });
    }
  }
  if (l.divisions.size === 0) endLanding(world, l);
}

/**
 * The player's landings, hourly in `amphibiousSystem` after the AI's boarding (see the head of the file):
 * those with no division left are over; gathering ones sail when ready; sailing ones, all they carried
 * ashore, gather again for those left (the next voyage) or are over; returning ones put those aboard
 * ashore at their port.
 */
export function landingSystem(world: World): void {
  if (world.landings.size === 0) {
    world.sunk.clear();
    return;
  }
  const f = world.formations;
  for (const l of [...world.landings.values()].sort((a, b) => a.id - b.id)) {
    if (!world.landings.has(l.id)) continue;
    // Gone, or aboard transports sunk this hour: no longer of it (those aboard are lost at sea with them at
    // this hour's end, `amphibiousSystem`, told `LostAtSea`; ROADMAP R38a, critic run 46, R46-B1: they were
    // told "no transports at a port" as the landing ended for want of groups).
    for (const id of [...l.divisions.keys()]) {
      const e = world.embarked.get(id);
      if (!f.has(id) || (e !== undefined && !f.has(e.fleet))) l.divisions.delete(id);
    }
    l.fleets = l.fleets.filter((o) => f.has(o));
    if (l.divisions.size === 0) {
      endLanding(world, l);
      continue;
    }
    if (l.state === LandingState.gathering) gather(world, l);
    else if (l.state === LandingState.returning) comeBack(world, l);
    else if (aboardOf(world, l).length === 0) {
      // All it carried ashore: those left gather at its port for the next voyage, its transports sent back; its
      // transports gone, another called for them (R39a).
      if (l.fleets.length > 0 || replaceGroups(world, l)) {
        l.state = LandingState.gathering;
        l.ready = -1; // the next voyage's wait counts from its own readiness (R44a)
      }
    }
  }
  world.sunk.clear();
}

/**
 * Landing `l`, gathering or left with some for its next voyage, has no transport group: one is called to its port
 * (free there, or the nearest idle, or a busy one: `callTransports`), and it goes on; with none, it is over. Its
 * groups destroyed (`World.sunk`): its divisions are told so (`TransportsSunk`, x 1 another called, 0 over), not
 * "no transports ... at a port it can reach" (ROADMAP R39a; critic run 47, R47-B1: 1119 bombed at Norfolk, 1123
 * idle at San Francisco). Whether it goes on.
 */
function replaceGroups(world: World, l: Landing): boolean {
  const c = world.formations.cols;
  const sunk = world.sunk.has(l.id);
  const ids = [...l.divisions.keys()].filter((id) => world.formations.has(id)).sort((a, b) => a - b);
  // The largest first: the group called has room for it (`noRoom` calls more at the sail hour).
  const big = [...ids].sort((a, b) => c.strength[b]! - c.strength[a]! || a - b)[0];
  const o = big === undefined ? 0 : freeAtPort(world, l.nation, c.strength[big]!, l.port) || callTransports(world, big, l.port) || callTransports(world, big, l.port, true);
  if (o !== 0) {
    l.fleets.push(o);
    world.playerOrders.set(o, { kind: PlayerOrderKind.called, until: 0, through: false });
    world.station.delete(o);
  }
  if (sunk) for (const id of ids) world.out.emit(world.tick, EventKind.TransportsSunk, id, c.nation[id]!, o !== 0 ? 1 : 0, NaN);
  if (o !== 0) return true;
  endLanding(world, l, sunk ? 0 : RejectReason.NoTransports);
  return false;
}

/** A repulsed landing from group `fleet` (PLAN 4.5b): those of its landing not aboard are told and leave it. */
export function landingRepulsed(world: World, fleet: number): void {
  const l = landingOfFleet(world, fleet);
  if (!l) return;
  const c = world.formations.cols;
  for (const id of [...l.divisions.keys()].sort((a, b) => a - b)) {
    if (isAboard(world, l, id) || !world.formations.has(id)) continue;
    l.divisions.delete(id);
    world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.NoTransports, NaN);
  }
}

/** How many of the nearest idle warfleets by straight cells an escort is chosen from, by the hours to the landing (`escortConvoy`). */
const ESCORT_TRIES = 8;

/**
 * The escort of the player's new landing `l` (ROADMAP R17d), asked for by the order of division `id`: of its
 * nation's warfleets (no transports) standing idle (not under way, in no battle, not under the player's own
 * order, not held by the editor, no landing's, no other's escort), of the ESCORT_TRIES nearest to the
 * landing's water by straight cells the one there soonest (`sailHours`, ROADMAP R23d), kept for it where it
 * stands as the player's. It sails when the landing is ready (`escortAhead`). None: `ConvoyUnescorted`.
 */
export function escortConvoy(world: World, l: Landing, id: number): void {
  const f = world.formations;
  const c = f.cols;
  const w = world.cells.w;
  const guarding = new Set([...world.escorts.keys()]);
  const idle: [number, number][] = [];
  f.forEach((o) => {
    if (!world.isFleet(o) || c.nation[o] !== l.nation || transportRoom(world, o) > 0 || c.moving[o] === 1 || c.engaged[o] === 1) return;
    if (world.playerOrders.has(o) || world.station.has(o) || inLanding(world, o) || guarding.has(o)) return;
    const at = cellOfPlace(world, o);
    let dx = Math.abs((at % w) - (l.water % w));
    if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
    const dy = Math.floor(at / w) - Math.floor(l.water / w);
    idle.push([o, dx * dx + dy * dy]);
  });
  idle.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  let best = 0;
  let hours = Infinity;
  for (const [o] of idle.slice(0, ESCORT_TRIES)) {
    const t = sailHours(world, o, ...pointOf(world, l.water));
    if (t < hours) [best, hours] = [o, t];
  }
  if (best !== 0) {
    world.playerOrders.set(best, { kind: PlayerOrderKind.march, until: 0, through: false });
    world.escorts.set(best, { convoy: l.id, from: cellOfPlace(world, best) });
    return;
  }
  world.out.emit(world.tick, EventKind.ConvoyUnescorted, id, l.nation, c.x[id]!, c.y[id]!);
}

/**
 * The escorts (ROADMAP R17d), hourly after the landings: kept while their landing is; while it gathers, one
 * sails for the landing's water once its voyage would take as long as the wait left, so as to be there when
 * the transports are, not weeks before. One whose landing is over is the AI's again and sails back to where
 * it came from (its port, or its place at sea), or home where it has no way there.
 */
export function escortSystem(world: World): void {
  if (world.escorts.size === 0) return;
  const f = world.formations;
  const c = f.cols;
  for (const [o, e] of [...world.escorts].sort((a, b) => a[0] - b[0])) {
    if (!f.has(o)) {
      world.escorts.delete(o);
      continue;
    }
    const l = world.landings.get(e.convoy);
    if (l) {
      if (l.state !== LandingState.gathering || c.moving[o] === 1 || c.engaged[o] === 1 || near(world, cellOfPlace(world, o), l.water, world.atSize(AT_PORT_CELLS))) continue;
      const [x, y] = pointOf(world, l.water);
      if (sailHours(world, o, x, y) < waitLeft(world, l) || orderSail(world, o, x, y)) continue;
    }
    world.escorts.delete(o);
    world.playerOrders.delete(o);
    if (!orderSail(world, o, ...pointOf(world, e.from))) sailHome(world, o);
  }
}

/** Where division `id` takes an order from: the port of its landing while aboard its transports (ROADMAP R27b, R43-N4), else its cell; -1 off land. */
export function orderFrom(world: World, id: number): number {
  const l = landingOfDivision(world, id);
  if (l && isAboard(world, l, id)) return world.ports[l.port]!.cell;
  return world.offLand(id) ? -1 : cellOfPlace(world, id);
}

/**
 * The landing an order of division `id` over the sea to (`x`, `y`) is for (ADR-827, ROADMAP R27a): its own
 * when the order is for it (`same`), else the click's (`landingOf`); null for none. `goal`: the cell the
 * order is for. The map marks it while the order is chosen.
 */
export function landingFor(world: World, id: number, x: number, y: number): { water: number; land: number; same: boolean; goal: number } | null {
  const { w, h } = world.cells;
  const [tx, ty] = [Math.floor(x), Math.floor(y)];
  if (tx < 0 || ty < 0 || tx >= w || ty >= h) return null;
  const l = landingOfDivision(world, id);
  if (l && sameLandingAs(world, l, x, y)) return { water: l.water, land: l.land, same: true, goal: l.target };
  const goal = ty * w + tx;
  const o = landingOf(world, goal);
  return o ? { ...o, same: false, goal } : null;
}

/** `landingFor` where the order goes over the sea from where division `id` takes it (`orderFrom`); else null. */
export function seaOrderLanding(world: World, id: number, x: number, y: number): { water: number; land: number; same: boolean; goal: number } | null {
  if (!world.formations.has(id)) return null;
  const from = orderFrom(world, id);
  if (from < 0 || !overSeaFrom(world, from, x, y)) return null;
  return landingFor(world, id, x, y);
}

/**
 * The cursor's hint for an order of the player's divisions `ids` (sorted) to (`x`, `y`) (`SeaHint`; ROADMAP
 * R17c, R21c, R27a, R28b): `how` and the landing of the first (3: the sea, one aboard at sea, R36b); `marks`, each distinct landing of those whose
 * order goes over the sea, `same` where all it is for already have it. Read-only.
 */
export function seaHint(world: World, ids: readonly number[], x: number, y: number): SeaHint {
  const target = cellAt(world, x, y);
  // The sea, with one of a landing selected: refused, `OpenSea`, its landing keeps its course (ROADMAP R36b; critic
  // run 44, R44-B2: no tooltip, no mark, and the click taken as a cancel); `ashore`: none of them aboard, its
  // landing gathering (R38f; critic run 45, R45-N3: no hover then).
  if (target >= 0 && target < world.cells.terrain.length && !isLand(world.cells.terrain[target]!)) {
    const of = ids.filter((id) => world.formations.has(id) && landingOfDivision(world, id) !== undefined);
    if (of.length > 0) return { how: 3, water: -1, land: -1, same: false, marks: [], ...(of.some((id) => world.embarked.has(id)) ? {} : { ashore: true }) };
    // Land formations in no landing, on open sea with no coast near: the march is refused `OpenSea` (`order`);
    // the hover says so (R38f; critic run 45, R45-N3).
    const land = ids.filter((id) => world.formations.has(id) && !world.isFleet(id) && !world.offLand(id));
    if (land.length > 0 && land.every((id) => { const from = orderFrom(world, id); return from < 0 || snapTarget(world, from, Math.floor(x), Math.floor(y)) < 0; })) {
      return { how: 3, water: -1, land: -1, same: false, marks: [], plain: true };
    }
  }
  const marks: LandingMark[] = [];
  let hint: SeaHint | null = null;
  // How many of the land formations go by sea (ROADMAP R34l; critic run 40, R40-N2: 33 of Japan's selected, 29 of them
  // on the mainland, and the tooltip said "your selected forces go by sea"). The hint is the first's that goes by sea.
  let sea = 0;
  let all = 0;
  for (const id of ids) {
    if (!world.formations.has(id)) continue;
    const from = orderFrom(world, id);
    const yes = from >= 0 && overSeaFrom(world, from, x, y);
    const how = !yes ? 0 : neutralLanding(world, world.formations.cols.nation[id]!, target) ? 2 : 1;
    const l = how === 1 ? landingFor(world, id, x, y) : null;
    if (!world.isFleet(id) && !world.isWing(id)) {
      all++;
      if (yes) sea++;
    }
    if (hint?.how === 0 && how !== 0) hint = null;
    hint ??= { how, water: l?.water ?? -1, land: l?.land ?? -1, same: l?.same ?? false, marks };
    if (!l) continue;
    const m = marks.find((k) => k.water === l.water && k.land === l.land);
    if (m) m.same &&= l.same;
    else marks.push({ water: l.water, land: l.land, same: l.same });
  }
  // A landing at sea sent to a place another gathers for at a port of its nation: it turns back and joins it
  // there (`landingOrders`, R43-B1's recall); the tooltip says so (ROADMAP R37b; critic run 44, R44-N1).
  if (hint?.how === 1 && !hint.same) {
    const at = ids.map((id) => landingOfDivision(world, id)).find((l) => l !== undefined && l.state !== LandingState.gathering && ids.some((id) => world.embarked.has(id) && l.divisions.has(id)));
    const join = at && [...world.landings.values()].find((o) => o.id !== at.id && o.nation === at.nation && o.state === LandingState.gathering && world.cells.controller[world.ports[o.port]!.cell] === at.nation && sameLandingAs(world, o, x, y));
    if (join) hint.rejoin = world.ports[join.port]?.name ?? '';
  }
  // The landing they already have, gathering: when it sails, in days (ROADMAP R42a; critic run 49, R49-N5: Tokyo to
  // Shanghai, 21 of 26 days waiting for a division 22 cells off, the click silent on it). Over a day only.
  if (hint?.how === 1 && hint.same && marks.length === 1) {
    const l = ids.map((id) => landingOfDivision(world, id)).find((o) => o !== undefined && o.water === hint!.water && o.land === hint!.land);
    const when = l && sailsIn(world, l);
    if (l && when && when.hours >= SAME_CLICK_HOURS) {
      hint.sails = { port: world.ports[l.port]?.name ?? '', days: Math.ceil(when.hours / 24), ...(when.other !== undefined ? { other: world.ports[when.other]?.name ?? '' } : {}) };
    }
  }
  if (hint && hint.how !== 0 && sea < all) hint.part = { sea, all };
  return hint ?? { how: 0, water: -1, land: -1, same: false, marks };
}

/** The water and land of the landing division `id` is in; null for none. */
export function landingHeld(world: World, id: number): { water: number; land: number } | null {
  const l = landingOfDivision(world, id);
  return l ? { water: l.water, land: l.land } : null;
}

/**
 * What a division's panel says of its voyage (ROADMAP R17c, R22c; `FormationDetail.voyage`), read from its
 * landing: marching to its port, waiting there for transports or for the rest of its landing (how many are
 * at the port of how many, the days the furthest it waits for has left to march), at sea, or sailing back
 * to its port. Null for none.
 */
export function voyageOf(world: World, id: number): { state: 'toPort' | 'waiting' | 'gathering' | 'ready' | 'sibling' | 'nextVoyage' | 'toPortAboard' | 'atSea'; port: string | null; other?: string; days?: number; later?: true; wait?: { aboard: number; of: number; days: number | null } } | null {
  const l = landingOfDivision(world, id);
  if (!l) return null;
  const port = world.ports[l.port]?.name ?? null;
  const c = world.formations.cols;
  // Aboard: at sea for its landing; sailing back to its port, a cancel or a recall to a landing gathering
  // there (ROADMAP R37b; critic run 44, R44-N1: "bound for its landing" while it sailed away from it).
  if (isAboard(world, l, id)) return l.state === LandingState.sailing ? { state: 'atSea', port: null } : { state: 'toPortAboard', port };
  // Aboard transports sunk this hour: at sea, lost with them at its end (R38a; critic run 46: "next voyage").
  const e = world.embarked.get(id);
  if (e !== undefined && !world.formations.has(e.fleet)) return { state: 'atSea', port: null };
  // On its way, its days to the port (ROADMAP R42a: the one its landing waits for says how long).
  if (c.moving[id] === 1) {
    const hours = marchHoursLeft(world, id);
    // One its landing does not wait for (R31f, R44a): it sails before; this one goes on the next voyage.
    const later = l.state !== LandingState.gathering || !waited(world, l, id) ? { later: true as const } : {};
    // Its days to the last, at least one (R53c; critic run 54: under a day it said none, beside lines that did).
    return Number.isFinite(hours) ? { state: 'toPort', port, days: Math.max(1, Math.ceil(hours / 24)), ...later } : { state: 'toPort', port, ...later };
  }
  // At the port, its landing sailed without it: the next voyage (R17b, R37a).
  if (l.state !== LandingState.gathering) return { state: 'nextVoyage', port };
  if (!l.fleets.some((o) => atPort(world, l, o))) return { state: 'waiting', port };
  let at = 0;
  let of = 0;
  let hours = 0;
  for (const d of l.divisions.keys()) {
    if (!world.formations.has(d) || isAboard(world, l, d)) continue;
    if (c.moving[d] === 1 && !waited(world, l, d)) continue;
    of++;
    if (c.moving[d] === 1) hours = Math.max(hours, marchHoursLeft(world, d));
    else at++;
  }
  // All at the port (R37b; critic run 45, R45-N1: "waiting for the rest of the landing" beside "2 of 2 at the
  // port"): waiting for its transports while one is on its way, else ready, for its escort or the hour.
  if (at === of) {
    if (!l.fleets.every((o) => atPort(world, l, o))) return { state: 'waiting', port };
    // Ready, waiting for the landing from another port for the same place (R37c; critic run 46, R46-N1: it read
    // "ready" for days): which, and for how many days.
    const sib = siblingWait(world, l);
    if (sib) return { state: 'sibling', port, other: world.ports[sib.port]?.name ?? '', days: Math.max(1, Math.ceil(sib.hours / 24)) };
    return { state: 'ready', port };
  }
  return { state: 'gathering', port, wait: { aboard: at, of, days: Number.isFinite(hours) ? Math.ceil(hours / 24) : null } };
}

/**
 * A save from before ROADMAP R33b (`World.legacyConvoys`): each convoy (`convoyPort`, a group and its port)
 * is a landing for the target of the first bound for it (`seaFetch`, `seaBound`) or aboard it, those of one
 * nation, port and target one landing; those aboard a group at its port go ashore there at its first hour.
 * Run at the start of the hour, before its orders.
 */
export function migrateLegacyLandings(world: World): void {
  const old = world.legacyConvoys;
  if (!old) return;
  world.legacyConvoys = null;
  const f = world.formations;
  const c = f.cols;
  const at = new Map<number, number>();
  for (let k = 0; k < old.fetchAt.length; k += 2) at.set(old.fetchAt[k]!, old.fetchAt[k + 1]!);
  const bound: [number, number][] = [];
  for (let k = 0; k < old.fetch.length; k += 2) bound.push([old.fetch[k]!, old.fetch[k + 1]!]);
  bound.sort((a, b) => a[0] - b[0]);
  const byFleet = new Map<number, number>();
  for (let k = 0; k < old.ports.length; k += 2) {
    const [fleet, port] = [old.ports[k]!, old.ports[k + 1]!];
    if (!f.has(fleet)) continue;
    const mine = bound.filter(([id, o]) => o === fleet && f.has(id)).map(([id]) => id);
    const onBoard = [...world.embarked].filter(([id, e]) => e.fleet === fleet && f.has(id)).map(([id]) => id).sort((a, b) => a - b);
    const first = mine[0] !== undefined ? world.seaBound.get(mine[0]) : onBoard[0] !== undefined ? world.embarked.get(onBoard[0])!.target : undefined;
    if (first === undefined) continue;
    const o = landingOf(world, first);
    if (!o) continue;
    let l = [...world.landings.values()].find((x) => x.nation === c.nation[fleet] && x.port === port && x.target === first);
    if (!l) {
      l = { id: world.nextLanding++, nation: c.nation[fleet]!, target: first, water: o.water, land: o.land, port, state: LandingState.gathering, fleets: [], divisions: new Map(), then: -1, ordered: world.tick - 1, ready: -1 };
      world.landings.set(l.id, l);
    }
    l.fleets.push(fleet);
    l.fleets.sort((a, b) => a - b);
    for (const id of [...mine, ...onBoard]) {
      l.divisions.set(id, at.get(id) ?? world.tick);
      world.seaBound.delete(id);
    }
    // Aboard and under way, not to its port: sailing for the landing.
    if (onBoard.length > 0 && c.moving[fleet] === 1 && !near(world, c.targetCell[fleet]!, portSeaOf(world)[port]!, world.atSize(AT_PORT_CELLS))) l.state = LandingState.sailing;
    byFleet.set(fleet, l.id);
  }
  for (const [o, e] of [...world.escorts]) {
    const id = byFleet.get(e.convoy);
    if (id === undefined) world.escorts.delete(o);
    else e.convoy = id;
  }
}
