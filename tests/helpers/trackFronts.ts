import { forEachCellInRing } from '../../src/sim/data/ownership';
import { kmPerCell } from '../../src/sim/data/projection';
import { Terrain } from '../../src/shared/terrain';
import { Domain, type World } from '../../src/sim/world';

/**
 * ROADMAP R66a: the armies at a stage of the historical track. The land a stage gives (cells of its ring owned by one
 * of `of` and not held by `by`), and the land formations within `BAND_KM` of it, by side: the defenders are the nations
 * that hold that land and every nation at war with `by`; the attackers `by` and every nation at war with a holder.
 */
export const BAND_KM = 120;

export interface Side {
  formations: number;
  men: number;
  engaged: number;
  /** Its formations, with their men (R66d: a window's cohort). */
  ids: [number, number][];
}

export interface StageArmies {
  /** Cells the stage gives. */
  cells: number;
  /** The nations that hold them. */
  holders: number[];
  /**
   * A front: `by` at war with one of the holders at the stage's hour (R66b). Not one: a handover at peace (Torch's
   * Vichy lands, an armistice's zone, land given back to its owner).
   */
  front: boolean;
  /**
   * A land front (R66b, ADR-969): a front whose land is joined over land (4-neighbours, no crossing of the sea) to land
   * held by the taker's side (`by` and those at war with a holder). Not one: an island taken over the
   * sea (the Netherlands Indies, the Philippines).
   */
  landFront: boolean;
  attacker: Side;
  defender: Side;
}

/**
 * `fixed`: the land and holders taken as given (R66d: a window's, fixed at its opening), the band drawn round them;
 * else the stage's land now.
 */
export function stageArmies(w: World, by: number, of: readonly number[], ring: readonly (readonly [number, number])[], fixed?: { take: readonly number[]; holders: readonly number[] }): StageArmies & { take: number[] } {
  const { w: W, h: H, owner, controller, terrain } = w.cells;
  const ofs = new Set(of);
  const take: number[] = fixed ? [...fixed.take] : [];
  const holders = new Set<number>(fixed?.holders ?? []);
  if (!fixed)
    forEachCellInRing(ring, W, H, (c) => {
      if (terrain[c]! < Terrain.Plains || !ofs.has(owner[c]!) || controller[c] === by) return;
      take.push(c);
      if (controller[c] !== 0) holders.add(controller[c]!);
    });
  const r = Math.max(1, Math.round(BAND_KM / kmPerCell(W)));
  const band = new Uint8Array(W * H);
  for (const c of take) {
    const x0 = c % W;
    const y0 = Math.floor(c / W);
    for (let dy = -r; dy <= r; dy++) {
      const y = y0 + dy;
      if (y < 0 || y >= H) continue;
      for (let dx = -r; dx <= r; dx++) band[y * W + ((((x0 + dx) % W) + W) % W)] = 1;
    }
  }
  const held = [...holders];
  const sideOf = (n: number): 'a' | 'd' | null => {
    if (n === by) return 'a';
    if (holders.has(n)) return 'd';
    if (held.some((d) => w.wars.atWar(n, d))) return 'a';
    if (w.wars.atWar(n, by)) return 'd';
    return null;
  };
  const attacker: Side = { formations: 0, men: 0, engaged: 0, ids: [] };
  const defender: Side = { formations: 0, men: 0, engaged: 0, ids: [] };
  const f = w.formations.cols;
  w.formations.forEach((i) => {
    if (w.rules?.templates[f.template[i]!]?.domain !== Domain.land || w.embarked.has(i)) return;
    const c = Math.floor(f.y[i]!) * W + ((Math.floor(f.x[i]!) % W) + W) % W;
    if (band[c] !== 1) return;
    const s = sideOf(f.nation[i]!);
    if (!s) return;
    const x = s === 'a' ? attacker : defender;
    x.formations++;
    x.men += f.strength[i]!;
    x.ids.push([i, f.strength[i]!]);
    if (f.engaged[i] === 1) x.engaged++;
  });
  const front = held.some((d) => w.wars.atWar(by, d));
  let landFront = false;
  if (front) {
    const comp = landComponents(w);
    const mine = new Set(take.map((c) => comp[c]!).filter((k) => k !== 0));
    const taken = new Set(take);
    const ours = new Map<number, boolean>();
    for (let c = 0; c < controller.length && !landFront; c++) {
      const n = controller[c]!;
      if (n === 0 || comp[c] === 0 || !mine.has(comp[c]!) || taken.has(c)) continue;
      let a = ours.get(n);
      if (a === undefined) ours.set(n, (a = sideOf(n) === 'a'));
      landFront = a;
    }
  }
  return { cells: take.length, holders: held.sort((a, b) => a - b), front, landFront, attacker, defender, take };
}

const COMPONENTS = new WeakMap<Uint8Array, Uint32Array>();

/** Each land cell's landmass (4-neighbours over land, no crossing; 0 for water), once per map. */
function landComponents(w: World): Uint32Array {
  const { w: W, h: H, terrain } = w.cells;
  let comp = COMPONENTS.get(terrain);
  if (comp) return comp;
  comp = new Uint32Array(W * H);
  const wrap = w.settings.loopingMap;
  let next = 0;
  const stack: number[] = [];
  for (let s = 0; s < W * H; s++) {
    if (comp[s] !== 0 || terrain[s]! < Terrain.Plains) continue;
    comp[s] = ++next;
    stack.push(s);
    while (stack.length > 0) {
      const c = stack.pop()!;
      const x = c % W;
      const y = Math.floor(c / W);
      for (const k of [y > 0 ? c - W : -1, y < H - 1 ? c + W : -1, x > 0 ? c - 1 : wrap ? c + W - 1 : -1, x < W - 1 ? c + 1 : wrap ? c - W + 1 : -1]) {
        if (k < 0 || comp[k] !== 0 || terrain[k]! < Terrain.Plains) continue;
        comp[k] = next;
        stack.push(k);
      }
    }
  }
  COMPONENTS.set(terrain, comp);
  return comp;
}

