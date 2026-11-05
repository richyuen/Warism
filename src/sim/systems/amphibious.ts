/**
 * Amphibious movement (PLAN 4.5a, SPEC §6.2): a land formation embarks on its nation's transports
 * at a port, sails with them, and lands on the coast its order was for.
 *
 * The order (`orderLanding`, from `orderMove` when the target is on another land than the
 * formation's): the formation stands at a port its nation holds (its water within
 * `AT_PORT_CELLS` of the formation's cell), and a transport group of its nation stands there
 * too, not under way, with room for it (`TRANSPORT_MEN` men a transport, less what it carries).
 * The landing is at the land cell of the target's land nearest to the zoned water nearest the
 * target (its `water`), one a nation owns where the target is owned (PLAN 4.6b); the
 * transports are ordered there (`orderSail`). The formation is then
 * embarked (`World.embarked`, state): `World.afloat` is true of it, so no rule of the land reads
 * it (supply, contact, the fronts, the AI), and it is where its transports are.
 *
 * Hourly after the movement (`amphibiousSystem`): an embarked formation is at its transports'
 * place. When they stand at the landing water it lands: at the landing cell, its org at most
 * `LANDING_ORG`, and ordered on to its target if that is another cell. When they stand anywhere
 * else (broken off from a sea battle, PLAN 4.3c, at a port of their own) it lands at the land
 * nearest them within `AT_PORT_CELLS` of its side or no one's (`strayLanding`, PLAN 4.8n), if
 * any, and stays aboard otherwise. Transports that are gone
 * (sunk) take the formation with them.
 *
 * A landing needs the sea (PLAN 4.5b): when the transports stand at the landing water and the
 * zone of that water is held by a bloc at war with the formation's nation (`seaHolder`, PLAN
 * 4.4a), the landing is thrown back (`LandingRepulsed`): the transports sail for their nation's
 * nearest port (`sailHome`) and the formation lands where they stand next. A formation that
 * lands on a cell held by a nation at war with its own takes it (the beachhead): the front
 * spreads only from held land (`territorySystem`), so without it a landing took nothing. The landing's
 * penalty in a fight is its disorder: a formation fires by its org (`ORG_FIRE`), at 0.625 of
 * its fire with `LANDING_ORG`, and recovers it as any formation.
 *
 * Not here: the bombardment (PLAN 4.5c); the AI's invasions (PLAN 4.6).
 */
import { EventKind, RejectReason } from '../../shared/events';
import { isLand } from '../../shared/terrain';
import { nearestCellWhere } from '../data/ownership';
import { FlipCause, navOf, PlayerOrderKind, portSeaOf, seaOf, seaRangeOf, type World } from '../world';
import { destroyFormation, elementIndex } from './elements';
import { AT_PORT_CELLS, sailHome } from './navalCombat';
import { foreignTo, orderMove } from './movement';
import { portShut } from './bombing';
import { orderSail } from './sail';
import { seaHolder } from './seaControl';
import { blocOf } from './supply';

/**
 * Men a transport carries. A transport group's 12 carry 25,200: two infantry divisions of 1938
 * (12,460 each, `infantry_div` at full strength) with 280 to spare (PLAN 7.90d, ADR-647). Before,
 * 2,000: the group's 24,000 took one such division a trip, half what it was set for.
 */
export const TRANSPORT_MEN = 2100;
/** The org a formation has at most when it has landed (PLAN 4.5a): a landing leaves it in disorder. */
export const LANDING_ORG = 0.5;
/** How far, in cells, the landing's water is looked for from the target. */
const LANDING_REACH = 8;

/** An embarked formation: its transports, the land cell it lands at, the water there, the cell its order was for. */
export interface Embarked {
  fleet: number;
  land: number;
  water: number;
  target: number;
}

/** Men the transports of fleet `fleet` carry at most. */
export function transportRoom(world: World, fleet: number): number {
  const units = world.rules!.units;
  const ec = world.elements.cols;
  let n = 0;
  for (const e of elementIndex(world).get(fleet) ?? []) if (units[ec.unit[e]!]!.cls === 'tp') n += ec.strength[e]!;
  return n * TRANSPORT_MEN;
}

/** Men aboard fleet `fleet` now. */
function aboard(world: World, fleet: number): number {
  let men = 0;
  for (const [id, e] of world.embarked) if (e.fleet === fleet) men += world.formations.cols.strength[id]!;
  return men;
}

const cellOfPlace = (world: World, id: number): number => Math.floor(world.formations.cols.y[id]!) * world.cells.w + Math.floor(world.formations.cols.x[id]!);
/**
 * The transport groups of nation `n` standing at a port it holds (as `invasion.ts`'s `transportsAtPort` takes
 * them): fleet, room, port index; the most room first, the lower id on a tie.
 */
