/**
 * Massing (ROADMAP R97b, ADR-1089, the user's choice: "mass, then declare"): a nation at peace that has chosen a war
 * on a land neighbour first brings its army to that border, and declares when enough of it stands there.
 *
 * Found (R97a): the operational AI allots formations to a front that has an enemy on it, so as a war was declared
 * the attacker's army stood where its last war or the start had left it: in 118 of 221 of the AI's wars between
 * leaders with a land border the attacker had no man within 300 km of the border, and there the defender was ahead
 * in land after a month more often than the attacker.
 *
 * The strategic AI's choice of a war (`strategicAi`, as before: its utility, its draw, `firstNotOutnumbered`) begins a
 * massing where it declared (`beginMassing`), when the chooser is in no war, its army is the AI's to order, and it
 * holds land beside land the target holds. Else it declares at once, as before: a nation at war has its army on its
 * fronts by the operational AI, and a war over the sea is the landings'.
 *
 * Each day (`massStep`) for each nation massing, in the order of their numbers:
 * - It is given up when the nation or the target is dead, the nation is at war (its army is wanted there), the
 *   diplomacy's or the army's layer of its AI is off, the war may no longer be declared (`whyNotWar`), it no longer
 *   holds land beside the target's, or MASS_DAYS have passed.
 * - The border: its cells beside the target's, in sectors of MASS_SECTOR_CELLS; a sector's point is its cell nearest
 *   its middle. A formation is at the border within MASS_NEAR_CELLS of a point.
 * - It declares (`declareWar`) when MASS_READY of its men on the border's land (its land formations' there; those
 *   over a sea are not counted) are at the border, if the strategic AI would still declare it (`still`); else it
 *   is given up.
 * - Else MASS_SHARE of its formations are to be at the border or on the march to a point: the nearest of the others
 *   are ordered to their nearest point (`askMove`), one refused left where it is.
 *
 * A massing given up after MASS_DAYS bars its target to that nation for MASS_BAR_DAYS (`World.massBarred`): a border
 * its army does not come to (Brazil's with Colombia, over the Amazon) is not tried again each week.
 * A nation in a war prepares none, and declares a second war on a land neighbour only where MASS_SECOND of its men
 * already stand at that border (`unprepared`): its army is on its fronts, and a war begun where none of it stands
 * was the same empty front.
 *
 * The target's answer (ROADMAP R103, ADR-1093): a nation that sees an army gathered at its border brings its own
 * there. Seen: MASS_SEEN of the massing nation's men on the border's land stand at the border. The target then, each
 * day while it is so, orders its formations to its own points of that border as the massing nation does its own
 * (MASS_SHARE of them, the nearest first), if it is in no war (its army is on its fronts), prepares no war of its
 * own, and its army is its AI's. Massed on by two, it answers the one with the more men at its border (the lower
 * number on a tie). It does nothing else: no alliance asked, no war of its own. A massing given up leaves its army
 * where it stands. No state: read from `World.massing` each day.
 *
 * State: `World.massing` and `World.massBarred`, saved while not empty.
 */
import { Refusal } from '../../shared/commands';
import { EventKind } from '../../shared/events';
import { hypot } from '../core/dmath';
import { passageOf } from '../systems/movement';
import { declareWar, whyNotWar } from '../systems/war';
import { navOf, type World } from '../world';
import { AiLayer, aiRuns, playerHeld } from './layers';
import { askMove } from './operational';

/** A massing is given up after this many days (45 tried: the Soviet Union on Finland or Turkey, France on Germany did not arrive; 90: a fifth more wars prepared, the defender ahead after a month in 8 % where 16 %). */
export const MASS_DAYS = 90;
/** A formation is at the border within this many cells of one of its points (300 km at the 1938 map's size). */
export const MASS_NEAR_CELLS = 15;
/** The side of a sector of the border, cells: one point a sector. */
export const MASS_SECTOR_CELLS = 4;
/** The share of its land formations a nation brings to the border. */
export const MASS_SHARE = 0.7;
/** It declares when this share of its men are at the border. */
export const MASS_READY = 0.5;
/** A target whose massing was given up after MASS_DAYS is not chosen again by that nation for this many days. */
export const MASS_BAR_DAYS = 365;
/** A nation in a war declares on a land neighbour only with this share of its men at that border. */
export const MASS_SECOND = 0.15;
/** A massing is seen by its target when this share of the massing nation's men stand at the border (ROADMAP R103). */
export const MASS_SEEN = 0.25;

