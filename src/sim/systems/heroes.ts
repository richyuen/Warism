/**
 * Heroes (PLAN 7.184, the user's request of 2026-11-01): on the new-game option `heroes`, each of
 * seven great powers of 1938 has a named land and sea unit, much stronger than any other: a
 * formation of one element of its own unit type (`TemplateRule.hero`), never built, queued or
 * placed by God.
 *
 * The roster (`World.heroRoster`) is the world's: each row a hero's nation, template and start
 * place (cells). `World.heroes` maps a hero's formation to its row, and `World.heroReturn` a row
 * whose hero is gone to the hour it comes back. All three are state, saved while not empty. A
 * hero's formation is never disbanded, laid up, folded into another or refilled by the economic
 * AI, and its template has no upkeep.
 */
import { isDayStart } from '../../shared/calendar';
import { portWater } from '../data/ports';
import { EventKind } from '../../shared/events';
import { basinOf, Domain, portSeaOf, seaOf, type World } from '../world';
import { cellX, elementIndex, equipFormation, wrapDx } from './elements';
import { zoneAt } from './navalCombat';

/** A hero of the roster: its nation, its template (index of the rules) and its start place (cells). */
export interface HeroRow {
  nation: number;
  template: number;
  x: number;
  y: number;
}

/** Whether formation `id` is a hero's. */
export function isHero(world: World, id: number): boolean {
  return world.heroes.has(id);
}

/**
 * Sets the roster and raises each row's hero at its place, whole and in supply (the start's; a
 * land hero's place is on land, a sea hero's on water: the caller's). Returns the formations, in
 * the roster's order.
 */
export function placeHeroes(world: World, roster: readonly HeroRow[]): number[] {
  world.heroRoster = roster.map((r) => ({ ...r }));
  world.heroes = new Map();
  world.heroReturn = new Map();
  world.formations.reserve(world.formations.count + roster.length);
  const ids: number[] = [];
  roster.forEach((r, row) => ids.push(raiseHero(world, row, r.x, r.y)));
  return ids;
}

/** Raises the hero of roster row `row` at (x, y), whole and in supply. */
export function raiseHero(world: World, row: number, x: number, y: number): number {
  const r = world.heroRoster[row]!;
  const f = world.formations.cols;
  const id = world.formations.create();
  f.nation[id] = r.nation;
  f.x[id] = x;
  f.y[id] = y;
  f.facing[id] = 0;
  f.template[id] = r.template;
  f.supply[id] = 1;
  f.org[id] = 1;
  equipFormation(world, id, r.template); // sets strength from the element
  world.heroes.set(id, row);
  return id;
}

/** How long a hero is gone once destroyed, hours (PLAN 7.184a2: 60 days). */
export const HERO_RETURN_HOURS = 60 * 24;
/** What a hero out of battle heals in a day, of its health (`1 − wound` of its one element). */
export const HERO_HEAL_PER_DAY = 0.05;

/**
 * A hero's formation destroyed (`destroyFormation`): its row comes back at the tick
 * HERO_RETURN_HOURS on (`heroSystem`).
 */
export function heroLost(world: World, id: number, x: number, y: number): void {
  const row = world.heroes.get(id);
  if (row === undefined) return;
  world.heroes.delete(id);
  world.heroReturn.set(row, world.tick + HERO_RETURN_HOURS);
  // Told (ROADMAP R12), but not with its nation's death, which tells itself.
  const nation = world.heroRoster[row]!.nation;
  if (world.nations.cols.living[nation] === 1) world.out.emit(world.tick, EventKind.HeroLost, nation, row, x, y);
}

/** A hero's health, 0..1: its one element's `1 − wound`; 0 when it is gone. */
export function heroHealth(world: World, id: number): number {
  const list = elementIndex(world).get(id);
  if (!world.heroes.has(id) || !list || list.length === 0) return 0;
  const ec = world.elements.cols;
  return ec.strength[list[0]!]! > 0 ? 1 - ec.wound[list[0]!]! : 0;
}

/**
 * Where row `row`'s hero comes back, cells, or null while it cannot: its start place while its
 * nation holds it (a sea hero's, the port it was raised at); else, on land, its nation's capital;
 * at sea, the water of the naval base its nation holds nearest its start, else of any port it holds
 * nearest its start (ROADMAP R10, ADR-813: with naval bases only, Richelieu waited 16,123 days in
 * ten 20-year runs, the Soviet Union of 4253 holding 12 ports, none a base). A sea hero's port is
 * on its start's basin (ROADMAP R13, ADR-816): Baku's water is the Caspian, and Sovetsky Soyuz came
 * back there and stayed for the rest of the run.
 */
/**
 * How near an enemy fleet to a port's water keeps a sea hero from coming back there, cells (ROADMAP R34i, ADR-848;
 * critic run 32, R32-N5: Sovetsky Soyuz raised on Leningrad's water under the US fleet that held it, sunk within
 * 2 to 12 hours, eight times running on 5867).
 */
export const BLOCKADE_CELLS = 2;

