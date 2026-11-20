/**
 * A war across the sea it can land in (ROADMAP R139): the strategic AI does not declare a war on a nation whose side
 * its own side does not touch by land unless an army enough to fill one of its transport groups may march to a port
 * where its transports stand.
 *
 * Found (R139, ten seeds of plain 1938, 348 wars that ran a month, `.cache/r139` and PROGRESS.md): 55 had no cell held
 * by either side at day 30, 52 of them between leaders with no land border. Of the 131 wars between such leaders, 57
 * were of sides that touched by land (an ally's front), and 1 of those held nothing; of the 74 that did not, 51. Of
 * those 51 the attacker had, as it declared, under a transport group's room of free men that might march to its
 * transports in 33 (Japan's army on its front in China, Italy's one group at Mogadishu on a land its army in Italy
 * cannot march over, Germany's all on its fronts); 8 such wars of the 74 held land, by a landing weeks on.
 *
 * Free, as the landings ship them (`invasion.ts`, PLAN 7.26c3a): a land formation standing (not under way, in no fight,
 * not retreating or going home, on no player's order), not within DEPLOY_RANGE_CELLS of a cell of its nation's own front
 * on its land. It may march to a port where a transport group of its nation stands (`transportGroupsAtPort`, on no
 * player's order): on that port's land, by `mayReach` (the province graph's test of a way).
 */
import { neighbours4 } from '../nav/grid';
import { mayReach } from '../nav/provinceGraph';
import { transportGroupsAtPort } from '../systems/amphibious';
import { passageOf } from '../systems/movement';
import { frontierOf } from '../systems/territory';
import { navOf, type World } from '../world';
import { playerHeld } from './layers';
import { armyLands } from './massing';
import { DEPLOY_RANGE_CELLS } from './operational';

/** A probe's switch (`tools/diag/warOpening.ts --no-lift`): off, a war across the sea is declared as before R139. Never set by the game. */
/** `off`: no lift asked (R139's A/B); `far`: a target across the sea asked its own lift after one refused (R147's A/B); `anyLand`: a touch on any land, as before R217. */
export const LIFT_PROBE: { off: boolean; far?: boolean; anyLand?: boolean } = { off: false };

/**
 * The free men of `n` that may march to a port where a transport group of its stands (the head of the file), and the
 * room of the largest such group; 0 and 0 with none at a port.
 */
export function seaLift(world: World, n: number): { men: number; room: number } {
  const groups = transportGroupsAtPort(world, n).filter((g) => !playerHeld(world, g.fleet));
  if (groups.length === 0) return { men: 0, room: 0 };
  const room = Math.max(...groups.map((g) => g.room));
  const { w, h, controller } = world.cells;
  const front: number[] = [];
  const nb: number[] = [];
  for (const c of frontierOf(world)) {
    if (controller[c] !== n) continue;
    for (const q of neighbours4(c, w, h, world.settings.loopingMap, nb)) {
      const b = controller[q]!;
      if (b !== 0 && b !== n && world.wars.atWar(n, b)) {
        front.push(c);
        break;
      }
    }
  }
  const f = world.formations.cols;
  const nav = navOf(world);
  const comp = nav.grid.component;
  const r = world.atSize(DEPLOY_RANGE_CELLS);
  const ports = [...new Set(groups.map((g) => world.ports[g.port]!.cell))].sort((a, b) => a - b);
  const pass = passageOf(world, n);
  // A way is asked once per land and province group of the start: formations on one province go the same way.
  const known = new Map<string, boolean>();
  let men = 0;
  world.formations.forEach((id) => {
    if (f.nation[id] !== n || world.isFleet(id) || world.isWing(id) || world.offLand(id) || world.embarked.has(id)) return;
    if (f.moving[id] === 1 || f.engaged[id] === 1 || f.retreat[id] !== 0 || f.home[id] !== 0 || playerHeld(world, id)) return;
    const cell = Math.floor(f.y[id]!) * w + Math.floor(f.x[id]!);
    const land = comp[cell]!;
    for (const k of front) {
      if (comp[k] !== land) continue;
      let dx = Math.abs(f.x[id]! - ((k % w) + 0.5));
      if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
      const dy = f.y[id]! - (Math.floor(k / w) + 0.5);
      if (dx * dx + dy * dy <= r * r) return;
    }
    const key = `${land}:${nav.graph.nodeOf[cell]}`;
    let ok = known.get(key);
    if (ok === undefined) {
      ok = ports.some((p) => comp[p] === land && mayReach(nav.grid, nav.graph, cell, p, pass));
      known.set(key, ok);
    }
    if (ok) men += f.strength[id]!;
  });
  return { men, room };
}

/**
 * Whether a nation of side `a` holds land beside land a nation of side `b` holds (four neighbours, the map's loop taken).
 * With `lands`, only where the two cells' land (`NavGrid.component`) is one of them (ROADMAP R217: where side `a`'s men
 * stand, `armyLands`).
 */
export function sidesTouch(world: World, a: readonly number[], b: readonly number[], lands?: ReadonlySet<number>): boolean {
  const A = new Set(a);
  const B = new Set(b);
  const { w, h, controller } = world.cells;
  const loop = world.settings.loopingMap;
  const comp = lands === undefined ? undefined : navOf(world).grid.component;
  const on = (i: number): boolean => comp === undefined || lands!.has(comp[i]!);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const c = controller[i]!;
      const inA = A.has(c);
      if (!inA && !B.has(c)) continue;
      const other = inA ? B : A;
      if ((x + 1 < w ? other.has(controller[i + 1]!) : loop && other.has(controller[y * w]!)) && on(i)) return true;
      if (y + 1 < h && other.has(controller[i + w]!) && on(i)) return true;
    }
  }
  return false;
}

/**
 * Whether `n` may not declare on `t` for want of a lift (the head of the file): the sides `declareWar` would call
 * (`sides`) do not touch by land where a man of the declaring side stands (`armyLands`, ROADMAP R217: 89404's nation 2
 * touched its neighbours only on a land none of its men stood on), and its free men that may march to its transports
 * are fewer than the room of its largest group at a port. Asked of the target the strategic AI chose, once a
 * declaration is to be made.
 */
export function noLift(world: World, n: number, sides: [readonly number[], readonly number[]]): boolean {
  if (LIFT_PROBE.off) return false;
  if (sidesTouch(world, sides[0], sides[1], LIFT_PROBE.anyLand ? undefined : armyLands(world, sides[0]))) return false;
  const { men, room } = seaLift(world, n);
  return men < room || room === 0;
}