export function transportGroupsAtPort(world: World, n: number): { fleet: number; room: number; port: number }[] {
  const c = world.formations.cols;
  const w = world.cells.w;
  const water = portSeaOf(world);
  const ctl = world.cells.controller;
  const out: { fleet: number; room: number; port: number }[] = [];
  world.formations.forEach((id) => {
    if (c.nation[id] !== n || !world.isFleet(id) || c.moving[id] === 1 || c.engaged[id] === 1 || seaRangeOf(world, id) !== undefined) return;
    const room = transportRoom(world, id);
    if (room <= 0) return;
    const at = Math.floor(c.y[id]!) * w + Math.floor(c.x[id]!);
    const port = world.ports.findIndex((p, k) => water[k]! >= 0 && ctl[p.cell] === n && near(world, at, water[k]!, world.atSize(AT_PORT_CELLS)));
    if (port >= 0) out.push({ fleet: id, room, port });
  });
  return out.sort((a, b) => b.room - a.room || a.fleet - b.fleet);
}

/**
 * Whether a formation on `cell` stands at a port, anyone's, shut or not (those `tryLanding` looks
 * for, their holders aside): where it does not, an order over the sea from there is refused the
 * sea (`NoPort`) whoever holds what, and is a march over its land (PLAN 1.42g).
 */
export function atAnyPort(world: World, cell: number): boolean {
  const water = portSeaOf(world);
  const r = world.atSize(AT_PORT_CELLS);
  return world.ports.some((p, i) => water[i]! >= 0 && (near(world, cell, p.cell, r) || near(world, cell, water[i]!, r)));
}

/**
 * Of a nation's formations `ids`, the land cells of the ports its nation holds at which one of its
 * transport groups stands (not under way, with room; its water within `AT_PORT_CELLS` of the
 * group): where the invasion AI sends its formations to go aboard (`sendToPort`, PLAN 7.56a).
 */
export function transportPorts(world: World, ids: readonly number[]): number[] {
  const c = world.formations.cols;
  const w = world.cells.w;
  const water = portSeaOf(world);
  const r = world.atSize(AT_PORT_CELLS);
  const cells: number[] = [];
  for (const id of ids) {
    if (!world.isFleet(id) || c.moving[id] === 1 || transportRoom(world, id) <= 0) continue;
    const at = Math.floor(c.y[id]!) * w + Math.floor(c.x[id]!);
    const i = world.ports.findIndex((p, k) => water[k]! >= 0 && world.cells.controller[p.cell] === c.nation[id] && near(world, at, water[k]!, r));
    if (i >= 0 && !cells.includes(world.ports[i]!.cell)) cells.push(world.ports[i]!.cell);
  }
  return cells;
}

/** Whether land formation `id` is on the march to one of the port cells `ports` (`transportPorts`): its target within `AT_PORT_CELLS` of it. */
export function marchingToPort(world: World, id: number, ports: readonly number[]): boolean {
  const c = world.formations.cols;
  if (c.moving[id] !== 1) return false;
  const r = world.atSize(AT_PORT_CELLS);
  return ports.some((p) => near(world, c.targetCell[id]!, p, r));
}

/** Whether cells a and b lie within r cells of each other on both axes (the map's loop taken). */
export const near = (world: World, a: number, b: number, r: number): boolean => {
  const w = world.cells.w;
  let dx = Math.abs((a % w) - (b % w));
  if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
  return dx <= r && Math.abs(Math.floor(a / w) - Math.floor(b / w)) <= r;
};

/**
 * Orders land formation `id` across the sea to (`x`, `y`) (see the head of the file); false where
 * it is at no port of its nation, no transport of its nation there has room, the target has no
 * water near it, or the transports have no way there. Nothing is changed then.
 */
export function orderLanding(world: World, id: number, x: number, y: number, via = 0): boolean {
  return tryLanding(world, id, x, y, via) === 0;
}

/**
 * `orderLanding`, with why it refused (`RejectReason`, PLAN 4.9a); 0 when ordered. `via`: the
 * transport group to take it, and no other (PLAN 7.90g, ADR-649), which may be under way already
 * when it carries a formation embarked on it (a group going aboard one after another in one hour,
 * PLAN 7.70b: the first's order sets the transports sailing, and the standing test refused the
 * rest; every landing and ferry trip of the invasion AI passes its group, PLAN 7.72, ADR-625).
 * Before PLAN 7.90g, `via` was one more group the search might take: with `via` full, the next
 * formation went on another group standing at the port and set it sailing with it alone (critic
 * run 12, 1129 year 10: four divisions at Norfolk aboard three groups, 2 / 1 / 1; 6421 year 20: 21
 * groups at Norfolk sailed with one each on one turn).
 */