export function returnPlace(world: World, row: number, blockade = true): [number, number] | null {
  const r = world.heroRoster[row]!;
  const nc = world.nations.cols;
  const { w, h, controller } = world.cells;
  const sea = world.rules?.templates[r.template]?.domain === Domain.sea;
  if (!sea) {
    const cx = cellX(world, Math.floor(r.x));
    const cy = Math.floor(r.y);
    if (cx !== null && cy >= 0 && cy < h && controller[cy * w + cx] === r.nation) return [r.x, r.y];
    return world.standPoint(nc.capitalX[r.nation]!, nc.capitalY[r.nation]!);
  }
  // At sea: the naval base by its start (the one it was raised at) while held, else the nearest held;
  // with none, the nearest port held; either on its start's basin (ROADMAP R13).
  // Not where an enemy fleet holds the water (ROADMAP R34i).
  const enemy = blockade ? enemyFleets(world, r.nation) : [];
  return seaReturn(world, r, true, enemy) ?? seaReturn(world, r, false, enemy);
}

/** The places of the fleets of the nations at war with `nation`, cells, x and y in turn. */
function enemyFleets(world: World, nation: number): number[] {
  const c = world.formations.cols;
  const out: number[] = [];
  world.formations.forEach((id) => {
    if (world.isFleet(id) && world.wars.atWar(nation, c.nation[id]!)) out.push(c.x[id]!, c.y[id]!);
  });
  return out;
}

function seaReturn(world: World, r: HeroRow, bases: boolean, enemy: readonly number[] = []): [number, number] | null {
  const { w, h, controller, terrain } = world.cells;
  let best: [number, number] | null = null;
  let bestD = Infinity;
  const home = heroBasin(world, r.x, r.y);
  const sea = portSeaOf(world);
  const { zoneOf } = seaOf(world);
  const { basin } = basinOf(world);
  for (let i = 0; i < world.ports.length; i++) {
    const p = world.ports[i]!;
    if ((bases && p.navalBase < 1) || controller[p.cell] !== r.nation) continue;
    // On the start's basin (ROADMAP R13): a lake's port (Petrozavodsk) has no water of the lane graph.
    if (sea[i]! < 0 || basin[zoneOf[sea[i]!]!] !== home) continue;
    // Squared (no root: the comparison is exact on every engine).
    const dx = wrapDx(world, r.x, p.x);
    const d = dx * dx + (p.y - r.y) * (p.y - r.y);
    if (d >= bestD) continue;
    const cell = portWater(p, terrain, w, h, world.portReach, world.settings.loopingMap);
    const at = cell >= 0 ? world.seaPoint(cell) : null;
    if (!at) continue;
    let held = false;
    for (let k = 0; k < enemy.length && !held; k += 2) {
      const ex = wrapDx(world, at[0], enemy[k]!);
      const ey = enemy[k + 1]! - at[1];
      held = ex * ex + ey * ey <= BLOCKADE_CELLS * BLOCKADE_CELLS;
    }
    if (held) continue;
    bestD = d;
    best = at;
  }
  return best;
}

/**
 * The basin of the sea zone at (x, y) (`zoneAt`: the nearest zone's water within AT_PORT_CELLS),
 * or 0 off every zone (a lake no zone covers) or on one ice closes. A sea hero's is its start's
 * (ROADMAP R13, the checker's heroes rules).
 */
export function heroBasin(world: World, x: number, y: number): number {
  return basinOf(world).basin[zoneAt(world, x, y)] ?? 0;
}

/**
 * Why row `row`'s hero, gone and past its day, has not come back (ROADMAP R10): its nation is dead
 * ('revival'), or it has no place (`returnPlace`: a sea hero's nation holds no port: 'port'); null
 * while it lives, before its day, or with a place (it is back within the hour).
 */
export function heroWaits(world: World, row: number): 'revival' | 'port' | 'blockade' | null {
  const at = world.heroReturn.get(row);
  if (at === undefined || world.tick < at) return null;
  if (world.nations.cols.living[world.heroRoster[row]!.nation] !== 1) return 'revival';
  if (returnPlace(world, row) !== null) return null;
  // A port held, but each under an enemy fleet (ROADMAP R34i).
  return returnPlace(world, row, false) === null ? 'port' : 'blockade';
}

/**
 * The heroes' day (PLAN 7.184a2). Each day's start, a hero out of battle heals HERO_HEAL_PER_DAY
 * of its health, a ship anywhere. Each hour, a row whose hero is gone comes back whole at its
 * hour or after it (`HERO_RETURN_HOURS`), while its nation lives and has a place for it
 * (`returnPlace`); a dead nation's waits for its revival. Never two of a row.
 */
export function heroSystem(world: World): void {
  if (world.heroRoster.length === 0) return;
  if (isDayStart(world.tick)) {
    const ec = world.elements.cols;
    const index = elementIndex(world);
    for (const id of [...world.heroes.keys()].sort((a, b) => a - b)) {
      if (world.formations.cols.engaged[id] === 1) continue;
      const el = index.get(id)?.[0];
      if (el === undefined || ec.wound[el]! <= 0) continue;
      ec.wound[el] = Math.max(0, ec.wound[el]! - HERO_HEAL_PER_DAY);
    }
  }
  if (world.heroReturn.size === 0) return;
  for (const [row, at] of [...world.heroReturn].sort((a, b) => a[0] - b[0])) {
    if (world.tick < at) continue;
    const r = world.heroRoster[row]!;
    if (world.nations.cols.living[r.nation] !== 1) continue;
    if ([...world.heroes.values()].includes(row)) {
      world.heroReturn.delete(row);
      continue;
    }
    const place = returnPlace(world, row);
    if (!place) continue;
    world.heroReturn.delete(row);
    raiseHero(world, row, place[0], place[1]);
    world.out.emit(world.tick, EventKind.HeroReturned, r.nation, row, place[0], place[1]);
  }
}
