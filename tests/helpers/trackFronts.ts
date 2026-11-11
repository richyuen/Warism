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
}

export interface StageArmies {
  /** Cells the stage gives. */
  cells: number;
  /** The nations that hold them. */
  holders: number[];
  attacker: Side;
  defender: Side;
}

export function stageArmies(w: World, by: number, of: readonly number[], ring: readonly (readonly [number, number])[]): StageArmies {
  const { w: W, h: H, owner, controller, terrain } = w.cells;
  const ofs = new Set(of);
  const take: number[] = [];
  const holders = new Set<number>();
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
  const attacker: Side = { formations: 0, men: 0, engaged: 0 };
  const defender: Side = { formations: 0, men: 0, engaged: 0 };
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
    if (f.engaged[i] === 1) x.engaged++;
  });
  return { cells: take.length, holders: held.sort((a, b) => a - b), attacker, defender };
}