export function tryLanding(world: World, id: number, x: number, y: number, via = 0, hold = false): 0 | RejectReason {
  const f = world.formations;
  const c = f.cols;
  if (!f.has(id) || world.afloat(id) || !world.rules) return world.afloat(id) ? RejectReason.Aboard : RejectReason.NotLand;
  // Transports carry the land's formations alone: no air wing (PLAN 5.8o).
  if (world.isWing(id)) return RejectReason.NotLand;
  const { w, h } = world.cells;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || tx >= w || ty < 0 || ty >= h) return RejectReason.NotLand;
  const target = ty * w + tx;
  const nation = c.nation[id]!;
  const here = cellOfPlace(world, id);
  // A port of its nation it stands at.
  const water = portSeaOf(world);
  // At the port: by its land cell or by its water (PLAN 4.9b: London's water is 7.5 cells down
  // the Thames). Of the ports it stands at, the first with transports for it.
  const at: number[] = [];
  // At a port of its nation bombed shut (ROADMAP R21b): that is why, not "no port".
  let shut = false;
  world.ports.forEach((p, i) => {
    if (water[i]! < 0 || world.cells.controller[p.cell] !== nation || !(near(world, here, p.cell, world.atSize(AT_PORT_CELLS)) || near(world, here, water[i]!, world.atSize(AT_PORT_CELLS)))) return;
    if (portShut(world, i)) shut = true;
    else at.push(i);
  });
  if (at.length === 0) return shut ? RejectReason.PortShut : RejectReason.NoPort;
  // Transports of its nation there, standing, with room.
  const men = c.strength[id]!;
  let fleet = 0;
  for (const i of at) {
    f.forEach((o) => {
      // `via` named: that group alone (PLAN 7.90g, ADR-649).
      if (fleet !== 0 || (via !== 0 && o !== via) || !world.isFleet(o) || c.nation[o] !== nation || c.engaged[o] === 1) return;
      if (c.moving[o] === 1 && !(o === via && carrying(world, o))) return;
      // A player's convoy loading (ROADMAP R17b) takes those bound for it alone.
      if (o !== via && world.convoyPort.has(o)) return;
      if (!near(world, cellOfPlace(world, o), water[i]!, world.atSize(AT_PORT_CELLS))) return;
      if (transportRoom(world, o) - aboard(world, o) >= men) fleet = o;
    });
    if (fleet !== 0) break;
  }
  if (fleet === 0) return RejectReason.NoTransports;
  const landing = landingOf(world, target);
  if (!landing) return RejectReason.NoLanding;
  const { water: sea, land } = landing;
  // `hold` (a player's convoy, ROADMAP R17b): aboard, the group sails when its convoy is in (`convoySystem`).
  if (!hold && !orderSail(world, fleet, (sea % w) + 0.5, Math.floor(sea / w) + 0.5)) return RejectReason.NoSeaWay;
  world.embarked.set(id, { fleet, land, water: sea, target });
  c.moving[id] = 0;
  c.home[id] = 0;
  world.paths.delete(id);
  c.x[id] = c.x[fleet]!;
  c.y[id] = c.y[fleet]!;
  world.out.emit(world.tick, EventKind.FormationEmbarked, id, nation, c.x[id]!, c.y[id]!);
  return 0;
}

/** Whether transport group `fleet` carries a formation embarked on it. */
export function carrying(world: World, fleet: number): boolean {
  for (const e of world.embarked.values()) if (e.fleet === fleet) return true;
  return false;
}

/**
 * The port a player's land formation `id` marches to for an order over the sea (PLAN 4.9b), index
 * in `world.ports`, or -1: of the ports on its land that its nation holds, with transports of its
 * nation standing at them (not under way, in no battle) with room for it, the nearest by straight
 * cells. `withTransports` false: of the ports on its land that its nation holds, with transports
 * or not (whether a refusal is for no port or for no transports).
 */