/** A probe's switch (`tools/diag/warOpening.ts --no-massing`; a test): off, wars are declared as before R97b; `noAnswer`, the target does nothing of a massing, as before R103. Never set by the game. */
export const MASS_PROBE: { off: boolean; days?: number; second?: number; noAnswer?: boolean; alone?: boolean } = { off: false };

/** Whether `n` is in a war. */
function inWar(world: World, n: number): boolean {
  return world.wars.list.some((w) => w.sides[0].includes(n) || w.sides[1].includes(n));
}

/**
 * The points of `n`'s border with `t`: of its cells that have a neighbour (of four) held by `t`, one a sector of
 * MASS_SECTOR_CELLS, the cell nearest the sector's cells' middle (the least cell of those as near); ascending.
 */
export function massPoints(world: World, n: number, t: number): number[] {
  const { w, h, controller } = world.cells;
  const bits = world.borderBits();
  const sectors = new Map<number, number[]>();
  for (let word = 0; word < bits.length; word++) {
    let b = bits[word]!;
    while (b !== 0) {
      const low = b & -b;
      const c = (word << 5) + (31 - Math.clz32(low));
      b ^= low;
      if (controller[c] !== n) continue;
      const x = c % w;
      const beside = (c >= w && controller[c - w] === t) || (c < (h - 1) * w && controller[c + w] === t) || controller[x > 0 ? c - 1 : c + w - 1] === t || controller[x < w - 1 ? c + 1 : c - w + 1] === t;
      if (!beside) continue;
      const key = Math.floor(Math.floor(c / w) / MASS_SECTOR_CELLS) * 65536 + Math.floor(x / MASS_SECTOR_CELLS);
      const list = sectors.get(key);
      if (list) list.push(c);
      else sectors.set(key, [c]);
    }
  }
  const points: number[] = [];
  for (const key of [...sectors.keys()].sort((a, b) => a - b)) {
    const cells = sectors.get(key)!;
    let [mx, my] = [0, 0];
    for (const c of cells) {
      mx += c % w;
      my += Math.floor(c / w);
    }
    mx /= cells.length;
    my /= cells.length;
    let best = cells[0]!;
    let bestD = Infinity;
    for (const c of cells) {
      const d = hypot((c % w) - mx, Math.floor(c / w) - my);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    points.push(best);
  }
  return points.sort((a, b) => a - b);
}

/**
 * Begins `n`'s massing against `t` on `day` (tick / 24), where the strategic AI would declare. False when it is to
 * declare at once, as before: it is in a war, its army is not its AI's, it holds no land beside `t`'s, or `t` is its
 * neighbour by a colony only (`atHome` false; Britain and the Netherlands on Borneo, France and they in Guiana). True when
 * it masses (or masses already, against whomever: one war is prepared at a time).
 */
export function beginMassing(world: World, n: number, t: number, day: number, atHome = true): boolean {
  if (MASS_PROBE.off) return false;
  if (world.massing.has(n)) return true;
  // A neighbour by a colony only (`homeNeighbours`): a war across the sea to the strategic AI, and the landings'.
  if (!atHome) return false;
  if (inWar(world, n) || !aiRuns(world, n, AiLayer.army)) return false;
  if (massPoints(world, n, t).length === 0) return false;
  world.massing.set(n, { target: t, since: day });
  return true;
}

/** How far cell `c` is from point (x, y), cells; over the seam where the map loops. */
function away(world: World, x: number, y: number, c: number): number {
  const w = world.cells.w;
  let dx = Math.abs((c % w) + 0.5 - x);
  if (world.settings.loopingMap && dx > w / 2) dx = w - dx;
  return hypot(dx, Math.floor(c / w) + 0.5 - y);
}

interface Standing {
  /** Its land formations: how far each is from its nearest point, which point, and whether it marches to a point. */
  mine: { id: number; near: number; point: number; marching: boolean }[];
  men: number;
  /** The men of those within MASS_NEAR_CELLS of a point. */
  menNear: number;
}

/**
 * Where `n`'s land formations stand against the border's `points` (not empty): those on the land of a point
 * (`NavGrid.component`). Its men over a sea, in a colony or at home, are not this border's army: they could not
 * walk to it, and counted they kept a nation with an army elsewhere from ever being ready.
 */
function standing(world: World, n: number, points: readonly number[]): Standing {
  const f = world.formations.cols;
  const w = world.cells.w;
  const comp = navOf(world).grid.component;
  const lands = new Set(points.map((p) => comp[p]!));
  const mine: Standing['mine'] = [];
  const pointSet = new Set(points);
  let men = 0;
  let menNear = 0;
  world.formations.forEach((id) => {
    if (f.nation[id] !== n || world.isFleet(id) || world.isWing(id) || world.embarked.has(id)) return;
    if (!lands.has(comp[Math.floor(f.y[id]!) * w + Math.floor(f.x[id]!)]!)) return;
    men += f.strength[id]!;
    let near = Infinity;
    let point = points[0]!;
    for (const p of points) {
      const d = away(world, f.x[id]!, f.y[id]!, p);
      if (d < near) {
        near = d;
        point = p;
      }
    }
    if (near <= MASS_NEAR_CELLS) menNear += f.strength[id]!;
    mine.push({ id, near, point, marching: f.moving[id] === 1 && pointSet.has(f.targetCell[id]!) });
  });
  return { mine, men, menNear };
}

/**
 * The neighbours `n` is not to choose for a war on `day` (the module's head): those barred after a massing given up,
 * and, when it is in `wars` wars already, those at whose border it has under MASS_SECOND of its men. A neighbour it
 * holds no land beside, or only a colony's (`atHome`, the strategic AI's `homeNeighbours`), is not one: that war is
 * the landings'.
 */
export function unprepared(world: World, n: number, neighbours: readonly number[], day: number, wars: number, atHome: (t: number) => boolean = () => true): Set<number> {
  const out = new Set<number>();
  if (MASS_PROBE.off) return out;
  for (const t of neighbours) {
    const key = n * 65536 + t;
    const until = world.massBarred.get(key);
    if (until !== undefined) {
      if (day < until) {
        out.add(t);
        continue;
      }
      world.massBarred.delete(key);
    }
    if (wars === 0 || !atHome(t)) continue;
    const points = massPoints(world, n, t);
    if (points.length === 0) continue;
    const s = standing(world, n, points);
    if (s.menNear < (MASS_PROBE.second ?? MASS_SECOND) * s.men) out.add(t);
  }
  return out;
}

/**
 * The day's step of every massing (the module's head); `day`: tick / 24. `still(n, t)`: whether the strategic AI
 * would still declare `n`'s war on `t` today by its rules that `whyNotWar` does not hold (its gold, the pile of
 * realms of ADR-1042, the blocs' deterrence of ADR-981), asked as the war is to be declared: weeks have passed
 * since it was chosen, and alliances are made in them. A war it would not is given up. `alone(n, t)`: whether `t`
 * is the only neighbour `n` has (ROADMAP R123): its massing past its days is then a declaration, not a bar.
 */
export function massStep(world: World, day: number, still: (n: number, t: number) => boolean, alone: (n: number, t: number) => boolean = () => false): void {
  const nc = world.nations.cols;
  // The bars past their day or of a nation that is no more, once a month.
  if (world.massBarred.size > 0 && day % 30 === 0) {
    for (const [key, until] of [...world.massBarred]) if (day >= until || nc.living[key >>> 16] !== 1 || nc.living[key & 65535] !== 1) world.massBarred.delete(key);
  }
  // Told of once a massing (ROADMAP R122): those of massings over are forgotten.
  for (const n of [...world.massTold]) if (!world.massing.has(n)) world.massTold.delete(n);
  if (world.massing.size === 0) return;
  /** The massings seen today, by target: the massing nation with the most men at that border. */
  const seen = new Map<number, { by: number; menNear: number }>();
  for (const [n, m] of [...world.massing].sort((a, b) => a[0] - b[0])) {
    const t = m.target;
    const over =
      nc.living[n] !== 1 ||
      nc.living[t] !== 1 ||
      !aiRuns(world, n, AiLayer.diplomacy) ||
      !aiRuns(world, n, AiLayer.army) ||
      inWar(world, n) ||
      whyNotWar(world, n, t) !== Refusal.None;
    const late = day - m.since > (MASS_PROBE.days ?? MASS_DAYS);
    const points = over || late ? [] : massPoints(world, n, t);
    if (points.length === 0) {
      world.massing.delete(n);
      // Given up for its time: its army did not come to that border. Not tried again for MASS_BAR_DAYS. But a nation
      // with no other neighbour (`alone`; ROADMAP R123, ADR-1106, the user's decision) declares all the same, if it
      // still would: barred from its one neighbour it had no war at all (critic run 73, R73-N3: worlds of two nations
      // with a war in their first month had none in ten years), and a war begun with its army away is a war.
      if (late && !over) {
        if (MASS_PROBE.alone !== false && alone(n, t) && still(n, t)) declareWar(world, n, t);
        else world.massBarred.set(n * 65536 + t, day + MASS_BAR_DAYS);
      }
      continue;
    }
    const { mine, men, menNear } = standing(world, n, points);
    if (men > 0 && menNear >= MASS_READY * men) {
      world.massing.delete(n);
      if (still(n, t)) declareWar(world, n, t);
      continue;
    }
    gather(world, n, mine);
    // Seen: told of, once (ROADMAP R122).
    if (men > 0 && menNear >= MASS_SEEN * men && !world.massTold.has(n)) {
      world.massTold.add(n);
      const p = points[Math.floor(points.length / 2)]!;
      world.out.emit(world.tick, EventKind.MassingSeen, n, t, (p % world.cells.w) + 0.5, Math.floor(p / world.cells.w) + 0.5);
    }
    // Seen by its target (ROADMAP R103): of those massing on one nation, the one with the more men at its border.
    if (MASS_PROBE.noAnswer !== true && men > 0 && menNear >= MASS_SEEN * men) {
      const was = seen.get(t);
      if (was === undefined || menNear > was.menNear) seen.set(t, { by: n, menNear });
    }
  }
  for (const [t, { by }] of [...seen].sort((a, b) => a[0] - b[0])) {
    // By now `by` may have declared on another, or `t` been declared on: a nation at war has its fronts.
    if (!world.massing.has(by) || world.massing.has(t) || nc.living[t] !== 1 || inWar(world, t) || !aiRuns(world, t, AiLayer.army)) continue;
    const points = massPoints(world, t, by);
    if (points.length > 0) gather(world, t, standing(world, t, points).mine);
  }
}

/**
 * MASS_SHARE of `n`'s formations of a border (`mine`, of `standing`) at the border or on the march to it: the nearest
 * of the rest are ordered to their nearest points (`askMove`); one refused, in a fight, on the player's order or going
 * home is left where it is.
 */
function gather(world: World, n: number, mine: Standing['mine']): void {
  const f = world.formations.cols;
  const want = Math.ceil(MASS_SHARE * mine.length);
  let have = mine.filter((x) => x.near <= MASS_NEAR_CELLS || x.marching).length;
  if (have >= want) return;
  const pass = passageOf(world, n);
  const rest = mine.filter((x) => x.near > MASS_NEAR_CELLS && !x.marching && f.retreat[x.id] === 0 && f.home[x.id] === 0 && f.engaged[x.id] !== 1 && !playerHeld(world, x.id)).sort((a, b) => a.near - b.near || a.id - b.id);
  for (const x of rest) {
    if (have >= want) break;
    if (askMove(world, x.id, x.point, pass) === 'ok') have++;
  }
}
