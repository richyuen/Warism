/**
 * ROADMAP R33b: the landing tests' reads of the player's landings (`src/sim/systems/landings.ts`), for what
 * they read before from per-division maps (`seaFetch`: the group a division was bound for; `convoyPort`: a
 * group's convoy and its port). A division's "transports" are now its landing: one it keeps is the same
 * landing (`landingId`).
 */
import { isLand } from '../../src/shared/terrain';
import { transportsPort } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision, landingOfFleet } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';

/** The id of the landing division `id` is in; undefined for none. */
export const landingId = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.id;

/** Whether division `id` is in a landing and not aboard (marching to its port, or waiting there). */
export const isBound = (w: World, id: number): boolean => landingOfDivision(w, id) !== undefined && !w.embarked.has(id);

/** The first transport group of division `id`'s landing; undefined for none. */
export const groupOf = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.fleets[0];

/** The port (index in `ports`) of division `id`'s landing; undefined for none. */
export const portOf = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.port;

/** Whether transport group `fleet` is a landing's. */
export const hasLanding = (w: World, fleet: number): boolean => landingOfFleet(w, fleet) !== undefined;

/** Whether division `id` stands at its landing's port (ashore, or aboard while it gathers): R33b's "at the port", before, "aboard". */
export function atItsPort(w: World, id: number): boolean {
  const l = landingOfDivision(w, id);
  return l !== undefined && l.state === LandingState.gathering && w.formations.cols.moving[id] !== 1;
}

/** Whether division `id` is aboard its landing's transports at sea (the landing sailed). */
export function atSea(w: World, id: number): boolean {
  const l = landingOfDivision(w, id);
  return l !== undefined && l.state !== LandingState.gathering && w.embarked.has(id);
}

/**
 * Places divisions `ids` on land `cells[k]` straight cells (or a few more) from port `port` (index in `ports`), each
 * where its land's nearest port is that one (`transportsPort`), standing (ROADMAP R43a: a click's divisions whose own
 * port lands them a week sooner make landings of their own there; a test of one landing at one port places them so
 * that it stays one, the walk to the port days, not weeks). Returns the cells.
 */
export function nearPort(w: World, ids: readonly number[], port: number, cells: readonly number[]): number[] {
  const c = w.formations.cols;
  const W = w.cells.w;
  const at = w.ports[port]!.cell;
  const comp = navOf(w).grid.component;
  const [px, py] = [at % W, Math.floor(at / W)];
  const used = new Set<number>();
  const out: number[] = [];
  ids.forEach((id, k) => {
    const want = cells[k] ?? 0;
    let done = false;
    for (let r = want; r <= want + 6 && !done; r++) {
      for (let dy = -r; dy <= r && !done; dy++) {
        for (let dx = -r; dx <= r && !done; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const k2 = (py + dy) * W + (px + dx);
          if (used.has(k2) || !isLand(w.cells.terrain[k2]!) || comp[k2] !== comp[at] || w.cells.controller[k2] !== c.nation[id]) continue;
          [c.x[id], c.y[id]] = [px + dx + 0.5, py + dy + 0.5];
          c.moving[id] = 0;
          w.paths.delete(id);
          if (transportsPort(w, id, false) !== port) continue;
          used.add(k2);
          out.push(k2);
          done = true;
        }
      }
    }
    if (!done) throw new Error(`nearPort: no cell ${want} from ${w.ports[port]!.name} for ${id}`);
  });
  return out;
}

/** The index in `ports` of the port named `name`. */
export const portNamed = (w: World, name: string): number => w.ports.findIndex((p) => p.name === name);