export function transportsPort(world: World, id: number, withTransports = true): number {
  const f = world.formations;
  const c = f.cols;
  const nation = c.nation[id]!;
  const men = c.strength[id]!;
  const w = world.cells.w;
  const water = portSeaOf(world);
  const comp = navOf(world).grid.component;
  const here = cellOfPlace(world, id);
  const fleets: number[] = [];
  f.forEach((o) => {
    if (world.isFleet(o) && c.nation[o] === nation && c.moving[o] !== 1 && c.engaged[o] !== 1 && !world.convoyPort.has(o) && transportRoom(world, o) - aboard(world, o) >= men) fleets.push(o);
  });
  let best = -1;
  let bd = Infinity;
  world.ports.forEach((p, i) => {
    if (water[i]! < 0 || world.cells.controller[p.cell] !== nation || comp[p.cell] !== comp[here] || portShut(world, i)) return;
    if (withTransports && !fleets.some((o) => near(world, cellOfPlace(world, o), water[i]!, world.atSize(AT_PORT_CELLS)))) return;
    let dx = Math.abs((p.cell % w) - (here % w));
    if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
    const dy = Math.floor(p.cell / w) - Math.floor(here / w);
    const d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

/** How many of the nearest idle transport groups a call tries to send (each a sea route searched). */
const CALL_TRIES = 4;

/**
 * Calls transports to port `port` (index in `world.ports`) for a player's land formation `id`
 * whose land has none for it (ROADMAP R17a): of its nation's transport groups standing idle
 * anywhere (not under way, in no battle, carrying nobody, not held in place by the editor, not
 * called for another), with room for it, the nearest to the port's water by straight cells that
 * has a way there (at most CALL_TRIES tried) sails there under the player's order, so the AI
 * leaves it be. Returns the group, or 0 for none.
 */
export function callTransports(world: World, id: number, port: number): number {
  const f = world.formations;
  const c = f.cols;
  const nation = c.nation[id]!;
  const men = c.strength[id]!;
  const water = portSeaOf(world)[port]!;
  if (water < 0) return 0;
  const w = world.cells.w;
  const called = new Set([...world.seaFetch.values(), ...world.convoyPort.keys()]);
  const dist = (o: number): number => {
    const at = cellOfPlace(world, o);
    let dx = Math.abs((at % w) - (water % w));
    if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
    const dy = Math.floor(at / w) - Math.floor(water / w);
    return dx * dx + dy * dy;
  };
  const idle: number[] = [];
  f.forEach((o) => {
    if (!world.isFleet(o) || c.nation[o] !== nation || c.moving[o] === 1 || c.engaged[o] === 1 || carrying(world, o) || world.station.has(o) || called.has(o)) return;
    if (transportRoom(world, o) >= men) idle.push(o);
  });
  idle.sort((a, b) => dist(a) - dist(b) || a - b);
  for (const o of idle.slice(0, CALL_TRIES)) {
    if (!orderSail(world, o, (water % w) + 0.5, Math.floor(water / w) + 0.5)) continue;
    world.playerOrders.set(o, { kind: PlayerOrderKind.march, until: 0, through: false });
    return o;
  }
  return 0;
}

/**
 * The landing for a target at cell `target` (`tryLanding`'s, PLAN 4.5a): the zoned open water
 * nearest it within LANDING_REACH, and the land of the target's nearest to that water, a nation's
 * where the target is a nation's (PLAN 4.6b: a speck of no one's by the water took no beachhead),
 * else any; null for none (not land, or no such water).
 */
export function landingOf(world: World, target: number): { water: number; land: number } | null {
  const { w, h, terrain } = world.cells;
  if (target < 0 || target >= w * h) return null;
  const comp = navOf(world).grid.component;
  const targetComp = comp[target]!;
  if (!isLand(terrain[target]!) || targetComp === 0) return null;
  const z = seaOf(world);
  const reach = world.atSize(LANDING_REACH);
  const loop = world.settings.loopingMap;
  const water = nearestCellWhere((k) => z.zoneOf[k] !== 0 && z.closed[z.zoneOf[k]!] !== 1, (target % w) + 0.5, Math.floor(target / w) + 0.5, w, h, reach, loop);
  if (water < 0) return null;
  const owner = world.cells.owner;
  const [sx, sy] = [(water % w) + 0.5, Math.floor(water / w) + 0.5];
  let land = owner[target] !== 0 ? nearestCellWhere((k) => comp[k] === targetComp && owner[k] !== 0, sx, sy, w, h, reach, loop) : -1;
  if (land < 0) land = nearestCellWhere((k) => comp[k] === targetComp, sx, sy, w, h, reach, loop);
  return land < 0 ? null : { water, land };
}

/**
 * Whether `nation`'s landing for `target` is on the ground of a nation outside its wars: the
 * target's holder or the landing cell's is `foreignTo` it (ROADMAP R20, R21a). A player's order
 * over the sea is refused so, and one under way is stopped so once a peace makes it so.
 */
export function neutralLanding(world: World, nation: number, target: number): boolean {
  const ctl = world.cells.controller;
  if (foreignTo(world, nation, ctl[target]!)) return true;
  const l = landingOf(world, target);
  return l !== null && foreignTo(world, nation, ctl[l.land]!);
}

/** Whether a landing for a target at (`x`, `y`) can be found (`landingOf`). */
export function hasLanding(world: World, x: number, y: number): boolean {
  const { w, h } = world.cells;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && tx < w && ty >= 0 && ty < h && landingOf(world, ty * w + tx) !== null;
}

/** Men of the player's formations bound for group `fleet` (`world.seaFetch`) and not yet aboard. */
function promised(world: World, fleet: number): number {
  let men = 0;
  for (const [id, o] of world.seaFetch) if (o === fleet && world.formations.has(id)) men += world.formations.cols.strength[id]!;
  return men;
}

/** The cell a player's convoy on group `fleet` is for: of a formation bound for it, else of one aboard; -1 for none. */
function convoyTarget(world: World, fleet: number): number {
  for (const [id, o] of [...world.seaFetch].sort((a, b) => a[0] - b[0])) if (o === fleet) return world.seaBound.get(id) ?? -1;
  for (const [, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) if (e.fleet === fleet) return e.target;
  return -1;
}

/** Whether group `fleet` of a player's convoy stands at its port, not under way and in no battle (ROADMAP R17b). */
export function loading(world: World, fleet: number): boolean {
  const port = world.convoyPort.get(fleet);
  const c = world.formations.cols;
  if (port === undefined || !world.formations.has(fleet) || c.moving[fleet] === 1 || c.engaged[fleet] === 1) return false;
  return near(world, cellOfPlace(world, fleet), portSeaOf(world)[port]!, world.atSize(AT_PORT_CELLS));
}

/**
 * A formation `id` aboard a player's convoy still loading at its port (ROADMAP R22b, critic run 34,
 * R34-N1) goes ashore there on a new order: at the port's cell, its organisation as it was, no
 * landing (it never left). The convoy waits on for the rest, or is over with nobody aboard or bound
 * (`convoySystem`). False where it is aboard anything else (under way, or the AI's) or the port is
 * no longer its nation's: it takes no order.
 */
export function ashoreAtPort(world: World, id: number): boolean {
  const e = world.embarked.get(id);
  if (e === undefined || !loading(world, e.fleet)) return false;
  const port = world.convoyPort.get(e.fleet)!;
  const c = world.formations.cols;
  if (world.cells.controller[world.ports[port]!.cell] !== c.nation[id]) return false;
  world.embarked.delete(id);
  [c.x[id], c.y[id]] = world.cellPoint(world.ports[port]!.cell);
  return true;
}

/** Ends the player's convoy on group `fleet`: the formations still bound for it are told (`why`, by default `NoTransports`). */
function endConvoy(world: World, fleet: number, why: RejectReason = RejectReason.NoTransports): void {
  world.convoyPort.delete(fleet);
  for (const [id, o] of [...world.seaFetch].sort((a, b) => a[0] - b[0])) {
    if (o !== fleet) continue;
    world.seaFetch.delete(id);
    world.seaBound.delete(id);
    if (world.formations.has(id)) world.out.emit(world.tick, EventKind.MoveRejected, id, world.formations.cols.nation[id]!, why, NaN);
  }
}

/**
 * The transports for a player's land formation `id` ordered over the sea to cell `target` (ROADMAP
 * R17a, R17b), and the port of its land where it boards them; null for none. In turn: a convoy of
 * its nation loading for the same target at a port of its land with room for it (a click's
 * divisions go together); a group standing at a port of its land with room, not another's convoy,
 * at the port nearest the formation; a group called to the nearest port of its land
 * (`callTransports`); a convoy for the same target that is full, for its next voyage.
 */
export function assignTransports(world: World, id: number, target: number): { port: number; fleet: number } | null {
  const f = world.formations;
  const c = f.cols;
  const nation = c.nation[id]!;
  const men = c.strength[id]!;
  const w = world.cells.w;
  const water = portSeaOf(world);
  const comp = navOf(world).grid.component;
  const here = cellOfPlace(world, id);
  const own = (i: number): boolean => water[i]! >= 0 && world.cells.controller[world.ports[i]!.cell] === nation && comp[world.ports[i]!.cell] === comp[here] && !portShut(world, i);
  const convoys = [...world.convoyPort].filter(([o, p]) => f.has(o) && c.nation[o] === nation && own(p) && convoyTarget(world, o) === target).sort((a, b) => a[0] - b[0]);
  for (const [o, p] of convoys) if (transportRoom(world, o) - aboard(world, o) - promised(world, o) >= men) return { port: p, fleet: o };
  // Its click's convoy full (ROADMAP R21e): another group at that port, or called there, so that the
  // two load at one port and sail together (`convoySystem`), not from two ports weeks apart.
  if (convoys.length > 0) {
    const p = convoys[0]![1];
    let o = 0;
    f.forEach((g) => {
      if (o !== 0 || !world.isFleet(g) || c.nation[g] !== nation || c.moving[g] === 1 || c.engaged[g] === 1 || world.convoyPort.has(g) || carrying(world, g)) return;
      if (transportRoom(world, g) - promised(world, g) >= men && near(world, cellOfPlace(world, g), water[p]!, world.atSize(AT_PORT_CELLS))) o = g;
    });
    if (o === 0) o = callTransports(world, id, p);
    if (o !== 0) return { port: p, fleet: o };
  }
  let best: { port: number; fleet: number } | null = null;
  let bd = Infinity;
  const dist = (k: number): number => {
    let dx = Math.abs((k % w) - (here % w));
    if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
    const dy = Math.floor(k / w) - Math.floor(here / w);
    return dx * dx + dy * dy;
  };
  f.forEach((o) => {
    if (!world.isFleet(o) || c.nation[o] !== nation || c.moving[o] === 1 || c.engaged[o] === 1 || world.convoyPort.has(o) || carrying(world, o)) return;
    if (transportRoom(world, o) - promised(world, o) < men) return;
    const at = cellOfPlace(world, o);
    world.ports.forEach((p, i) => {
      if (!own(i) || !near(world, at, water[i]!, world.atSize(AT_PORT_CELLS))) return;
      const d = dist(p.cell);
      if (d < bd || (d === bd && best !== null && o < best.fleet)) [bd, best] = [d, { port: i, fleet: o }];
    });
  });
  if (best) return best;
  const port = transportsPort(world, id, false);
  if (port >= 0) {
    const o = callTransports(world, id, port);
    if (o !== 0) return { port, fleet: o };
  }
  for (const [o, p] of convoys) if (transportRoom(world, o) >= men) return { port: p, fleet: o };
  return null;
}

/**
 * Whether the player's convoy on group `fleet` is still to load (ROADMAP R21e): nobody aboard yet
 * (called and on its way, or waiting for the first), or one bound for it that would fit.
 */
function stillLoading(world: World, fleet: number): boolean {
  if (!carrying(world, fleet)) return true;
  if (world.formations.cols.moving[fleet] === 1) return false;
  const room = transportRoom(world, fleet) - aboard(world, fleet);
  for (const [id, o] of world.seaFetch) if (o === fleet && world.formations.has(id) && world.formations.cols.strength[id]! <= room) return true;
  return false;
}

/** `boardConvoy`: not yet; it waits. */
const WAIT = -1;

/** A player's formation `id` bound for group `fleet` boards it for `target` (ROADMAP R17b): 0 aboard, WAIT, or why not. */
function boardConvoy(world: World, id: number, target: number, fleet: number): number {
  const f = world.formations;
  const c = f.cols;
  const port = world.convoyPort.get(fleet);
  if (!f.has(fleet) || port === undefined) return RejectReason.NoTransports;
  const p = world.ports[port]!;
  const here = cellOfPlace(world, id);
  const r = world.atSize(AT_PORT_CELLS);
  // Its march ended short of the port (stalled): not waited for.
  if (!near(world, here, p.cell, r) && !near(world, here, portSeaOf(world)[port]!, r)) return RejectReason.NoTransports;
  // Under way (called, or on the next voyage), in a battle, away, or full: it waits.
  if (!loading(world, fleet)) return WAIT;
  if (transportRoom(world, fleet) - aboard(world, fleet) < c.strength[id]!) return WAIT;
  const w = world.cells.w;
  return tryLanding(world, id, (target % w) + 0.5, Math.floor(target / w) + 0.5, fleet, true);
}

/**
 * The player's convoys (ROADMAP R17b), hourly after the boarding: a group loading at its port with
 * a formation aboard sails for the landing (the first aboard's) once no formation bound for it that
 * would fit is still to come; with no way there, the convoy ends and those aboard go ashore at the
 * port. Standing away from its port with nobody aboard, it sails back for those still bound for it
 * (the next voyage). A convoy with nobody bound for it or aboard is over.
 */
function convoySystem(world: World): void {
  if (world.convoyPort.size === 0) return;
  const f = world.formations;
  const c = f.cols;
  const w = world.cells.w;
  const water = portSeaOf(world);
  for (const [fleet, port] of [...world.convoyPort].sort((a, b) => a[0] - b[0])) {
    if (!f.has(fleet)) {
      endConvoy(world, fleet);
      continue;
    }
    if (c.moving[fleet] === 1 || c.engaged[fleet] === 1) continue;
    const pending = [...world.seaFetch].filter(([id, o]) => o === fleet && f.has(id)).map(([id]) => id);
    const load = carrying(world, fleet);
    if (loading(world, fleet)) {
      // Its landing became a neutral's while it loaded (ROADMAP R21a): it does not sail; those
      // aboard are told and go ashore at the port, those bound are told.
      const target = convoyTarget(world, fleet);
      if (load && target >= 0 && neutralLanding(world, c.nation[fleet]!, target)) {
        for (const [id, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) if (e.fleet === fleet) world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.Neutral, NaN);
        endConvoy(world, fleet, RejectReason.Neutral);
        continue;
      }
      const room = transportRoom(world, fleet) - aboard(world, fleet);
      // Another convoy at its port for its landing still to load (ROADMAP R21e: called, or waiting
      // for those bound for it): it waits, and they sail together.
      if (load && !pending.some((id) => c.strength[id]! <= room) && [...world.convoyPort].some(([o, p]) => o !== fleet && p === port && f.has(o) && c.nation[o] === c.nation[fleet] && convoyTarget(world, o) === target && stillLoading(world, o))) continue;
      if (load && !pending.some((id) => c.strength[id]! <= room)) {
        const first = [...world.embarked].filter(([, e]) => e.fleet === fleet).sort((a, b) => a[0] - b[0])[0]![1];
        if (!orderSail(world, fleet, (first.water % w) + 0.5, Math.floor(first.water / w) + 0.5)) {
          for (const [id, e] of world.embarked) if (e.fleet === fleet) world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.NoSeaWay, NaN);
          endConvoy(world, fleet);
          continue;
        }
        if (pending.length === 0) world.convoyPort.delete(fleet);
      } else if (!load && pending.length === 0) world.convoyPort.delete(fleet);
      continue;
    }
    if (load) continue;
    if (pending.length === 0) world.convoyPort.delete(fleet);
    else if (!orderSail(world, fleet, (water[port]! % w) + 0.5, Math.floor(water[port]! / w) + 0.5)) endConvoy(world, fleet);
  }
}

/**
 * The escort of a player's new convoy on transport group `convoy` for cell `target` (ROADMAP R17d),
 * asked for by the order of formation `id`: of its nation's warfleets (no transports) standing idle
 * (not under way, in no battle, not under the player's own order, not held in place by the editor,
 * no other convoy's escort), the nearest to the landing's water by straight cells with a way there
 * (at most CALL_TRIES tried) sails there now, ahead of the transports, which wait at their port
 * for the convoy to come in. It sails under the player's order, so the AI leaves it be, until the
 * transports have put everyone ashore (`escortSystem`). None free: `ConvoyUnescorted`, and the
 * transports sail alone.
 */
export function escortConvoy(world: World, convoy: number, target: number, id: number): void {
  const f = world.formations;
  const c = f.cols;
  const nation = c.nation[id]!;
  const landing = landingOf(world, target);
  const w = world.cells.w;
  const guarding = new Set([...world.escorts.keys()]);
  const idle: [number, number][] = [];
  if (landing) {
    f.forEach((o) => {
      if (!world.isFleet(o) || c.nation[o] !== nation || transportRoom(world, o) > 0 || c.moving[o] === 1 || c.engaged[o] === 1) return;
      if (world.playerOrders.has(o) || world.station.has(o) || world.convoyPort.has(o) || guarding.has(o)) return;
      const at = cellOfPlace(world, o);
      let dx = Math.abs((at % w) - (landing.water % w));
      if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
      const dy = Math.floor(at / w) - Math.floor(landing.water / w);
      idle.push([o, dx * dx + dy * dy]);
    });
    idle.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }
  for (const [o] of idle.slice(0, CALL_TRIES)) {
    const from = cellOfPlace(world, o);
    if (!orderSail(world, o, (landing!.water % w) + 0.5, Math.floor(landing!.water / w) + 0.5)) continue;
    world.playerOrders.set(o, { kind: PlayerOrderKind.march, until: 0, through: false });
    world.escorts.set(o, { convoy, from });
    return;
  }
  world.out.emit(world.tick, EventKind.ConvoyUnescorted, id, nation, c.x[id]!, c.y[id]!);
}

/**
 * The escorts (ROADMAP R17d), hourly after the convoys: one whose transports are gone, or have no
 * convoy left and nobody aboard (all ashore, or the convoy over), is done. It is the AI's again and
 * sails back to where it came from (its port, or its place at sea), or home where it has no way there.
 */
function escortSystem(world: World): void {
  if (world.escorts.size === 0) return;
  const f = world.formations;
  const w = world.cells.w;
  for (const [o, e] of [...world.escorts].sort((a, b) => a[0] - b[0])) {
    if (!f.has(o)) {
      world.escorts.delete(o);
      continue;
    }
    if (f.has(e.convoy) && (world.convoyPort.has(e.convoy) || carrying(world, e.convoy))) continue;
    world.escorts.delete(o);
    world.playerOrders.delete(o);
    if (!orderSail(world, o, (e.from % w) + 0.5, Math.floor(e.from / w) + 0.5)) sailHome(world, o);
  }
}

/** Lands embarked formation `id` at land cell `cell`. */
function land(world: World, id: number, cell: number, target: number): void {
  const c = world.formations.cols;
  world.embarked.delete(id);
  [c.x[id], c.y[id]] = world.cellPoint(cell);
  c.org[id] = Math.min(c.org[id]!, LANDING_ORG);
  // The beachhead (PLAN 4.5b): an enemy's cell it lands on is its nation's, for the front to
  // spread from; or its owner's, where that is a living nation not at war with it (ADR-147, as
  // a flip of the front: Italy had held 18 cells of Hungary's at peace).
  const n = c.nation[id]!;
  const held = world.cells.controller[cell]!;
  if (held !== 0 && world.wars.atWar(held, n)) {
    const o = world.cells.owner[cell]!;
    const freed = o !== 0 && o !== n && world.nations.cols.living[o] === 1 && !world.wars.atWar(n, o);
    world.setController(cell, freed ? o : n, false, FlipCause.landing);
  }
  world.out.emit(world.tick, EventKind.FormationLanded, id, c.nation[id]!, c.x[id]!, c.y[id]!);
  if (target !== cell) {
    const w = world.cells.w;
    // On to its target over the land it stands on, as any march.
    orderMove(world, id, (target % w) + 0.5, Math.floor(target / w) + 0.5);
  }
}

/**
 * Where a formation of `nation`'s aboard transports standing at cell `at`, not the landing's
 * water, goes ashore (PLAN 4.8n): the land nearest within `AT_PORT_CELLS` held by its nation, its
 * supply bloc or a nation fighting beside it, or by no one; no one's not where a nation at war
 * with it holds the sea about `at` (as at the landing's own water). -1 for none: it stays aboard.
 * An enemy's coast is the landing's alone, and a neutral's no one's to land on.
 */
export function strayLanding(world: World, nation: number, at: number): number {
  const { w, h, terrain, controller } = world.cells;
  const holder = seaHolder(world, seaOf(world).zoneOf[at]!);
  const enemySea = holder !== 0 && world.wars.atWar(holder, nation);
  const bloc = blocOf(world, nation);
  const comp = navOf(world).grid.component;
  const ours = (k: number): boolean => {
    const o = controller[k]!;
    if (o === 0) return !enemySea;
    return o === nation || blocOf(world, o) === bloc || world.wars.sameSide(nation, o);
  };
  return nearestCellWhere((k) => isLand(terrain[k]!) && comp[k] !== 0 && ours(k), (at % w) + 0.5, Math.floor(at / w) + 0.5, w, h, world.atSize(AT_PORT_CELLS), world.settings.loopingMap);
}

export function amphibiousSystem(world: World): void {
  const f = world.formations;
  const c = f.cols;
  // At the port (PLAN 4.9b): a player's order over the sea, its march ended, embarks or says why not.
  if (world.seaBound.size > 0) {
    const w = world.cells.w;
    for (const [id, target] of [...world.seaBound].sort((a, b) => a[0] - b[0])) {
      if (!f.has(id)) {
        world.seaBound.delete(id);
        continue;
      }
      const bound = world.seaFetch.get(id);
      // A peace made its landing a neutral's (ROADMAP R21a): stopped where it stands, and told, as
      // a march is stopped at the border of ground that became closed to it.
      if (bound !== undefined && neutralLanding(world, c.nation[id]!, target)) {
        world.seaFetch.delete(id);
        world.seaBound.delete(id);
        if (c.moving[id] === 1) {
          c.moving[id] = 0;
          c.home[id] = 0;
          world.paths.delete(id);
        }
        world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.Neutral, NaN);
        continue;
      }
      if (c.moving[id] === 1) continue;
      // A player's, bound for its convoy's group (ROADMAP R17a, R17b): it boards when the group
      // stands loading at the port with room, and waits while it is under way or full.
      if (bound !== undefined) {
        const step = boardConvoy(world, id, target, bound);
        if (step === WAIT) continue;
        world.seaFetch.delete(id);
        world.seaBound.delete(id);
        if (step !== 0) world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, step, NaN);
        continue;
      }
      world.seaBound.delete(id);
      const why = tryLanding(world, id, (target % w) + 0.5, Math.floor(target / w) + 0.5);
      if (why !== 0) world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, why, NaN);
    }
  }
  convoySystem(world);
  escortSystem(world);
  if (world.embarked.size === 0) return;
  for (const [id, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) {
    if (!f.has(id)) {
      world.embarked.delete(id);
      continue;
    }
    if (!f.has(e.fleet)) {
      // Its transports sunk: lost at sea with them.
      world.embarked.delete(id);
      destroyFormation(world, id);
      continue;
    }
    c.x[id] = c.x[e.fleet]!;
    c.y[id] = c.y[e.fleet]!;
    if (c.moving[e.fleet] === 1 || c.engaged[e.fleet] === 1) continue;
    // Loading at its convoy's port (ROADMAP R17b): aboard until the convoy sails.
    if (loading(world, e.fleet)) continue;
    const at = cellOfPlace(world, e.fleet);
    if (at === e.water) {
      // The sea about the landing held by an enemy (PLAN 4.5b): thrown back, home with the transports.
      const holder = seaHolder(world, seaOf(world).zoneOf[e.water]!);
      if (holder !== 0 && world.wars.atWar(holder, c.nation[id]!)) {
        // A player's convoy ends with it: those still bound for it are told (ROADMAP R17b).
        endConvoy(world, e.fleet);
        e.water = -1;
        e.land = -1;
        world.out.emit(world.tick, EventKind.LandingRepulsed, id, holder, c.x[id]!, c.y[id]!);
        sailHome(world, e.fleet);
        continue;
      }
      land(world, id, e.land, e.target);
      continue;
    }
    // Stood elsewhere: ashore at the land nearest of its side or no one's (PLAN 4.8n).
    const ashore = strayLanding(world, c.nation[id]!, at);
    if (ashore >= 0) land(world, id, ashore, ashore);
  }
}
